import os
import requests
from . import app, auth, database
from flask import json, render_template, redirect, url_for, jsonify, g
from app.forms import FormFlows
from app.models import flows, Chamada, Etapas, Execucao
from sqlalchemy import and_, or_, func
from datetime import timedelta

def carregar_info_usuario(context):
    """Busca e armazena info do usuário no flask.g"""
    if hasattr(g, 'info_user'):
        return
    user = context['user']
    user_id = user.get("oid") or user.get("id")
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

    g.info_user = {
        "displayName": info1.json().get("displayName", ""),
        "jobTitle":    info1.json().get("jobTitle", ""),
        "mail":        info1.json().get("mail", ""),
        "groups":      [grp.get("displayName", "") for grp in groups]
    }

@app.context_processor
def inject_info_user():
    return {"info_user": getattr(g, 'info_user', None)}


@app.route("/")
@auth.login_required(scopes=["User.Read"])
def index(*, context):
    user = context['user']
    carregar_info_usuario(context)
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
        title="Flask Web App Sample",
        minhas_tarefas = minhas_tarefas,
        solicitacoes = solicitacoes
    )


@app.route("/solicitacoes")
@auth.login_required
def solicitacoes(context):
    user = context.get("user", {})

    return render_template(
        "solicitacoes.html",
        user=user
    )


@app.route("/novasolicitacao")
@auth.login_required
def novasolicitacao(context):
    fluxos = flows.query.all()
    return render_template(
        'novasolicitacao.html',
        user=context['user'],
        fluxos=fluxos
    )
@app.route("/flow/<id_fluxo>")
@auth.login_required
def ini_flow(id_fluxo, context):
    fluxo = flows.query.get(id_fluxo)
    name = fluxo.nome
    return render_template(f'fluxos/{name}.html', 
        user=context['user'],
        context=context
    )


@app.route("/flow/<id_fluxo>/<id_etapa>", methods=["POST", "GET"])
@auth.login_required
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