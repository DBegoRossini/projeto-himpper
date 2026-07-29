from dotenv import load_dotenv
load_dotenv(".env") 

from app import app

if __name__ == "__main__":
    app.run(debug=True)