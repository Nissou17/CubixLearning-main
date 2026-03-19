from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('main.html')

@app.route('/connect/<int:connect_id>')
def connect(connect_id):
    return render_template("main.html", connect_id=connect_id)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
