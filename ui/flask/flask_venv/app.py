from flask import Flask

app = Flask(__name__)

@app.route('/', methods=['GET'])
def create_app():
    return '<h1>Working...</h1>'