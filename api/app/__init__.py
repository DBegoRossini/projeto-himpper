from flask_sqlalchemy import SQLAlchemy
from identity.flask import Auth
import os
import app_config
from urllib.parse import quote_plus
from flask import Flask
from flask_session import Session
from werkzeug.middleware.proxy_fix import ProxyFix

app = Flask(__name__)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_port=1)
app.config.from_object("app_config")

Session(app)

db_host = os.getenv("DB_HOST")
db_port = os.getenv("DB_PORT")
db_name = os.getenv("DB_NAME")
db_user = os.getenv("us_banco")
db_pass = os.getenv("senha_banco")

missing_db_env = [name for name, value in {
    "DB_HOST": db_host,
    "DB_PORT": db_port,
    "DB_NAME": db_name,
    "us_banco": db_user,
    "senha_banco": db_pass,
}.items() if not value]
if missing_db_env:
    raise RuntimeError(f"Missing required database environment variables: {', '.join(missing_db_env)}")

db_url = f"postgresql://{quote_plus(db_user)}:{quote_plus(db_pass)}@{db_host}:{db_port}/{db_name}"

app.config["SQLALCHEMY_DATABASE_URI"] = db_url
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

database = SQLAlchemy(app)

auth = Auth(
    None,
    authority=app.config.get("AUTHORITY"),
    client_id=app.config.get("CLIENT_ID"),
    client_credential=app.config.get("CLIENT_SECRET"),
    redirect_uri=app.config.get("REDIRECT_URI"),
)
auth.init_app(app)

from app import routes
