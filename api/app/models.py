from app import database
from datetime import datetime
from flask_login import UserMixin


class Usuario(database.Model, UserMixin):
    id = database.Column(database.Integer, primary_key=True)
    nome = database.Column(database.String(100), nullable=False)
    email = database.Column(database.String(400), nullable=False, unique=True)
    ga_id = database.Column(database.Integer, database.ForeignKey('Acessos.id'), nullable=False)
    status = database.Column(database.String(100), nullable=False)
    criado_por = database.Column(database.Integer, database.ForeignKey('Usuario.id'), nullable=False)
    criado_em = database.Column(database.DateTime, nullable=False, default=datetime.utcnow)

class Acessos(database.Model):
    id = database.Column(database.Integer, primary_key=True)
    nome = database.Column(database.String(100), nullable=False)
    criado_em = database.Column(database.DateTime, nullable=False, default=datetime.utcnow)
    criado_por = database.Column(database.Integer, database.ForeignKey('Usuario.id'), nullable=False)

class flows(database.Model):
    id = database.Column(database.Integer, primary_key=True)
    nome = database.Column(database.String(100), nullable=False)
    area_responsavel = database.Column(database.String(100), nullable=False)
    atualizado_por = database.Column(database.Integer, database.ForeignKey('Usuario.id'), nullable=False)
    descricao = database.Column(database.String(400), nullable=True)
    atualizado_em = database.Column(database.DateTime, nullable=False, default=datetime.utcnow)
    criado_em = database.Column(database.DateTime, nullable=False, default=datetime.utcnow)
    criado_por = database.Column(database.Integer, database.ForeignKey('Usuario.id'), nullable=False)