from flask import current_app as app, jsonify, request, render_template, send_file
from flask_security import auth_required, roles_required, verify_password, hash_password, current_user
from flask_restful import marshal, fields
from .tasks import create_resource_csv
from .models import User, db
from .sec import datastore
from celery.result import AsyncResult
#from .tasks import say_hello
import flask_excel as excel

@app.get('/')
def home():
    return render_template("index.html")

@app.get('/admin')
@auth_required("token")
@roles_required("admin")
def admin():
    return "Hello Admin"

@app.post('/user-login')
def user_login():
    data = request.get_json()
    print(data)
    email = data.get('email')
    if not email:
        return jsonify({"message": "Email not provided"}), 400

    user = datastore.find_user(email=email)
    print(user)

    if not user:
        return jsonify({"message": "User Not Found"}), 404

    if not user.active:
        return jsonify({"message": "Your account is deactivated. Please contact the administrator."}), 403

    if verify_password(data.get("password"), user.password):  # Use Flask-Security's verify_password
        return jsonify({
            "token": user.get_auth_token(),
            "email": user.email,
            "role": user.roles[0].name
        })
    else:
        return jsonify({"message": "Wrong Password"}), 400



@app.get('/download-csv')
def download_csv():
    task=create_resource_csv.delay()
    return jsonify({"task-id" : task.id})

@app.get('/get-csv/<task_id>')
def get_csv(task_id):
    res=AsyncResult(task_id)
    if res.ready():
        filename= res.result
        return send_file(filename, as_attachment=True)
    else:
        return {"message" : "Task Pending "},404
