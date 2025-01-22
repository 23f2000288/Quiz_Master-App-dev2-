from flask_restful import Resource, Api, reqparse, marshal_with, fields, request
from .models import Subject, Chapter, Quiz, Question, User, db, Role
from flask import jsonify
from datetime import datetime
from flask_security import roles_required, auth_required, hash_password
from uuid import uuid4

api = Api(prefix='/api')

# Parser for user registration
user_parser = reqparse.RequestParser()
user_parser.add_argument('email', type=str, required=True, help='Email is required')
user_parser.add_argument('fullname', type=str, required=True, help='Full name is required')
user_parser.add_argument('password', type=str, required=True, help='Password is required')
user_parser.add_argument('dob', type=str, required=True, help="dob is required")
user_parser.add_argument('qualification', type=str, required=True, help="qualification is required")
# user Marshalling
user_fields = {
    'id': fields.Integer,
    'email': fields.String,
    'fullname': fields.String,
    'qualification': fields.String,
    'dob': fields.String
}
class RegisterUser(Resource):
    @marshal_with(user_fields)
    def post(self):
        data = request.get_json()

        try:
            # Validate and process input data
            dob = datetime.strptime(data['dob'], '%Y-%m-%d').date()
            fs_uniquifier = str(uuid4())
            hashed_password = hash_password(data['password'])

            # Check if 'stud' role exists
            role = Role.query.filter_by(name='stud').first()
            if not role:
                return {"message": "Role 'stud' does not exist. Please create it first."}, 400

            # Create new user with the role
            user = User(
                fullname=data['fullname'],
                email=data['email'],
                password=hashed_password,
                qualification=data.get('qualification'),
                dob=dob,
                fs_uniquifier=fs_uniquifier,
                active=True
            )
            user.roles.append(role)  # Assign the 'stud' role

            # Save to the database
            db.session.add(user)
            db.session.commit()

            return {"message": "User registered successfully"}, 201

        except KeyError as e:
            return {"message": f"Missing field: {e.args[0]}"}, 400
        except ValueError as e:
            return {"message": f"Invalid data: {str(e)}"}, 400
        except Exception as e:
            return {"message": f"An error occurred: {str(e)}"}, 400



# Parsers for Subject, Chapter, and Quiz creation






subject_parser = reqparse.RequestParser()
subject_parser.add_argument('name', type=str, required=True, help='Subject name is required')
subject_parser.add_argument('description', type=str, required=True, help='Subject description is required')

subject_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String
}
# Subject CRUD API
class SubjectResource(Resource):
    
    @marshal_with(subject_fields)
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        """Fetch all subjects."""
        subjects = Subject.query.all()
        return subjects

    @auth_required('token')
    @roles_required('admin')
    def post(self):
        """Create a new subject."""
        args = subject_parser.parse_args()
        try:
            subject = Subject(name=args['name'], description=args['description'])
            db.session.add(subject)
            db.session.commit()
            return {"message": "Subject created successfully"}, 201
        except Exception as e:
            return {"message": f"Failed to create subject: {str(e)}"}, 500

    @auth_required('token')
    @roles_required('admin')
    def delete(self, subject_id):
        """Delete a subject."""
        try:
            subject = Subject.query.get_or_404(subject_id)
            db.session.delete(subject)
            db.session.commit()
            return {"message": "Subject deleted successfully"}, 200
        except Exception as e:
            return {"message": f"Failed to delete subject: {str(e)}"}, 500

    @auth_required('token')
    @roles_required('admin')
    def put(self, subject_id):
        """Update a subject."""
        args = subject_parser.parse_args()
        try:
            subject = Subject.query.get_or_404(subject_id)
            subject.name = args['name']
            subject.description = args['description']
            db.session.commit()
            return {"message": "Subject updated successfully"}, 200
        except Exception as e:
            return {"message": f"Failed to update subject: {str(e)}"}, 500

chapter_parser = reqparse.RequestParser()
chapter_parser.add_argument('name', type=str, required=True, help='Chapter name is required')
chapter_parser.add_argument('description', type=str, required=True, help='Chapter description is required')
chapter_parser.add_argument('num_of_ques', type=int, required=True, help='Number of questions is required')
chapter_parser.add_argument('subject_id', type=int, required=True, help='Subject ID is required')
# Marshalling fields


chapter_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'subject_id': fields.Integer,
    'num_of_ques': fields.Integer
}
# Chapter CRUD API
class ChapterResource(Resource):
    @auth_required('token')
    @roles_required('admin')
    @marshal_with(chapter_fields)
    def get(self):
        """Fetch all chapters or filter by subject ID."""
        subject_id = request.args.get('subject_id', type=int)
        try:
            chapters = Chapter.query.filter_by(subject_id=subject_id).all() if subject_id else Chapter.query.all()
            return chapters
        except Exception as e:
            return {"message": f"Failed to fetch chapters: {str(e)}"}, 500

    @auth_required('token')
    @roles_required('admin')
    def post(self):
        """Create a new chapter."""
        args = chapter_parser.parse_args()
        try:
            # Ensure subject_id is included in the request body
            chapter = Chapter(
                name=args['name'],
                description=args['description'],
                num_of_ques=args['num_of_ques'],
                subject_id=args['subject_id']
            )
            db.session.add(chapter)
            db.session.commit()
            return {"message": "Chapter created successfully"}, 201
        except Exception as e:
            return {"message": f"Failed to create chapter: {str(e)}"}, 500

    @auth_required('token')
    @roles_required('admin')
    def delete(self, chapter_id):
        """Delete a chapter."""
        try:
            chapter = Chapter.query.get_or_404(chapter_id)
            db.session.delete(chapter)
            db.session.commit()
            return {"message": "Chapter deleted successfully"}, 200
        except Exception as e:
            return {"message": f"Failed to delete chapter: {str(e)}"}, 500

    @auth_required('token')
    @roles_required('admin')
    def put(self, chapter_id):
        """Update a chapter."""
        args = chapter_parser.parse_args()
        try:
            chapter = Chapter.query.get_or_404(chapter_id)
            chapter.name = args['name']
            chapter.description = args['description']
            chapter.num_of_ques = args['num_of_ques']
            db.session.commit()
            return {"message": "Chapter updated successfully"}, 200
        except Exception as e:
            return {"message": f"Failed to update chapter: {str(e)}"}, 500

quiz_parser = reqparse.RequestParser()
quiz_parser.add_argument('name', type=str, required=True, help='Quiz name is required')
quiz_parser.add_argument('time_duration', type=str, required=True, help='Quiz time duration is required (HH:MM)')
quiz_parser.add_argument('remarks', type=str)
quiz_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'chapter_id': fields.Integer,
    'time_duration': fields.String,
    'remarks': fields.String
}
# Quiz CRUD API
class QuizResource(Resource):
    @auth_required('token')
    @roles_required('admin')
    @marshal_with(quiz_fields)
    def get(self):
        """Fetch all quizzes or filter by chapter ID."""
        chapter_id = request.args.get('chapter_id', type=int)
        try:
            quizzes = Quiz.query.filter_by(chapter_id=chapter_id).all() if chapter_id else Quiz.query.all()
            return quizzes
        except Exception as e:
            return {"message": f"Failed to fetch quizzes: {str(e)}"}, 500

    @auth_required('token')
    @roles_required('admin')
    def post(self):
        """Create a new quiz."""
        args = quiz_parser.parse_args()
        try:
            # Convert time duration string to a datetime object for storage
            time_duration = datetime.strptime(args['time_duration'], "%H:%M").time()
            quiz = Quiz(name=args['name'], time_duration=time_duration, remarks=args['remarks'])
            db.session.add(quiz)
            db.session.commit()
            return {"message": "Quiz created successfully"}, 201
        except Exception as e:
            return {"message": f"Failed to create quiz: {str(e)}"}, 500

    @auth_required('token')
    @roles_required('admin')
    def delete(self, quiz_id):
        """Delete a quiz."""
        try:
            quiz = Quiz.query.get_or_404(quiz_id)
            db.session.delete(quiz)
            db.session.commit()
            return {"message": "Quiz deleted successfully"}, 200
        except Exception as e:
            return {"message": f"Failed to delete quiz: {str(e)}"}, 500

    @auth_required('token')
    @roles_required('admin')
    def put(self, quiz_id):
        """Update a quiz."""
        args = quiz_parser.parse_args()
        try:
            quiz = Quiz.query.get_or_404(quiz_id)
            quiz.name = args['name']
            quiz.time_duration = datetime.strptime(args['time_duration'], "%H:%M").time()
            quiz.remarks = args['remarks']
            db.session.commit()
            return {"message": "Quiz updated successfully"}, 200
        except Exception as e:
            return {"message": f"Failed to update quiz: {str(e)}"}, 500

# Add resources to the API
api.add_resource(SubjectResource, '/subjects', '/subjects/<int:subject_id>')
api.add_resource(ChapterResource, '/chapters', '/chapters/<int:chapter_id>')
api.add_resource(QuizResource, '/quizzes', '/quizzes/<int:quiz_id>')
api.add_resource(RegisterUser, '/register_user')