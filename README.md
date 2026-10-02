# Plataforma de Automações Impper

Aplicação web para abertura e acompanhamento de solicitações e execução de fluxos internos. A interface é renderizada pelo Flask e integra autenticação Microsoft, banco PostgreSQL, TOTVS RM e webhooks do n8n.

## Funcionalidades

- Autenticação de usuários com Microsoft Identity Platform.
- Visualização de tarefas pendentes e caixa de entrada.
- Abertura e acompanhamento de solicitações e fluxos.
- Consulta do histórico e atualização de permissões dos fluxos.
- Consulta de dados de usuário e grupos pelo Microsoft Graph.
- Integração de formulários com TOTVS RM e envio de etapas para webhooks n8n.

## Tecnologias

- Python e Flask
- Flask-SQLAlchemy e SQLAlchemy
- PostgreSQL, acessado por um túnel SSH
- Microsoft Identity Platform e Microsoft Graph
- TOTVS RM e n8n
- HTML, Jinja, CSS e JavaScript

As dependências Python estão listadas em [`requirements.txt`](./requirements.txt).

## Estrutura do projeto

```text
.
├── api/
│   ├── app/
│   │   ├── routes.py       # Rotas e lógica da aplicação
│   │   ├── models.py       # Modelos do banco de dados
│   │   ├── forms.py        # Formulários
│   │   ├── templates/      # Páginas HTML/Jinja
│   │   └── static/         # CSS, JavaScript, imagens e fontes
│   ├── app_config.py       # Configuração carregada do ambiente
│   └── main.py             # Inicialização do servidor Flask
├── CriarBanco.py           # Criação das tabelas declaradas nos modelos
└── requirements.txt
```

## Pré-requisitos

- Python instalado e disponível no terminal.
- Acesso à rede e ao servidor SSH configurado pela aplicação.
- Chave privada Ed25519 autorizada para o túnel SSH.
- Acesso ao PostgreSQL `automacoes` através do túnel.
- Aplicação Microsoft Identity Platform registrada e configurada.
- Credenciais e acesso às integrações usadas pela aplicação (RM e n8n).

## Configuração

Crie um arquivo `.env` na raiz do repositório. O arquivo é ignorado pelo Git; não coloque credenciais diretamente no código nem compartilhe esse arquivo.

Configure as variáveis abaixo conforme os ambientes de desenvolvimento e homologação:

| Variável | Finalidade |
| --- | --- |
| `AUTHORITY` | Autoridade/tenant da Microsoft Identity Platform |
| `CLIENT_ID` | ID do cliente da aplicação Microsoft |
| `CLIENT_SECRET` | Segredo do cliente Microsoft |
| `REDIRECT_URI` | URI de retorno cadastrada na aplicação Microsoft |
| `ss_user` | Usuário SSH para abrir o túnel |
| `ss_path` | Caminho para a chave privada Ed25519 |
| `SSH_PASSPHRASE` | Senha da chave privada, quando aplicável |
| `us_banco` | Usuário do banco PostgreSQL |
| `senha_banco` | Senha do banco PostgreSQL |
| `rm_user` | Usuário da integração TOTVS RM |
| `rm_senha` | Senha da integração RM no formato esperado pela aplicação (Base64) |
| `n8n_user` | Usuário de autenticação dos webhooks n8n |
| `n8n_senha` | Senha de autenticação dos webhooks n8n |
| `PORT` | Porta HTTP local; o padrão é `3000` |
| `DB_SCHEMA` | Schema do PostgreSQL; o padrão é `public` |

O nome do banco usado pela aplicação é `automacoes`. O endereço do servidor SSH e os endereços dos serviços RM/n8n estão definidos no código; valide esses destinos e a conectividade com a equipe responsável antes de executar em outro ambiente.

> A autenticação Microsoft é necessária para inicializar as rotas protegidas. Use valores de desenvolvimento próprios e configure a `REDIRECT_URI` exatamente como cadastrada na aplicação Microsoft para o ambiente local.

## Instalação e execução local

No PowerShell, a partir da raiz do repositório:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Com o arquivo `.env` configurado, inicie a aplicação a partir da pasta `api`:

```powershell
Set-Location .\api
python main.py
```

O servidor escuta em `0.0.0.0` e usa a porta definida por `PORT` (ou `3000`, caso não esteja definida). Acesse `http://localhost:3000` no navegador quando estiver usando a porta padrão.

Na inicialização, a aplicação abre o túnel SSH e configura a conexão com o PostgreSQL. Portanto, uma falha de rede, de autenticação SSH ou de credenciais do banco pode impedir a inicialização.

## Banco de dados

Os modelos estão em `api/app/models.py`. Com o `.env` configurado, execute a partir da pasta `api` para criar as tabelas declaradas nos modelos:

```powershell
python -c "from app import app, database, models; ctx = app.app_context(); ctx.push(); database.create_all(); ctx.pop()"
```

O comando utiliza a mesma configuração de conexão da aplicação e requer acesso ao túnel SSH e ao banco. O repositório também contém o script `CriarBanco.py`.

## Rotas principais

| Caminho | Descrição |
| --- | --- |
| `/` | Painel inicial e tarefas do usuário |
| `/solicitacoes` | Solicitações relacionadas ao usuário |
| `/caixa-de-entrada` | Tarefas disponíveis para execução |
| `/novasolicitacao` | Seleção de fluxo para abrir solicitação |
| `/flow/<id_fluxo>` | Formulário inicial de um fluxo |
| `/historico` | Histórico de solicitações |
| `/permissoes` | Administração de permissões dos fluxos |
| `/logout` | Encerramento da sessão |

As páginas e os formulários dos fluxos estão em `api/app/templates/`.

## Observações

- Configure todos os segredos por variáveis de ambiente; não os registre no controle de versão.
- A integração com o Microsoft Graph depende das permissões concedidas ao aplicativo Microsoft.
- Os webhooks n8n e a integração RM dependem de conectividade e credenciais válidas.
- `CriarBanco.py` cria as tabelas dos modelos, mas não substitui a carga de dados de fluxos, etapas e permissões necessária para o uso funcional da aplicação.
