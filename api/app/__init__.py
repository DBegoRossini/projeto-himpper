from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from identity.flask import Auth
import os
import app_config
from urllib.parse import quote_plus

app = Flask(__name__)
app.config.from_object(app_config)

db_host = os.getenv("DB_HOST")
db_port = os.getenv("DB_PORT")
db_name = os.getenv("DB_NAME")
db_user = os.getenv("us_banco")
db_pass = os.getenv("senha_banco")

db_url = f"postgresql://{quote_plus(db_user)}:{quote_plus(db_pass)}@{db_host}:{db_port}/{db_name}"

app.config["SQLALCHEMY_DATABASE_URI"] = db_url
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
