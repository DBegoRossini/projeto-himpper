from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, FileField, SelectField, SelectMultipleField, DateField, TextAreaField
from wtforms.validators import DataRequired, EqualTo, ValidationError
from flask_wtf.file import FileAllowed
from .models import flows, Chamada, Etapas, Execucao
from sqlalchemy import func


class PermissoesForm(FlaskForm):
    fluxo_id = StringField('ID do Fluxo', validators=[DataRequired()])
    permissoes_antigas = StringField('Permissões', validators=[DataRequired()])
    novas_permissoes = SelectMultipleField('Novas Permissões', choices=[], validate_choice=False, validators=[DataRequired()])
    submit = SubmitField('Salvar Permissões')