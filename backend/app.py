import sys, os
# 路径问题 flask-migrate是按照backend.app.module_name搜索的，添加父级目录路径才能搜索到路径
curdir = os.path.dirname(__file__)
sys.path.append(curdir)
sys.path.append(curdir + "..\\")

from flask import Flask
from flask_restful import Api
from config import Config
from model import db, db_drop_and_create_all
from run import bp
from flask_migrate import Migrate
from flask_cors import CORS


app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})  # 允许来自任何域的跨域请求
app.register_blueprint(bp)
app.config.from_object(Config)
db.init_app(app)
migrate = Migrate(app, db)
# db_drop_and_create_all(app) 




if __name__ == '__main__':
    app.run(debug=True ,port=8080,use_reloader=False)
    
