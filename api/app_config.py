from dotenv import load_dotenv
import os
from urllib.parse import urlparse, urlunparse

load_dotenv()

def _normalize_redirect_uri(redirect_uri):
    if not redirect_uri:
        return redirect_uri

    parsed = urlparse(redirect_uri)
    if not parsed.scheme or not parsed.netloc:
        return redirect_uri

    if parsed.path in ("", "/"):
        parsed = parsed._replace(path="/getAToken")
        return urlunparse(parsed)

    return redirect_uri


AUTHORITY = os.getenv("AUTHORITY")
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
REDIRECT_URI = _normalize_redirect_uri(os.getenv("REDIRECT_URI"))
SENHA_BANCO = os.getenv("senha_banco")
US_BANCO = os.getenv("us_banco")
SSH_PASSPHRASE = os.getenv("SSH_PASSPHRASE")
SS_PATH = os.getenv("ss_path")
SS_USER = os.getenv("ss_user")
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY environment variable is required.")
SESSION_TYPE = "filesystem"
SESSION_USE_SIGNER = True
SESSION_PERMANENT = False
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
SESSION_FILE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "flask_session")
os.makedirs(SESSION_FILE_DIR, exist_ok=True)
PERMANENT_SESSION_LIFETIME = 1800
PREFERRED_URL_SCHEME = "https"
