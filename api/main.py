from app import app, database
from dotenv import load_dotenv
load_dotenv(encoding='utf-8')

if __name__ == "__main__":
    with app.app_context():
        try:
            database.engine.connect()
            print("✅ Conexão OK!")
        except Exception as e:
            print(f"❌ Falha na conexão: {e}")
    
    app.run(host="0.0.0.0", port=3000)
