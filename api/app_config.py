from dotenv import load_dotenv
import os

load_dotenv()

AUTHORITY = os.getenv("AUTHORITY")
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")
SESSION_TYPE = "filesystem"
SENHA_BANCO = os.getenv("senha_banco")
US_BANCO = os.getenv("us_banco")
SSH_PASSPHRASE = os.getenv("SSH_PASSPHRASE")
SS_PATH = os.getenv("ss_path")
SS_USER = os.getenv("ss_user")