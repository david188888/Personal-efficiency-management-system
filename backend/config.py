import os


username = 'root'
password = 'lhy040619'

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', f'mysql://{username}:{password}@localhost:3306/taskmanage')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
