import os
import requests
from . import app, auth, database
from flask import json, render_template, redirect, url_for, jsonify, g
from app.forms import FormFlows
from app.models import flows, Chamada, Etapas, Execucao

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
    return render_template(
        'home.html',
        user=user,
        title="Flask Web App Sample"
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