import os
from password import username, password



class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', f'mysql://{username}:{password}@localhost:3306/taskmanage')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
