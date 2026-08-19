from dotenv import load_dotenv
import os

load_dotenv()

AUTHORITY =  {{impperFlows.AUTHORITY}}
CLIENT_ID = {{impperFlows.CLIENT_ID}}
CLIENT_SECRET = {{impperFlows.CLIENT_SECRET}}
REDIRECT_URI = {{impperFlows.REDIRECT_URI}}
SENHA_BANCO = {{impperFlows.senha_banco}}
US_BANCO = {{impperFlows.us_banco}}
SESSION_TYPE = os.getenv("SESSION_TYPE", "filesystem")
SESSION_FILE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "flask_session")
SESSION_PERMANENT = False
