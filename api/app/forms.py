from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, FileField, SelectField, DateField, TextAreaField
from wtforms.validators import DataRequired, EqualTo, ValidationError
from flask_wtf.file import FileAllowed
from .models import flows, Chamada, Etapas, Execucao
from sqlalchemy import func


class FormFlows(FlaskForm):
    nome = StringField('Nome do Fluxo', validators=[DataRequired()])
    area_responsavel = SelectField('Área Responsável', choices=[('Financeiro', 'Financeiro'), ('RH', 'RH'), ('TI', 'TI')], validators=[DataRequired()])
    arquivos_forms = FileField('Arquivos do Formulário', validators=[FileAllowed(['zip'], 'Apenas arquivos zip são permitidos.'), DataRequired()])
    submit = SubmitField('Adicionar Fluxo')