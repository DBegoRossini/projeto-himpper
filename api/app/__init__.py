from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from identity.flask import Auth
import os
import app_config
from sshtunnel import SSHTunnelForwarder
from paramiko import Ed25519Key

app = Flask(__name__)
app.config.from_object(app_config)

database_url = os.getenv("DATABASE_URL")
if not database_url:
    raise RuntimeError("DATABASE_URL não definida nas variáveis de ambiente do Coolify.")

app.config["SQLALCHEMY_DATABASE_URI"] = database_url
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

database = SQLAlchemy(app)

auth = None
if all(app.config.get(key) for key in ("AUTHORITY", "CLIENT_ID", "CLIENT_SECRET", "REDIRECT_URI")):
    auth = Auth(
        app,
        authority=app.config["AUTHORITY"],
        client_id=app.config["CLIENT_ID"],
        client_credential=app.config["CLIENT_SECRET"],
        redirect_uri=app.config["REDIRECT_URI"]
    )

from app import routes
