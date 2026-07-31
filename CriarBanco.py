from api.app import database, app
from api.app.models import flows, Chamada, Etapas, Execucao

with app.app_context():
    database.create_all()