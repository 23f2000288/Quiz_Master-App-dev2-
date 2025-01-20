from main import app
from application.sec import datastore  # Import the datastore
from application.models import db, User, Role
from flask_security import hash_password  # Import hash_password from Flask-Security

with app.app_context():
    db.create_all()
    admin_role=datastore.find_or_create_role(name="admin", description="owner of the app")
    stud_role=datastore.find_or_create_role(name="stud", description="user of the app")
    db.session.commit()

    if not datastore.find_user(email="admin@gmail.com"):
        admin_user=datastore.create_user(email="admin@gmail.com", 
                              password=hash_password("123"),  # Use hash_password from Flask-Security
                              role_id=admin_role.id,
                              roles=['admin'])
    if not datastore.find_user(email="stud@gmail.com"):
        stu_user=datastore.create_user(email="stud@gmail.com", 
                              password=hash_password("123"),  # Use hash_password
                              role_id=stud_role.id,
                              active=True,
                              roles=['stud'])
    db.session.commit()
