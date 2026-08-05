import os
import requests
from functools import wraps
from . import app, auth, database
from flask import json, render_template, redirect, url_for, jsonify, g, session
from app.models import flows, Chamada, Etapas, Execucao, Notificacoes
from sqlalchemy import and_, or_, func
from datetime import timedelta
import base64


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
    if cached_info_user:
        g.info_user = cached_info_user
        carregar_notificacoes_usuario(user_id)
        return

    access_token = context['access_token']

    info1 = requests.get(
        f"https://graph.microsoft.com/v1.0/users/{user_id}?$select=id,displayName,mail,jobTitle",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    info2 = requests.get(
        f"https://graph.microsoft.com/v1.0/users/{user_id}/memberOf",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    groups = info2.json().get("value", [])

    info_user = {
        "displayName": info1.json().get("displayName", ""),
        "jobTitle":    info1.json().get("jobTitle", ""),
        "mail":        info1.json().get("mail", ""),
        "groups":      [grp.get("displayName", "") for grp in groups]
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

    g.coligadas = requests.get(
        "https://imperialempreendimentos166032.rm.cloudtotvs.com.br:8051/api/framework/v1/consultaSQLServer/RealizaConsulta/JUR.1/1/G",
        headers={"Authorization": f"Basic {credentials}"}
    )
    g.movimentos = requests.get(
        "https://imperialempreendimentos166032.rm.cloudtotvs.com.br:8051/api/framework/v1/consultaSQLServer/RealizaConsulta/TESTEDBR/1/G",
                headers={"Authorization": f"Basic {credentials}"}
)

@app.context_processor
def inject_info_user():
    return {
        "info_user": getattr(g, 'info_user', None),
        "notificacoes": getattr(g, 'notificacoes', [])
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
            Execucao.executor.like(f"%{user_oid}%"),
            *grupos_conditions
        )
    )
    .add_columns(
        Etapas.sla,
        Chamada.status,
        Etapas.nome.label("etapa_nome"),
        flows.alias.label("fluxo_nome"),
        Execucao.iniciada_em
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
            "prazo_limite": row.iniciada_em + timedelta(hours=row.sla) if row.iniciada_em else None
        })
    solicitacoes = (
        database.session.query(Chamada)
        .join(Execucao, Execucao.id_chamada == Chamada.id)
        .join(Etapas, Etapas.id == Execucao.id_etapa)
        .join(flows, flows.id == Etapas.id_flow)
        .filter(Chamada.solicitante == f"{user_oid}")
        .filter(and_(Etapas.nome == "Solicitação", Chamada.status.notin_(["Cancelado", "Finalizado", "Reprovado", "Pausado"])))
        .add_columns(
            Chamada.id,
            flows.alias.label("fluxo_nome"),
            Execucao.iniciada_em,
            Chamada.status
        )
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
    return render_template(
        "solicitacoes.html",
        user=user
    )


@app.route("/caixa-de-entrada")
@auth.login_required(scopes=["User.Read"])
@with_info_user
def caixaentrada(context):
    user = context["user"]
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
                Execucao.executor.like(f"%{user_oid}%"),
                *grupos_conditions
            )
        )\
    .add_columns(
        Chamada.id,
        flows.alias.label("fluxo_nome"),
        Chamada.data.label("data_solicitacao"),
        Etapas.nome.label("etapa_nome"),
        Chamada.status,
        Etapas.sla,
    ).all()
    pendencias = []
    for row in pendencias_raw:
        pendencias.append({
                "protocolo":   row.id,
                "tipo":        row.fluxo_nome,
                "recebida_em": row.data_solicitacao,
                "etapa_nome": row.etapa_nome,
                "status": row.status,
                "prazo_limite": row.data_solicitacao + timedelta(hours=row.sla) if row.data_solicitacao else None
            })
    return render_template(
        "caixaentrada.html",
        user=user,
        pendencias=pendencias
    )


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


@app.route("/flow/<id_fluxo>/<id_etapa>", methods=["POST", "GET"])
@auth.login_required(scopes=["User.Read"])
@with_info_user
def submit_flow(id_fluxo, id_etapa, context):
    form_data = {}
    if requests.method == "POST":
        form_data = dict(requests.form)
        files = {}
        for key in requests.files:
            files[key] = requests.files.getlist(key)
        user = context['user']
        nome = user.get("name")

        url = f"https://impper.app.n8n.cloud/webhook-test/{id_etapa}"
        data = {
        "id_fluxo": id_fluxo,
        "solicitante": nome,
        **form_data 
        }

        files = []
        for key in requests.files:
            for file in requests.files.getlist(key):
                if file.filename:
                    files.append((key, (file.filename, file.stream, file.content_type)))

        try:
            resp = requests.post(
            url,
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
        message="Solicitação enviada com sucesso!" if requests.method == "POST" else None
    )

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for('index'))

###    SELECT 	FT.DESCRICAO,
#		FCFO.CODTCF,
#		FCFO.NOMEFANTASIA
# /*RUA,
#NUMERO,
#BAIRRO,
#CEP,
#CIDADE || '/' || CODETD AS CIDEST,
#CGCCFO */
#FROM FCFO
#LEFT JOIN FTCF FT ON FCFO.CODTCF = FT.CODTCF