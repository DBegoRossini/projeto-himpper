from . import app, auth, database
from flask import render_template, redirect, url_for
from app.forms import FormFlows
from app.models import flows, Chamada, Etapas, Execucao

@app.route("/")
@auth.login_required
def index(*, context):
    return render_template(
        'home.html',
        user=context['user'],
        title="Flask Web App Sample",
    )


def get_authenticated_user_id(user):
    candidate = (
        user.get("id")
        or user.get("user_id")
        or user.get("employee_id")
        or user.get("matricula")
    )

    if candidate is None:
        return None

    try:
        return int(candidate)
    except (TypeError, ValueError):
        return None


@app.route("/solicitacoes")
@auth.login_required
def solicitacoes(context):
    status_labels = {
        "A": ("Em andamento", "warning"),
        "F": ("Finalizada", "success"),
        "C": ("Cancelada", "danger")
    }
    user = context.get("user", {})
    user_id = get_authenticated_user_id(user)

    chamadas = []

    if user_id is not None:
        chamadas = (
            Chamada.query
            .filter_by(solicitante=user_id)
            .order_by(Chamada.id.desc())
            .all()
        )

    solicitacoes_rows = []

    for chamada in chamadas:
        fluxo = flows.query.get(chamada.id_fluxo)
        ultima_execucao = (
            Execucao.query
            .filter_by(id_chamada=chamada.id)
            .order_by(Execucao.iniciada_em.desc(), Execucao.id.desc())
            .first()
        )
        etapa_atual = (
            Etapas.query.get(ultima_execucao.id_etapa)
            if ultima_execucao
            else None
        )
        status_label, status_variant = status_labels.get(
            chamada.status,
            ("Pendente", "info")
        )

        solicitacoes_rows.append({
            "id": chamada.id,
            "protocolo": f"SOL-{chamada.id:06d}",
            "tipo": fluxo.alias if fluxo else "Fluxo não encontrado",
            "area": fluxo.area_responsavel if fluxo else "-",
            "abertura": ultima_execucao.iniciada_em if ultima_execucao else None,
            "etapa": etapa_atual.nome if etapa_atual else "Aguardando início",
            "status_label": status_label,
            "status_variant": status_variant
        })

    return render_template(
        "solicitacoes.html",
        user=user,
        solicitacoes=solicitacoes_rows,
        abertas_count=sum(1 for chamada in chamadas if chamada.status == "A")
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
        user=context['user']
    )
