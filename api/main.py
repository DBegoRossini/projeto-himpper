from app import app, database

if __name__ == "__main__":
    with app.app_context():
        try:
            database.engine.connect()
            print("✅ Conexão OK!")
        except Exception as e:
            print(f"❌ Falha na conexão: {e}")
    
    app.run()