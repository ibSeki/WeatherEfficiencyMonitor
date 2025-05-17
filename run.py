import sys
import os
from dotenv import load_dotenv
load_dotenv()

print("DB_NAME =", os.getenv('DB_NAME'))

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from routes.main import bp as main_bp


app = Flask(__name__)
app.register_blueprint(main_bp)

if __name__ == '__main__':
    app.run(debug=True)
