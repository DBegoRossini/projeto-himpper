from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from identity.flask import Auth
import os
import app_config
from sshtunnel import SSHTunnelForwarder
from paramiko import Ed25519Key

app = Flask(__name__)
app.config.from_object(app_config)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'instance'))

SSH_HOST = '179.198.114.158'
SSH_PORT = 22
SSH_USER = 'debora.rossini'
SSH_KEY   = '/users/debora.rossini/.ssh/id_ed25519' 
SSH_PASSPHRASE = app_config.SSH_PASSPHRASE   
pkey = Ed25519Key.from_private_key_file(SSH_KEY, password=SSH_PASSPHRASE)

tunnel = SSHTunnelForwarder(
    (SSH_HOST, SSH_PORT),
    ssh_username=SSH_USER,
    ssh_pkey=pkey,
    remote_bind_address=('127.0.0.1', 5432)
)

tunnel.start()

app.config['SQLALCHEMY_DATABASE_URI'] = (
    f'postgresql://{app_config.US_BANCO}:{app_config.SENHA_BANCO}'
    f'@127.0.0.1:{tunnel.local_bind_port}/automacoes'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

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