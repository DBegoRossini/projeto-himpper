from dotenv import load_dotenv
import os
from redis import Redis

load_dotenv()


AUTHORITY = os.getenv("AUTHORITY")
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")
SENHA_BANCO = os.getenv("senha_banco")
US_BANCO = os.getenv("us_banco")
SSH_PASSPHRASE = os.getenv("SSH_PASSPHRASE")
SS_PATH = os.getenv("ss_path")
SS_USER = os.getenv("ss_user")
SESSION_TYPE = os.getenv("SESSION_TYPE", "filesystem")
SESSION_FILE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "flask_session")
SESSION_PERMANENT = False
"""
AUTHORITY = os.getenv("AUTHORITY")
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")
SENHA_BANCO = os.getenv("senha_banco")
US_BANCO = os.getenv("us_banco")
SSH_PASSPHRASE = os.getenv("SSH_PASSPHRASE")
SS_PATH = os.getenv("ss_path")
SS_USER = os.getenv("ss_user")
SECRET_KEY = os.getenv("SECRET_KEY")
SESSION_FILE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "flask_session")
PERMANENT_SESSION_LIFETIME = 1800
PREFERRED_URL_SCHEME = "https"
redis_url = os.getenv("SESSION_REDIS_URL") or os.getenv("REDIS_URL")
if not redis_url:
    raise RuntimeError("Defina SESSION_REDIS_URL ou REDIS_URL no ambiente.")

SESSION_TYPE = "redis"
SESSION_REDIS = Redis.from_url(redis_url, decode_responses=False)
SESSION_USE_SIGNER = True
SESSION_PERMANENT = False
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_SAMESITE = "None"
SESSION_COOKIE_HTTPONLY = True
"""