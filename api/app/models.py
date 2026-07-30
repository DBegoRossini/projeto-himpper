from . import database
from datetime import datetime

class flows(database.Model):
    id = database.Column(database.Integer, primary_key=True)
    nome = database.Column(database.String(100), nullable=False)
    alias = database.Column(database.String(100), nullable=False)
    descricao = database.Column(database.String(500), nullable=False)
    area_responsavel = database.Column(database.String(100), nullable=False)
    acesso = database.Column(database.Integer, nullable=False)
    versao = database.Column(database.String(3), nullable=False)

class Chamada(database.Model):
    id = database.Column(database.Integer, primary_key=True)
    id_fluxo = database.Column(database.Integer, database.ForeignKey("flows.id"), nullable=False)
    status = database.Column(database.String(1), nullable=False, default="A")
    solicitante = database.Column(database.Integer, nullable=False)

class Etapas(database.Model):
    id = database.Column(database.Integer, primary_key=True)
    id_flow = database.Column(database.Integer, database.ForeignKey("flows.id"), nullable=False)
    nome = database.Column(database.String(100), nullable=False)
    sla = database.Column(database.Float, nullable=False)
    responsaveis = database.Column(database.String(200), nullable=True)

class Execucao(database.Model):
    id = database.Column(database.Integer, primary_key=True)
    id_chamada = database.Column(database.Integer, database.ForeignKey("chamada.id"), nullable=False)
    id_etapa = database.Column(database.Integer, database.ForeignKey("etapas.id"), nullable=False)
    iniciada_em = database.Column(database.DateTime, nullable=False, default=datetime.utcnow)
    assumida_em = database.Column(database.DateTime, nullable=True)
    finalizada_em = database.Column(database.DateTime, nullable=True)
    executor = database.Column(database.Integer, nullable=True)