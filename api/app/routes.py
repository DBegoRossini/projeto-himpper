import os
from io import BytesIO
import requests
import time
import threading
from functools import wraps
from . import app, auth, database
from flask import  abort, render_template, redirect, send_file, url_for,  g, session, request as flask_request
from app.models import flows, Chamada, Etapas, Execucao, Notificacoes, Formularios
from sqlalchemy import cast, String, or_, and_
from datetime import datetime, timedelta
import base64

INFO_USER_CACHE_VERSION = 2
URL_RM = "https://imperialempreendimentos166032.rm.cloudtotvs.com.br:8051"

# Caches em memória para evitar 1 chamada ao Graph por linha do banco (N+1).
GROUPS_CACHE_TTL = 600
DISPLAYNAME_CACHE_TTL = 1800
_GROUPS_CACHE = {}       # user_id -> (timestamp, set(group_ids))
_DISPLAYNAME_CACHE = {}  # user_id -> (timestamp, displayName)
_groups_cache_lock = threading.Lock()
_displayname_cache_lock = threading.Lock()


def get_groups_membership(user_id, access_token):
    """Retorna os ids de grupo de um usuário, com cache para evitar chamadas repetidas ao Graph."""
    if not user_id:
        return set()
    now = time.time()
    with _groups_cache_lock:
        cached = _GROUPS_CACHE.get(user_id)
        if cached and now - cached[0] < GROUPS_CACHE_TTL:
            return cached[1]
    resp = requests.get(
        f"https://graph.microsoft.com/v1.0/users/{user_id}/memberOf?$select=id",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    grupos = set()
    if resp.ok:
        grupos = {grp.get("id") for grp in resp.json().get("value", []) if grp.get("id")}
    with _groups_cache_lock:
        _GROUPS_CACHE[user_id] = (now, grupos)
    return grupos


def get_display_names(user_ids, access_token):
    """Resolve displayName de vários ids de uma vez (cache + $batch do Graph), evitando 1 request por linha."""
    resultado = {}
    faltantes = []
    now = time.time()
    ids_unicos = {uid for uid in user_ids if uid}
    with _displayname_cache_lock:
        for uid in ids_unicos:
            cached = _DISPLAYNAME_CACHE.get(uid)
            if cached and now - cached[0] < DISPLAYNAME_CACHE_TTL:
                resultado[uid] = cached[1]
            else:
                faltantes.append(uid)

    for i in range(0, len(faltantes), 20):
        lote = faltantes[i:i + 20]
        batch_body = {
            "requests": [
                {"id": uid, "method": "GET", "url": f"/users/{uid}?$select=displayName"}
                for uid in lote
            ]
        }
        resp = requests.post(
            "https://graph.microsoft.com/v1.0/$batch",
            headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"},
            json=batch_body
        )
        if not resp.ok:
            continue
        for item in resp.json().get("responses", []):
            uid = item.get("id")
            nome = "Desconhecido"
            if item.get("status") == 200:
                nome = item.get("body", {}).get("displayName", "Desconhecido")
            resultado[uid] = nome
            with _displayname_cache_lock:
                _DISPLAYNAME_CACHE[uid] = (now, nome)

    for uid in faltantes:
        resultado.setdefault(uid, "Desconhecido")
    return resultado


# Consulta de coligadas/movimentos/centro de custo/fornecedores/contratos muda pouco, então é cacheada.
COLIGMOV_CACHE_TTL = 300
_COLIGMOV_CACHE = {"timestamp": 0, "data": None}
_coligmov_cache_lock = threading.Lock()


def _obter_coligmov(credentials):
    now = time.time()
    with _coligmov_cache_lock:
        if _COLIGMOV_CACHE["data"] is not None and now - _COLIGMOV_CACHE["timestamp"] < COLIGMOV_CACHE_TTL:
            return _COLIGMOV_CACHE["data"]
    resp = requests.get(
        f"{URL_RM}/api/framework/v1/consultaSQLServer/RealizaConsulta/JUR.1/1/G",
        headers={"Authorization": f"Basic {credentials}"}
    )
    with _coligmov_cache_lock:
        _COLIGMOV_CACHE["data"] = resp
        _COLIGMOV_CACHE["timestamp"] = now
    return resp

def carregar_notificacoes_usuario(user_id):
    notificacoes = Notificacoes.query.filter_by(usuario=user_id)\
        .order_by(Notificacoes.data_criacao.desc()).all()

    session["notificacoes"] = [
        {
            "id": n.id,
            "mensagem": n.mensagem,
            "enviada_em": n.data_criacao if n.data_criacao else None
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

    info3 = requests.get(
        f"https://graph.microsoft.com/v1.0/users/{user_id}/manager",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    info4 = requests.get(
        f"https://graph.microsoft.com/v1.0/users/{user_id}/directReports",
        headers={"Authorization": f"Bearer {access_token}"}
    )

    groups = info2.json().get("value", [])

    info_user = {
        "displayName": info1.json().get("displayName", ""),
        "jobTitle":    info1.json().get("jobTitle", ""),
        "mail":        info1.json().get("mail", ""),
        "groups":      [grp["id"] for grp in groups if grp.get("id")],
        "superior":    info3.json().get("id", ""),
        "subordinados": [sub["id"] for sub in info4.json().get("value", []) if sub.get("id")],
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

def carregar_info_form(id_fluxo):
    credentials = base64.b64encode(
        f"{os.getenv('rm_user')}:{base64.b64decode(os.getenv('rm_senha')).decode()}".encode()
    ).decode()
    user_email = g.info_user.get("mail")
    g.coligMov = _obter_coligmov(credentials)
    if id_fluxo == '4':
        print("Carregando informações do contrato")
        g.infoContrat = requests.get(
            f"{URL_RM}/api/framework/v1/consultaSQLServer/RealizaConsulta/impperflows.1/1/G",
            headers={"Authorization": f"Basic {credentials}"}
        )

        condpagamento = requests.get(
            f"{URL_RM}/api/framework/v1/consultaSQLServer/RealizaConsulta/impperflows.2/1/G",
            headers={"Authorization": f"Basic {credentials}"}
        )
        g.condpagamentoUnic = condpagamento.json()
    coligadas = {}
    movimentos = {}
    ccusto = {}
    fornecedores = {}
    contratos = {}
    dados =  g.coligMov.json()
    if isinstance(dados, dict):
        registros = dados.get("value") or dados.get("items") or dados.get("data") or []
    elif isinstance(dados, list):
        registros = dados
    
    for colig in registros:
        if colig.get("TIPO") == "COLIGADA":
            label = colig.get("LABELMOV")
            valor = colig.get("VALORMOV")
            coligadas[valor] = label
        elif colig.get("TIPO") == "MOVIMENTO":
            label = colig.get("LABELMOV")
            valor = colig.get("VALORMOV")
            movimentos[valor] = label
        elif colig.get("TIPO") == "CENTRO DE CUSTO":
            label = colig.get("LABELMOV")
            valor = colig.get("VALORMOV")
            ccusto[valor] = label
        elif colig.get("TIPO") == "FORNECEDOR":
            label = colig.get("LABELMOV")
            valor = colig.get("VALORMOV")
            fornecedores[valor] = label
        elif colig.get("TIPO") == "CONTRATO":
            label = colig.get("LABELMOV")
            valor = colig.get("VALORMOV")
            contratos[valor] = label
    g.coligadasUnic = coligadas.items()
    g.movimentosUnic = movimentos.items()
    g.ccustoUnic = ccusto.items()
    g.fornUnic = fornecedores.items()
    g.contratosUnic = contratos.items()

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
    print(g.info_user.get("superior"))
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
        Etapas.id.label("id_etapa"),
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
            "id_etapa":   row.id_etapa,
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
    groups = g.info_user.get("groups", [])

    solicitantes = Chamada.query.add_columns(Chamada.solicitante, Chamada.id).all()
    chamadas_por_solicitante = {}
    for solic in solicitantes:
        chamadas_por_solicitante.setdefault(solic.solicitante, []).append(solic.id)

    ids_por_grupo = []
    for solicitante_id, chamada_ids in chamadas_por_solicitante.items():
        grupos_solicitante = get_groups_membership(solicitante_id, context['access_token'])
        if any(grp in groups for grp in grupos_solicitante):
            ids_por_grupo.extend(chamada_ids)

    solicitacoes = Chamada.query.join(flows, flows.id == Chamada.id_fluxo)\
        .join(Execucao, Execucao.id_chamada == Chamada.id)\
        .filter(or_(
            Chamada.solicitante == f"{user_oid}",
            Chamada.solicitante.in_(g.info_user.get("subordinados", [])),
            Chamada.id.in_(ids_por_grupo)
        ))\
    .add_columns(
        Chamada.id,
        flows.alias.label("tipo"),
        Chamada.data.label("abertura_label"),
        Chamada.status.label("status_label"),
    ).order_by(Chamada.id.desc()).all()
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
    etapa_solic = Chamada.query.join(flows, flows.id == Chamada.id_fluxo)\
    .join(Execucao, Execucao.id_chamada == Chamada.id)\
    .join(Etapas, Etapas.id == Execucao.id_etapa)\
    .filter(Execucao.finalizada_em.is_(None)).add_columns(
        Etapas.responsaveis).all()
    for row in etapa_solic:
        if row.responsaveis == "Solicitante":
            grupos_conditions.append(Execucao.executor.like(f"%{user_oid}%"))
    pendencias_raw = Chamada.query.join(flows, flows.id == Chamada.id_fluxo)\
    .join(Execucao, Execucao.id_chamada == Chamada.id)\
    .join(Etapas, Etapas.id == Execucao.id_etapa)\
    .filter(Execucao.finalizada_em.is_(None))\
    .filter(
        or_(
            Etapas.responsaveis.like(f"%{user_oid}%"),
            Etapas.responsaveis.like(f"%{user_job}%"),
            and_(
                Etapas.responsaveis == "Solicitante",
                Chamada.solicitante == f"{user_oid}"
            ),
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
        Etapas.id.label("id_etapa"),
        Chamada.solicitante
    ).order_by(Chamada.id.asc()).all()

    ids_para_nome = set()
    for row in pendencias_raw:
        ids_para_nome.add(row.solicitante)
        if row.executor:
            ids_para_nome.add(row.executor)
    nomes = get_display_names(ids_para_nome, access_token)

    pendencias = []
    for row in pendencias_raw:
        pendencias.append({
                "protocolo":   row.id,
                "solicitante": nomes.get(row.solicitante, "Desconhecido"),
                "tipo":        row.fluxo_nome,
                "recebida_em": row.data_solicitacao,
                "etapa": row.etapa_nome,
                "id_etapa": row.id_etapa,
                "status_label": row.status,
                "executor": row.executor,
                "exec_name": nomes.get(row.executor) if row.executor else None,
                "prazo": row.iniciada_em + timedelta(hours=row.sla) if row.iniciada_em else None
            })
    return render_template(
        "caixaentrada.html",
        user=user,
        pendencias=pendencias,
        user_id = user_oid
    )

@app.route("/Assumir/<int:id_chamada>/<id_etapa>", methods=["POST", "GET"])
@auth.login_required(scopes=["User.Read"])
@with_info_user
def assumir_tarefa(context, id_chamada, id_etapa):
    print('COMEÇANDO ASSUMIR TAREFA')
    user = context["user"]
    user_oid = user.get("oid") or user.get("id")
    execucao = Execucao.query.filter_by(id_chamada=id_chamada, id_etapa=id_etapa).first()
    print('EXECUÇÃO ENCONTRADA:', execucao)
    print(id_chamada)
    if execucao:
        execucao.executor = user_oid
        execucao.assumida_em = datetime.utcnow()
        database.session.commit()
    return redirect(url_for("caixaentrada"))

@app.route("/abandonar/<int:id_chamada>/<id_etapa>")
@auth.login_required(scopes=["User.Read"])
@with_info_user
def abandonar_tarefa(context, id_chamada, id_etapa):
    user = context["user"]
    user_oid = user.get("oid") or user.get("id")
    execucao = Execucao.query.filter_by(id_chamada=id_chamada, executor=user_oid, id_etapa=id_etapa).first()
    if execucao:
        execucao.executor = None
        execucao.assumida_em = None
        database.session.commit()
    return redirect(url_for("caixaentrada"))

@app.route("/novasolicitacao")
@auth.login_required(scopes=["User.Read"])
@with_info_user
def novasolicitacao(context):
    user = context["user"]
    groups   = g.info_user.get("groups", [])
    user_oid = user.get("oid") or user.get("id")
    grupos_conditions = [flows.acesso.like(f"%{grupo}%") for grupo in groups]
    fluxos = flows.query.filter(\
        or_(
            flows.acesso.in_([user_oid]),
            *grupos_conditions)).all()
    print(fluxos)
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
    print(id_fluxo)
    carregar_info_form(id_fluxo)
    execucao_aberta = (
        Execucao.query
        .join(Chamada, Chamada.id == Execucao.id_chamada)
        .filter(Chamada.id_fluxo == id_fluxo, Execucao.finalizada_em.is_(None))
        .all()
    )

    ids_chamada_aberta = [e.id_chamada for e in execucao_aberta]
    forms = (
        Formularios.query
        .filter(Formularios.id_chamada.in_(ids_chamada_aberta))
        .all()
        if ids_chamada_aberta
        else []
    )
    formularios = []
    for form in forms:
        formularios.append({
            "id": form.id,
            "id_chamada": form.id_chamada,
            "campo": form.campo,
            "valor": form.valor
        })

    name = fluxo.nome
    return render_template(
        f'fluxos/{name}.html',
        user=context['user'],
        context=context,
        form_abertos=formularios,
        solicitacao = True
    )


@app.route("/flow/<id_fluxo>/<id_etapa>", methods=["POST", "GET"])
@auth.login_required(scopes=["User.Read"])
@with_info_user
def submit_flow(id_fluxo, id_etapa, context):
    form_data = {}
    if flask_request.method == "POST":
        form_data = dict(flask_request.form)
        files = {}
        for key in flask_request.files:
            files[key] = flask_request.files.getlist(key)
        user = context['user']
        url = f"https://n8n.grupoimpper.com.br/webhook/{id_etapa}"
        headers = {"Authorization": f"Basic {base64.b64encode(f'{os.getenv("n8n_user")}:{os.getenv("n8n_senha")}'.encode()).decode()}"}
        data = {
        "id_fluxo": id_fluxo,
        "solicitante": user.get("oid") or user.get("id"),
        "id_chamada": id_etapa,
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

@app.route("/exec/<id_etapa>/<id_chamada>/<id_proxet>", methods=["POST", "GET"])
@auth.login_required(scopes=["User.Read"])
@with_info_user
def execFlow(id_etapa, id_chamada, id_proxet, context):
    form_data = {}
    if flask_request.method == "POST":
        form_data = dict(flask_request.form)
        files = {}
        for key in flask_request.files:
            files[key] = flask_request.files.getlist(key)
        user = context['user']
        url = f"https://n8n.grupoimpper.com.br/webhook/{id_etapa}"
        headers = {"Authorization": f"Basic {base64.b64encode(f'{os.getenv("n8n_user")}:{os.getenv("n8n_senha")}'.encode()).decode()}"}
        print("ID PROXET:", id_proxet)
        responsavel = None
        if id_proxet not in [None, "Cancelado", "Finalizado", "Reprovado", "Pausado", "Aprovado", "Suprimentos"]:
            responsavel = Etapas.query.get(id_proxet).responsaveis
            print("RESPONSAVEL:", responsavel)
        if responsavel == "Solicitante":
            resp = Chamada.query.get(id_chamada).solicitante
        else:
            resp = None
        data = {
        "id_chamada": id_chamada,
        "id_etapa": id_proxet,
        "responsavel": resp,
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

    return redirect(url_for("caixaentrada"))


@app.route("/execucao/<int:id_chamada>/<id_etapa>")
@auth.login_required(scopes=["User.Read"])
@with_info_user
def exec_tarefas(id_chamada, id_etapa, context):
    user_oid = context['user'].get("oid") or context['user'].get("id")
    access_token = context['access_token']
    chamada_raw = Chamada.query.get(id_chamada)
    chamada=[]
   
    solicitante = requests.get(
            f"https://graph.microsoft.com/v1.0/users/{chamada_raw.solicitante}?$select=displayName",
                    headers={"Authorization": f"Bearer {access_token}"}
        )
    chamada.append({
            "id": chamada_raw.id,
            "id_fluxo": chamada_raw.id_fluxo,
            "status": chamada_raw.status,
            "solicitante": solicitante.json().get("displayName", "Desconhecido") if solicitante else None,
            "data": chamada_raw.data,
    })
    fluxo = flows.query.get(chamada[0]["id_fluxo"]) if chamada else None
    if fluxo.id == 1:
            token_us = requests.post("https://totvssign.staging.totvs.app/identityintegration/v3/auth/login", json={
                "username": "p.plataform@grupoimpper.com.br",
                "password": "$)2]4Qy7op/V5~Y"
            })
            access_token_sign = token_us.json().get('data').get('token')
            grupos_sign = requests.get("https://totvssign.staging.totvs.app/contact/v2/grupos", headers={
                "Authorization": f"Bearer {access_token_sign}"
            }).json().get('data')
            access_token = context['access_token']
            colaboradores = requests.get(
                    f"https://graph.microsoft.com/v1.0/users?$select=displayName,mail",
                            headers={"Authorization": f"Bearer {access_token}"}
                ).json().get('value', [])
    
    etapas_correcao = Etapas.query.filter(Etapas.id_flow==fluxo.id, Etapas.id.like("%-C-%")).all() if fluxo else []
    execucoes_historico = (
        Execucao.query
        .filter_by(id_chamada=id_chamada)
        .order_by(Execucao.id.asc())
        .all()
    )

    etapas_map = {
        etapa_registro.id: etapa_registro
        for etapa_registro in Etapas.query.filter_by(id_flow=fluxo.id).all()
    } if fluxo else {}

    executor_nomes = {}
    historico_etapas = []
    for execucao_registro in execucoes_historico:
        executor_nome = None
        if execucao_registro.executor:
            if execucao_registro.executor not in executor_nomes:
                resposta_executor = requests.get(
                    f"https://graph.microsoft.com/v1.0/users/{execucao_registro.executor}?$select=displayName",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                executor_nomes[execucao_registro.executor] = (
                    resposta_executor.json().get("displayName", "Desconhecido")
                    if resposta_executor
                    else "Desconhecido"
                )
            executor_nome = executor_nomes[execucao_registro.executor]

        etapa_registro = etapas_map.get(execucao_registro.id_etapa)
        historico_etapas.append({
            "id": execucao_registro.id,
            "id_etapa": execucao_registro.id_etapa,
            "nome": etapa_registro.nome if etapa_registro else execucao_registro.id_etapa,
            "iniciada_em": execucao_registro.iniciada_em,
            "assumida_em": execucao_registro.assumida_em,
            "finalizada_em": execucao_registro.finalizada_em,
            "executor": executor_nome,
            "comentario": getattr(execucao_registro, "comentario", None),
            "atual": execucao_registro.id_etapa == id_etapa
        })

    exec_raw = Execucao.query.filter_by(id_chamada=id_chamada, id_etapa=id_etapa, finalizada_em=None).first()
    if exec_raw is None:
        exec_raw = Execucao.query.filter_by(id_chamada=id_chamada).order_by(Execucao.id.desc()).first()
    execucao = []
    if exec_raw:
        if exec_raw.executor:
            executor = requests.get(
                f"https://graph.microsoft.com/v1.0/users/{exec_raw.executor}?$select=displayName",
                        headers={"Authorization": f"Bearer {access_token}"}
            )
        else:
            executor = None
        execucao.append({
                "id": exec_raw.id,
                "id_chamada": exec_raw.id_chamada,
                "id_etapa": exec_raw.id_etapa,
                "iniciada_em": exec_raw.iniciada_em,
                "finalizada_em": exec_raw.finalizada_em,
                "executor": executor.json().get("displayName", "Desconhecido") if executor else None,
                "executor_id": exec_raw.executor,
                "assumida_em": exec_raw.assumida_em,
                "etapas_correcao": etapas_correcao
            })
    etapa = Etapas.query.get(execucao[0]["id_etapa"]) if execucao else None
 
    formularios = (
        Formularios.query
        .filter_by(id_chamada=id_chamada)
        .all()
        if chamada
        else []
    )
 
    formularios_map = {
        formulario.campo: formulario
        for formulario in formularios
    }
 
    if fluxo and (fluxo.nome == "fluxo_aberturaOC" or fluxo.id == 1):
        carregar_info_form(fluxo.id)
    etapa = Etapas.query.get(execucao[0]["id_etapa"]) if execucao else None
    groups = g.info_user.get("groups", [])
    etapas_split = etapa.responsaveis.split(";")
    grupos_conditions = [grupo in etapas_split for grupo in groups]
    if True in grupos_conditions:
        us_atuante = True
    elif user_oid in etapas_split:
        us_atuante = True
    else:
        us_atuante = False
    return render_template(
        "execTarefas.html",
        user=context["user"],
        id_chamada=id_chamada,
        chamada=chamada,
        fluxo=fluxo,
        execucao=execucao,
        etapa=etapa,
        etapa_id = id_etapa,
        formularios=formularios,
        formularios_map=formularios_map,
        historico_etapas=historico_etapas,
        executor=us_atuante,
        user_id=user_oid,
        form_abertos = [],
        modo_execucao= us_atuante,
        grupoSign = grupos_sign if fluxo.id == 1 else None,
        colaboradores=colaboradores if fluxo.id == 1 else None
    )


@app.route("/arquivo/<int:id_arquivo>")
@auth.login_required(scopes=["User.Read"])
@with_info_user
def download_arquivo(id_arquivo, context):
    data = Formularios.query.filter_by(id=id_arquivo).first()
    data_splitted = data.valor.split(" - ") if data and data.valor else []
    file_bytes = base64.b64decode(data_splitted[1]) if data else None

    if not file_bytes:
        abort(404)

    mime = data_splitted[0] if data else None
    print(mime)
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

@app.route("/historico", methods=["POST", "GET"])
@auth.login_required(scopes=["User.Read"])
@with_info_user
def historico(context):
    user = context["user"]
    user_oid = user.get("oid") or user.get("id")
    groups = g.info_user.get("groups", [])
    user_job = g.info_user.get("jobTitle", "")
    grupos_conditions = [Etapas.responsaveis.like(f"%{grupo}%") for grupo in groups]

    solicitantes = Chamada.query.add_columns(Chamada.solicitante, Chamada.id).all()
    chamadas_por_solicitante = {}
    for solic in solicitantes:
        chamadas_por_solicitante.setdefault(solic.solicitante, []).append(solic.id)

    ids_por_grupo = []
    for solicitante_id, chamada_ids in chamadas_por_solicitante.items():
        grupos_solicitante = get_groups_membership(solicitante_id, context['access_token'])
        if any(grp in groups for grp in grupos_solicitante):
            ids_por_grupo.extend(chamada_ids)

    solicitacoes = Chamada.query.join(flows, flows.id == Chamada.id_fluxo)\
    .join(Execucao, Execucao.id_chamada == Chamada.id)\
    .join(Etapas, Etapas.id == Execucao.id_etapa)\
    .filter(or_(
            Chamada.solicitante == f"{user_oid}",
            Chamada.solicitante.in_(g.info_user.get("subordinados", [])),
            Chamada.id.in_(ids_por_grupo),
            Etapas.responsaveis == f"{user_oid}",
            Etapas.responsaveis.like(f"%{user_oid}%"),
            Etapas.responsaveis.like(f"%{user_job}%"),
            and_(
                Etapas.responsaveis == "Solicitante",
                Chamada.solicitante == f"{user_oid}"
            ),
            *grupos_conditions
        ))\
    .add_columns(
        Chamada.id,
        flows.alias.label("tipo"),
        Chamada.data.label("abertura_label"),
        Chamada.status.label("status_label"),
    ).order_by(Chamada.id.desc()).all()


    return render_template(
        'historico.html',
        user=context['user'],
        solicitacoes=solicitacoes,
    )

@app.route("/logout")
def logout():
    session.clear()
    return "ok", 200
#    return redirect(url_for('index'))

