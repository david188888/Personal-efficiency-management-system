from flask import Flask
from flask_restful import Api
from backend.config import Config
from backend.model import db, db_drop_and_create_all
from backend.run import bp
from flask_migrate import Migrate

app = Flask(__name__)
app.register_blueprint(bp)
app.config.from_object(Config)
db.init_app(app)
migrate = Migrate(app, db)
db_drop_and_create_all(app)




if __name__ == '__main__':
    app.run(debug=True)
