from app import database
from datetime import datetime
from flask_login import UserMixin


class Usuario(database.Model, UserMixin):
    id = database.Column(database.Integer, primary_key=True)
    nome = database.Column(database.String(400), nullable=False)
    email = database.Column(database.String(100), nullable=False)
    ga_id = database.Column(database.Integer, database.ForeignKey("acessos.id"), nullable=False)
    status = database.Column(database.String(1), nullable=False, default="A")
    criado_por = database.Column(database.Integer, nullable=True)
    criado_em = database.Column(database.DateTime, nullable=False, default=datetime.utcnow)

class Acessos(database.Model):
    id = database.Column(database.Integer, primary_key=True)
    nome = database.Column(database.String(200), nullable=False)
    criado_em = database.Column(database.DateTime, nullable=False, default=datetime.utcnow)
    criado_por = database.Column(database.Integer, database.ForeignKey("usuario.id"), nullable=True)

class flows(database.Model):
    id = database.Column(database.Integer, primary_key=True)
    nome = database.Column(database.String(100), nullable=False)
    alias = database.Column(database.String(100), nullable=False)
    descricao = database.Column(database.String(500), nullable=False)
    area_responsavel = database.Column(database.String(100), nullable=False)
    atualizado_por = database.Column(database.Integer, database.ForeignKey("usuario.id"), nullable=False)
    atualizado_em = database.Column(database.DateTime, nullable=False, default=datetime.utcnow)
    criado_em = database.Column(database.DateTime, nullable=False, default=datetime.utcnow)
    criado_por = database.Column(database.Integer, database.ForeignKey("usuario.id"), nullable=False)
    versao = database.Column(database.String(3), nullable=False)