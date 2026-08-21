from flask_sqlalchemy import SQLAlchemy
from identity.flask import Auth
import os
import app_config
from urllib.parse import quote_plus
from flask import Flask
from flask_session import Session
from werkzeug.middleware.proxy_fix import ProxyFix
import redis as redis_lib

app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_port=1)
app.config.from_object("app_config")

Session(app)

redis_url = app.config.get("SESSION_REDIS_URL") or os.getenv("SESSION_REDIS_URL") or os.getenv("REDIS_URL")
print("SESSION REDIS URL EXISTS?", bool(redis_url))

try:
    r = redis_lib.from_url(redis_url)
    print("REDIS PING:", r.ping())
except Exception as e:
    print("REDIS ERROR:", repr(e))

db_host = os.getenv("DB_HOST")
db_port = os.getenv("DB_PORT", "5432")
db_name = os.getenv("DB_NAME", "automacoes")
db_user = os.getenv("us_banco") or os.getenv("DB_USER")
db_pass = os.getenv("senha_banco") or os.getenv("DB_PASSWORD")

database_url = os.getenv("DATABASE_URL")

# Se vier URL pronta do Coolify, normaliza e sobrescreve DB para automacoes
if database_url:
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    # força uso do banco automacoes
    from urllib.parse import urlsplit, urlunsplit
    parts = urlsplit(database_url)
    database_url = urlunsplit((parts.scheme, parts.netloc, "/automacoes", parts.query, parts.fragment))
else:
    database_url = f"postgresql://{quote_plus(db_user)}:{quote_plus(db_pass)}@{db_host}:{db_port}/automacoes"

app.config["SQLALCHEMY_DATABASE_URI"] = database_url
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "connect_args": {"options": "-csearch_path=public"}
}

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
