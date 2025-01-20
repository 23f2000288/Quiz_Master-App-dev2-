from flask import current_app as app, jsonify, request, render_template, send_file
from flask_security import auth_required, roles_required, verify_password, hash_password
from flask_restful import marshal, fields
from .models import User, db
from .sec import datastore

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

    if verify_password(data.get("password"), user.password):  # Use Flask-Security's verify_password
        return jsonify({
            "token": user.get_auth_token(),
            "email": user.email,
            "role": user.roles[0].name
        })
    else:
        return jsonify({"message": "Wrong Password"}), 400

@app.post('/api/register_user')
def user_register():
    data = request.get_json()

    # Extract required fields from the request
    fullname = data.get('fullname')
    email = data.get('email')
    password = data.get('password')
    qualification = data.get('qualification')
    dob = data.get('dob')

    # Validate required fields
    if not all([fullname, email, password, qualification, dob]):
        return jsonify({"message": "All fields are required."}), 400

    # Check if the user already exists
    existing_user = datastore.find_user(email=email)
    if existing_user:
        return jsonify({"message": "User with this email already exists."}), 400

    # Hash the password before storing
    hashed_password = hash_password(password)

    # Retrieve the student role
    student_role = datastore.find_role("stud")
    if not student_role:
        return jsonify({"message": "Student role not found. Please contact admin."}), 500

    # Create and save the new user
    try:
        new_user = datastore.create_user(
            fullname=fullname,
            email=email,
            password=hashed_password,
            qualification=qualification,
            dob=dob,
        )
        new_user.roles.append(student_role)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "User registered successfully!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500
