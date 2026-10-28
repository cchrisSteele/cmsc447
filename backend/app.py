from flask import Flask, jsonify

app = Flask(__name__)


@app.route("/")
def home():
  return jsonify(message="Hello, World!")


@app.post("/api/login")
def login():
  pass

@app.post("/api/create_account")
def create_account():
  pass



if __name__ == "__main__":
  app.run(debug=True, port=5000)