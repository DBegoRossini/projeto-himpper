from api.app import database, app
from api.app.models import Usuario, Acessos, Flows

with app.app_context():
    database.create_all()