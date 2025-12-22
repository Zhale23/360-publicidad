from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def hello():
    return {'message': 'Hello'}, 200

@app.route('/test')
def test():
    return {'status': 'ok'}, 200

if __name__ == '__main__':
    print('Starting test server...')
    app.run(host='127.0.0.1', port=5000, debug=False)
