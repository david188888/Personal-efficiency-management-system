from flask import Flask
from flask_restful import Api
from config import Config
from model import db, db_drop_and_create_all
from run import bp

app = Flask(__name__)
app.register_blueprint(bp)
app.config.from_object(Config)
db.init_app(app)
db_drop_and_create_all(app)




if __name__ == '__main__':
    app.run(debug=True)
