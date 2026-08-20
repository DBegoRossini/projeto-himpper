import os
from io import BytesIO
import requests
from functools import wraps
from . import app, auth, database
from flask import  abort, render_template, redirect, send_file, url_for,  g, session, request as flask_request
from app.models import flows, Chamada, Etapas, Execucao, Notificacoes, Formularios
from sqlalchemy import cast, String, or_, and_
from datetime import datetime, timedelta
import base64

INFO_USER_CACHE_VERSION = 2

def carregar_notificacoes_usuario(user_id):
    notificacoes = Notificacoes.query.filter_by(usuario=user_id)\
        .order_by(Notificacoes.data_criacao.desc()).all()

    session["notificacoes"] = [
        {
            "id": n.id,
            "mensagem": n.mensagem,
            "enviada_em": n.data_criacao.isoformat() if n.data_criacao else None
        }
        for n in notificacoes
    ]

    g.notificacoes = session["notificacoes"]

def carregar_info_usuario(context):
    user = context['user']
    user_id = user.get("oid") or user.get("id")

    if hasattr(g, 'info_user'):
        if not hasattr(g, 'notificacoes'):
            carregar_notificacoes_usuario(user_id)
        return

    cached_info_user = session.get("info_user")
    if cached_info_user and cached_info_user.get("cache_version") == INFO_USER_CACHE_VERSION:
        g.info_user = cached_info_user
        carregar_notificacoes_usuario(user_id)
        return

    access_token = context['access_token']

    info1 = requests.get(
        f"https://graph.microsoft.com/v1.0/users/{user_id}?$select=id,displayName,mail,jobTitle",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    info2 = requests.get(
        f"https://graph.microsoft.com/v1.0/users/{user_id}/memberOf?$select=id",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    groups = info2.json().get("value", [])

    info_user = {
        "displayName": info1.json().get("displayName", ""),
        "jobTitle":    info1.json().get("jobTitle", ""),
        "mail":        info1.json().get("mail", ""),
        "groups":      [grp["id"] for grp in groups if grp.get("id")],
        "cache_version": INFO_USER_CACHE_VERSION
    }

    session["info_user"] = info_user
    g.info_user = info_user
    carregar_notificacoes_usuario(user_id)


def with_info_user(view_func):
    @wraps(view_func)
    def wrapper(*args, **kwargs):
        context = kwargs.get("context")
        if context is not None:
            carregar_info_usuario(context)
        elif not hasattr(g, 'info_user'):
            cached_info_user = session.get("info_user")
            if cached_info_user:
                g.info_user = cached_info_user
                g.notificacoes = session.get("notificacoes", [])
            if not hasattr(g, 'notificacoes'):
                g.notificacoes = session.get("notificacoes", [])
        return view_func(*args, **kwargs)
    return wrapper

def carregar_info_form():
    credentials = base64.b64encode(
    f"{os.getenv('rm_user')}:{os.getenv('rm_senha')}".encode()).decode()
    user_email = g.info_user.get("mail")
    user = user_email.split("@")[0]
    print(user)
    g.coligMov = requests.get(
        f"https://imperialempreendimentos166032.rm.cloudtotvs.com.br:8051/api/framework/v1/consultaSQLServer/RealizaConsulta/JUR.1/1/G?parameters=USUARIO={user}",
        headers={"Authorization": f"Basic {credentials}"}
    )
    coligadas = {}
    for colig in g.coligMov.json():
        label = colig.get("LABELCOLIG")
        valor = colig.get("VALORCOLIG")
        if label not in coligadas.values() and valor not in coligadas.keys():
            coligadas[valor] = label
    g.coligadasUnic = coligadas.items()

    g.ccusto = requests.get(
        f"https://imperialempreendimentos166032.rm.cloudtotvs.com.br:8051/api/framework/v1/consultaSQLServer/RealizaConsulta/TESTEDBR/1/G?parameters=USUARIO={user}",
                headers={"Authorization": f"Basic {credentials}"}
)

@app.context_processor
def inject_info_user():
    return {
        "info_user": getattr(g, 'info_user', None),
        "notificacoes": getattr(g, 'notificacoes', [])
    }

@app.route("/_debug/request")
def _debug_request():
    from flask import request
    return {
        "host": request.host,
        "scheme": request.scheme,
        "is_secure": request.is_secure,
        "url_root": request.url_root
    }

@app.route("/")
@auth.login_required(scopes=["User.Read"])
@with_info_user
def index(*, context):
    user = context['user']
    user_oid = user.get("oid") or user.get("id")
    user_job = g.info_user.get("jobTitle", "")
    groups   = g.info_user.get("groups", [])
    grupos_conditions = [Etapas.responsaveis.like(f"%{grupo}%") for grupo in groups]
    tarefas_raw = (
    database.session.query(Chamada)
    .join(Execucao, Execucao.id_chamada == Chamada.id)
    .join(Etapas, Etapas.id == Execucao.id_etapa)
    .join(flows, flows.id == Etapas.id_flow)
    .filter(Execucao.finalizada_em.is_(None))
    .filter(and_(Execucao.assumida_em.is_(None), Execucao.executor.is_(None)))
    .filter(
        or_(
            Etapas.responsaveis.like(f"%{user_oid}%"),
            Etapas.responsaveis.like(f"%{user_job}%"),
            cast(Execucao.executor, String).like(f"%{user_oid}%"), 
            *grupos_conditions
        )
    )
    .add_columns(
        Etapas.sla,
        Chamada.status,
        Etapas.nome.label("etapa_nome"),
        flows.alias.label("fluxo_nome"),
        Execucao.iniciada_em,
        Execucao.id_chamada,
        flows.id.label("id_flow")
    ).all()
)
    minhas_tarefas = []
    for row in tarefas_raw:
        minhas_tarefas.append({
            "chamada":    row.Chamada,
            "sla":        row.sla,
            "status":     row.status,
            "etapa_nome": row.etapa_nome,
            "fluxo_nome": row.fluxo_nome,
            "id_chamada": row.id_chamada,
            "id_flow": row.id_flow,
            "prazo_limite": row.iniciada_em + timedelta(hours=row.sla) if row.iniciada_em else None
        })
    solicitacoes = (
    database.session.query(Chamada)
    .join(Execucao, Execucao.id_chamada == Chamada.id)
    .join(Etapas, Etapas.id == Execucao.id_etapa)
    .join(flows, flows.id == Etapas.id_flow)
    .filter(Chamada.solicitante == f"{user_oid}")
    .filter(Chamada.status.notin_(["Cancelado", "Finalizado", "Reprovado", "Pausado"]))
    .add_columns(
        Chamada.id,
        flows.alias.label("fluxo_nome"),
        Execucao.iniciada_em,
        Chamada.status,
        Etapas.nome
    )
    .distinct(Chamada.id)
    .all()
)
    return render_template(
        'home.html',
        user=user,
        minhas_tarefas = minhas_tarefas,
        solicitacoes = solicitacoes
    )


@app.route("/solicitacoes")
@auth.login_required(scopes=["User.Read"])
@with_info_user
def solicitacoes(context):
    user = context["user"]
    user_oid = user.get("oid") or user.get("id")
    solicitacoes = Chamada.query.join(flows, flows.id == Chamada.id_fluxo)\
    .join(Execucao, Execucao.id_chamada == Chamada.id)\
    .join(Etapas, Etapas.id == Execucao.id_etapa)\
    .filter(Chamada.solicitante == f"{user_oid}")\
    .add_columns(
        Chamada.id,
        flows.alias.label("tipo"),
        Chamada.data.label("abertura_label"),
        Etapas.nome.label("etapa"),
        Chamada.status.label("status_label"),
    ).all()
    return render_template(
        "solicitacoes.html",
        user=user,
        solicitacoes=solicitacoes
    )


@app.route("/caixa-de-entrada")
@auth.login_required(scopes=["User.Read"])
@with_info_user
def caixaentrada(context):
    user = context["user"]
    access_token = context['access_token']
    user_oid = user.get("oid") or user.get("id")
    user_job = g.info_user.get("jobTitle", "")
    groups   = g.info_user.get("groups", [])
    grupos_conditions = [Etapas.responsaveis.like(f"%{grupo}%") for grupo in groups]
    pendencias_raw = Chamada.query.join(flows, flows.id == Chamada.id_fluxo)\
    .join(Execucao, Execucao.id_chamada == Chamada.id)\
    .join(Etapas, Etapas.id == Execucao.id_etapa)\
    .filter(Execucao.finalizada_em.is_(None))\
    .filter(
        or_(
            Etapas.responsaveis.like(f"%{user_oid}%"),
            Etapas.responsaveis.like(f"%{user_job}%"),
            cast(Execucao.executor, String).like(f"%{user_oid}%"),  # ← cast aqui
            *grupos_conditions
        )
    )\
    .add_columns(
        Chamada.id,
        flows.alias.label("fluxo_nome"),
        Chamada.data.label("data_solicitacao"),
        Etapas.nome.label("etapa_nome"),
        Execucao.iniciada_em.label("iniciada_em"),
        Execucao.executor,
        Chamada.status,
        Etapas.sla,
        Chamada.solicitante
    ).all()
    pendencias = []
    for row in pendencias_raw:
        solicitante = requests.get(
            f"https://graph.microsoft.com/v1.0/users/{row.solicitante}?$select=displayName",
                    headers={"Authorization": f"Bearer {access_token}"}
        )
        executor = requests.get(
                    f"https://graph.microsoft.com/v1.0/users/{row.executor}?$select=displayName",
                            headers={"Authorization": f"Bearer {access_token}"}
                )
        pendencias.append({
                "protocolo":   row.id,
                "solicitante": solicitante.json().get("displayName", "Desconhecido"),
                "tipo":        row.fluxo_nome,
                "recebida_em": row.data_solicitacao,
                "etapa": row.etapa_nome,
                "status_label": row.status,
                "executor": row.executor,
                "exec_name": executor.json().get("displayName", "Desconhecido") if row.executor else None,
                "prazo": row.iniciada_em + timedelta(hours=row.sla) if row.iniciada_em else None
            })

    return render_template(
        "caixaentrada.html",
        user=user,
        pendencias=pendencias,
        user_id = user_oid
    )

@app.route("/Assumir/<int:id_chamada>")
@auth.login_required(scopes=["User.Read"])
@with_info_user
def assumir_tarefa(context, id_chamada):
    user = context["user"]
    user_oid = user.get("oid") or user.get("id")
    execucao = Execucao.query.filter_by(id_chamada=id_chamada, executor=None).first()
    print(execucao)
    print(id_chamada)
    if execucao:
        execucao.executor = user_oid
        execucao.assumida_em = datetime.utcnow()
        database.session.commit()
    return redirect(url_for("caixaentrada"))

@app.route("/abandonar/<int:id_chamada>")
@auth.login_required(scopes=["User.Read"])
@with_info_user
def abandonar_tarefa(context, id_chamada):
    user = context["user"]
    user_oid = user.get("oid") or user.get("id")
    execucao = Execucao.query.filter_by(id_chamada=id_chamada, executor=user_oid).first()
    print(execucao)
    print(id_chamada)
    if execucao:
        execucao.executor = None
        execucao.assumida_em = None
        database.session.commit()
    return redirect(url_for("caixaentrada"))

@app.route("/novasolicitacao")
@auth.login_required(scopes=["User.Read"])
@with_info_user
def novasolicitacao(context):
    fluxos = flows.query.all()
    return render_template(
        'novasolicitacao.html',
        user=context['user'],
        fluxos=fluxos
    )

@app.route("/flow/<id_fluxo>")
@auth.login_required(scopes=["User.Read"]) 
@with_info_user
def ini_flow(id_fluxo, context):
    fluxo = flows.query.get(id_fluxo)
    carregar_info_form()
    name = fluxo.nome
    return render_template(f'fluxos/{name}.html', 
        user=context['user'],
        context=context
    )


@app.route("/flow/<id_fluxo>/<id_etapa>/<acao>", methods=["POST", "GET"])
@auth.login_required(scopes=["User.Read"])
@with_info_user
def submit_flow(id_fluxo, id_etapa, context, acao):
    form_data = {}
    if flask_request.method == "POST":
        form_data = dict(flask_request.form)
        files = {}
        for key in flask_request.files:
            files[key] = flask_request.files.getlist(key)
        user = context['user']
        nome = user.get("name")
        print(id_etapa)
        url = f"https://n8n.grupoimpper.com.br/webhook/{id_etapa}"
        print(url)
        headers = {"Authorization": f"Basic {base64.b64encode(f'{os.getenv("n8n_user")}:{os.getenv("n8n_senha")}'.encode()).decode()}"}
        data = {
        "id_fluxo": id_fluxo,
        "solicitante": user.get("oid") or user.get("id"),
        "id_chamada": id_etapa,
        "acao": acao,
        **form_data 
        }

        files = []
        for key in flask_request.files:
            for file in flask_request.files.getlist(key):
                if file.filename:
                    files.append((key, (file.filename, file.stream, file.content_type)))

        try:
            resp = requests.post(
            url,
            headers=headers,
            data=data, 
            files=files if files else None, 
            timeout=10
        )
            print("STATUS:", resp.status_code, "BODY:", resp.text)
        except requests.exceptions.RequestException as e:
            print("ERRO DE CONEXÃO:", repr(e))

    return render_template(
        'novasolicitacao.html',
        user=context,
        fluxos=flows.query.all(),
        message="Solicitação enviada com sucesso!" if flask_request.method == "POST" else None
    )


@app.route("/execucao/<int:id_chamada>")
@auth.login_required(scopes=["User.Read"])
@with_info_user
def exec_tarefas(id_chamada, context):
    chamada = Chamada.query.get(id_chamada)
    fluxo = flows.query.get(chamada.id_fluxo) if chamada else None
    execucao = Execucao.query.filter_by(id_chamada=id_chamada, finalizada_em=None).first() if chamada else None
    etapa = Etapas.query.get(execucao.id_etapa) if execucao else None
    formulario = Formularios.query.filter_by(id_chamada=id_chamada).all() if chamada else None
    return render_template(
        "execTarefas.html",
        user=context["user"],
        id_chamada=id_chamada,
        chamada=chamada,
        fluxo=fluxo,
        execucao=execucao,
        etapa=etapa,
        formularios=formulario
    )

def detect_mime(file_bytes: bytes) -> str:
    # PDF
    if file_bytes.startswith(b'%PDF'):
        return 'application/pdf'
    # PNG
    if file_bytes.startswith(b'\x89PNG'):
        return 'image/png'
    # JPEG
    if file_bytes[:3] == b'\xff\xd8\xff':
        return 'image/jpeg'
    # DOCX / ZIP (DOCX é um ZIP internamente)
    if file_bytes[:2] == b'PK':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    # fallback
    return 'application/octet-stream'

@app.route("/arquivo/<int:id_arquivo>")
@auth.login_required(scopes=["User.Read"])
@with_info_user
def download_arquivo(id_arquivo, context):
    data = Formularios.query.filter_by(id=id_arquivo).first()
    file_bytes = base64.b64decode(data.valor) if data else None

    if not file_bytes:
        abort(404)

    mime = detect_mime(file_bytes)
    file_io = BytesIO(file_bytes)

    return send_file(
        file_io,
        as_attachment=False,
        download_name=f'{data.campo} - {data.id_chamada}.{mime.split("/")[-1]}',
        mimetype=mime
    )


@app.route("/permissoes", methods=["POST", "GET"])
@auth.login_required(scopes=["User.Read"])
@with_info_user
def permissoes(context):
    access_token = context['access_token']
    headers = {"Authorization": f"Bearer {access_token}"}

    def listar_todos(url):
        itens = []
        proxima_url = url
        while proxima_url:
            try:
                resposta = requests.get(proxima_url, headers=headers, timeout=10)
                if not resposta.ok:
                    break
                body = resposta.json()
                itens.extend(body.get("value", []))
                proxima_url = body.get("@odata.nextLink")
            except requests.exceptions.RequestException:
                break
        return itens

    grupos = listar_todos("https://graph.microsoft.com/v1.0/groups?$select=id,displayName")
    usuarios = listar_todos("https://graph.microsoft.com/v1.0/users?$select=id,displayName")

    permis = []
    for grupo in grupos:
        if grupo.get("id"):
            permis.append({
                "id": str(grupo.get("id")).strip(),
                "displayName": (grupo.get("displayName") or "").strip()
            })
    for us in usuarios:
        if us.get("id"):
            permis.append({
                "id": str(us.get("id")).strip(),
                "displayName": (us.get("displayName") or us.get("userPrincipalName") or "").strip()
            })

    # Remove duplicados por ID e ordena alfabeticamente por displayName.
    permis_unicos = {}
    for item in permis:
        permis_unicos[item["id"].lower()] = item
    opcoes_permissoes = sorted(
        permis_unicos.values(),
        key=lambda x: (x.get("displayName") or "").lower()
    )

    def normalizar_ids_acesso(valor):
        # Aceita ',' e ';' como separadores e remove entradas vazias ou '-'.
        texto = str(valor or "").replace(";", ",")
        ids = []
        for parte in texto.split(","):
            token = parte.strip()
            if not token or token == "-":
                continue
            ids.append(token)
        return ids

    permis_por_id = {
        str(p.get("id", "")).strip().lower(): p.get("displayName")
        for p in opcoes_permissoes
        if p.get("id")
    }
    
    Flows = flows.query.all()
    Fluxos = []
    for fluxo in Flows:
        ids_fluxo = normalizar_ids_acesso(fluxo.acesso)
        nomes_fluxo = [
            permis_por_id.get(item.lower(), item)
            for item in ids_fluxo
        ]
        Fluxos.append({
            "id": fluxo.id,
            "nome": fluxo.nome,
            "versao": fluxo.versao,
            "acesso_ids": ",".join(ids_fluxo),
            "acesso": ", ".join(nomes_fluxo) if nomes_fluxo else "Não informado",
            "alias": fluxo.alias,
            "area_responsavel": fluxo.area_responsavel
        })

    if flask_request.method == "POST":
        fluxo_id = (flask_request.form.get("fluxo_id") or "").strip()
        nova_permissao_raw = (flask_request.form.get("novas_permissoes") or "").strip()

        if nova_permissao_raw in ("", "-"):
            nova_permissao = ""
        else:
            ids_normalizados = normalizar_ids_acesso(nova_permissao_raw)
            nova_permissao = ",".join(ids_normalizados)

        if fluxo_id:
            try:
                fluxo_db = flows.query.filter_by(id=int(fluxo_id)).first()
                if fluxo_db is not None:
                    fluxo_db.acesso = nova_permissao
                    database.session.add(fluxo_db)
                    database.session.commit()
                    Flows = flows.query.all()
            except ValueError:
                print("ID do fluxo inválido:", fluxo_id)
            except Exception as e:
                database.session.rollback()
                print("Erro ao salvar permissões:", repr(e))

    versoes_unicas = sorted({f.versao for f in Flows if f.versao})

    return render_template(
        'permissoes.html',
        user=context['user'],
        fluxos=Fluxos,
        opcoes_permissoes=opcoes_permissoes,
        versoes_unicas=versoes_unicas,
    )

@app.route("/logout")
def logout():
    session.clear()
    return "ok", 200
#    return redirect(url_for('index'))

