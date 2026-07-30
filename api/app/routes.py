from app import app, auth, database
from flask import render_template, redirect, url_for
from app.forms import FormFlows
from app.models import Usuario, Acessos, flows

@app.route("/")
@auth.login_required
def index(*, context):
    return render_template(
        'home.html',
        user=context['user'],
        title="Flask Web App Sample",
    )

@app.route("/flow/addFlow")
@auth.login_required
def add_flow(context):
    formAddFlow = FormFlows()
    if formAddFlow.validate_on_submit():
        flow = flows(
            nome=formAddFlow.nome.data,
            area_responsavel=formAddFlow.area_responsavel.data,
            atualizado_por=context['user']['id'],
            criado_por=context['user']['id']
        )
        database.session.add(flow)
        database.session.commit()
    else:
        print(formAddFlow.errors)
    return render_template(
        'add_flow.html',
        form=formAddFlow,
        title="Adicionar Fluxo"
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
    return render_template(f'{name}.html', 
        user=context['user']
    )

