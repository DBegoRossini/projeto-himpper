from app import app, auth, database
from flask import render_template, redirect, url_for
from app.forms import FormFlows
from app.models import Usuario, Acessos, Flows

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
def add_flow():
    formAddFlow = FormFlows()
    if formAddFlow.validate_on_submit():
        flow = Flows(
            nome=formAddFlow.nome.data,
            area_responsavel=formAddFlow.area_responsavel.data,
            atualizado_por=auth['user']['id'],
            criado_por=auth['user']['id']
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


#@app.route("/flow/<id_fluxo>")
#@auth.login_required
#render_template(url_for('flow.html', id_fluxo=id_fluxo))