# app.py
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/project/masa-madre')
def masa_madre():
    project_name = 'masa_madre'
    return render_template(f'projects/{project_name}.html')

@app.route('/project/thiswasneverexisted')
def thiswasneverexisted():
    project_name = 'thiswasneverexisted'
    return render_template(f'projects/{project_name}.html')

@app.route('/project/foundry-24')
def foundry_24():
    project_name = 'foundry_24'
    return render_template(f'projects/{project_name}.html')

if __name__ == '__main__':
    app.run()