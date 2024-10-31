from flask import Flask, request, jsonify


app = Flask(__name__)


@app.route("/hello")
def hello_world():
    return "Hello, World!"

