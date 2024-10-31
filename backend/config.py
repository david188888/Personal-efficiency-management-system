import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'mysql://root:lhy040619@localhost:3306/taskmanage')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
