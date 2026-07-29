from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from identity.flask import Auth
import app_config
from urllib.parse import quote_plus

app = Flask(__name__)
app.config.from_object(app_config)

DB_USER = "root"
DB_PASSWORD = quote_plus("$)2]4Qy7op/V5~Y")
DB_HOST =  "localhost"
DB_NAME = "sys"
SECRET_KEY = "f238c63c6df4c9ad67d92046de66f5c6"

app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
app.config['SECRET_KEY'] = SECRET_KEY

database = SQLAlchemy(app)

auth = Auth(
    app,
    authority=app.config["AUTHORITY"],
    client_id=app.config["CLIENT_ID"],
    client_credential=app.config["CLIENT_SECRET"],
    redirect_uri=app.config["REDIRECT_URI"]
)

from app import routes 