from flask import current_app as app, jsonify, request, render_template, send_file, abort
from flask_security import auth_required, roles_required, verify_password, hash_password, current_user
from flask_restful import marshal, fields
from .tasks import create_resource_csv, create_admin_resource_csv
from .models import User, db
from .sec import datastore
from celery.result import AsyncResult
import flask_excel as excel
from io import BytesIO

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
    
    email = data.get('email')
    if not email:
        return jsonify({"message": "Email not provided"}), 400

    user = datastore.find_user(email=email)
    

    if not user:
        return jsonify({"message": "User Not Found"}), 404

    if not user.active:
        return jsonify({"message": "Your account is deactivated. Please contact the administrator."}), 403

    if verify_password(data.get("password"), user.password): 
        return jsonify({
            "token": user.get_auth_token(),
            "email": user.email,
            "role": user.roles[0].name
        })
    else:
        return jsonify({"message": "Wrong Password"}), 400


"""
@app.route('/download-csv', methods=['GET'])
@roles_required('stud')
def download_csv():
    task = create_resource_csv.delay()
    return jsonify({"task_id": task.id}), 202




@app.get('/get-csv/<task_id>')
@roles_required('stud')
def get_csv(task_id):
    res=AsyncResult(task_id)
    if res.ready():
        filename= res.result
        return send_file(filename, as_attachment=True)
    else:
        return {"message" : "Task Pending "},202
    """
@app.route('/download-csv', methods=['GET'])
@roles_required('stud')
def download_csv():
    """
    Endpoint to trigger CSV generation for the logged-in user.
    """
    # Get the logged-in user's ID
    user_id = current_user.id

    # Trigger Celery task to generate CSV asynchronously
    task = create_resource_csv.delay(user_id)

    # Return task ID so the client can track progress
    return jsonify({"task_id": task.id}), 202

@app.route('/get-csv/<task_id>', methods=['GET'])
@roles_required('stud')
def get_csv(task_id):
    """
    Endpoint to retrieve the generated CSV file based on task ID.
    """
    try:
        # Retrieve the Celery task result
        res = AsyncResult(task_id)

        if res.ready():
            if res.successful():
                csv_content = res.result

                if csv_content:
                    # Create an in-memory file-like object for the CSV content
                    csv_file = BytesIO(csv_content.encode('utf-8'))

                    # Send the file as an attachment
                    return send_file(
                        csv_file,
                        as_attachment=True,
                        download_name=f"quiz_data_{current_user.id}.csv",
                        mimetype='text/csv'
                    )
                else:
                    return jsonify({"error": "CSV content is empty"}), 404
            else:
                error_info = str(res.result) if res.result else "Unknown error occurred"
                return jsonify({"error": "Task failed", "details": error_info}), 500
        else:
            # Task is still pending or processing
            return jsonify({"message": "Task is still processing", "status": res.status}), 202

    except Exception as e:
        app.logger.error(f"Error in get_csv: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500
    
@app.route('/admin/download-csv', methods=['GET'])
@roles_required('admin') 
def admin_download_csv():
    task = create_admin_resource_csv.delay()
    return jsonify({"task_id": task.id}), 202

@app.route('/admin/get-csv/<task_id>', methods=['GET'])
@roles_required('admin')  
def admin_get_csv(task_id):
    res = AsyncResult(task_id)
    if res.ready():
        filename = res.result
        return send_file(filename, as_attachment=True)
    else:
        return jsonify({"status": "pending", "message": "Task is still processing"}), 202