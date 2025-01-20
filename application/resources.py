from flask_restful import Resource, Api, reqparse, marshal_with, fields, request
from .models import Subject, Chapter, Quiz, Question, User, db, Role
from flask import jsonify
from datetime import datetime
from flask_security import hash_password, auth_required, roles_required
from werkzeug.security import generate_password_hash
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
            return {"message": f"An error occurred: {str(e)}"}, 500

# Parser for creating subjects
subject_parser = reqparse.RequestParser()
subject_parser.add_argument('name', type=str, required=True, help='Subject name is required')
subject_parser.add_argument('description', type=str, required=True, help='Subject description is required')
# Marshalling for subjects

subject_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String
}
class SubjectResource(Resource):
    @marshal_with(subject_fields)
    @auth_required("token")
    def get(self):
        subjects = Subject.query.all()
        return subjects

    #@auth_required("token")
    @roles_required("admin")
    def post(self):
        args = subject_parser.parse_args()
        subject = Subject(**args)
        db.session.add(subject)
        db.session.commit()
        return {'message': 'Subject created successfully'}, 201

    def delete(self, subject_id):
        subject = Subject.query.get_or_404(subject_id)
        db.session.delete(subject)
        db.session.commit()
        return {'message': 'Subject deleted successfully'}, 200

    def put(self, subject_id):
        args = subject_parser.parse_args()
        subject = Subject.query.get_or_404(subject_id)
        subject.name = args['name']
        subject.description = args['description']
        db.session.commit()
        return {'message': 'Subject updated successfully'}, 200
# Parser for creating chapters
chapter_parser = reqparse.RequestParser()
chapter_parser.add_argument('name', type=str, required=True, help='Chapter name is required')
chapter_parser.add_argument('description', type=str, required=True, help='Chapter description is required')
chapter_parser.add_argument('subject_id', type=int, required=True, help='Subject ID is required')
chapter_parser.add_argument('num_of_ques', type=int,required=True, help='no of ques is required')

#Marshaling for chapters
chapter_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'subject_id': fields.Integer,
    'num_of_ques': fields.Integer,
}
class ChapterResource(Resource):
    @marshal_with(chapter_fields)
    def get(self):
        subject_id = request.args.get('subject_id', type=int)
        chapters = Chapter.query.filter_by(subject_id=subject_id).all() if subject_id else Chapter.query.all()
        return chapters

    def post(self):
        args = chapter_parser.parse_args()
        chapter = Chapter(**args)
        db.session.add(chapter)
        db.session.commit()
        return {'message': 'Chapter created successfully'}, 201

    def delete(self, chapter_id):
        chapter = Chapter.query.get_or_404(chapter_id)
        db.session.delete(chapter)
        db.session.commit()
        return {'message': 'Chapter deleted successfully'}, 200

    def put(self, chapter_id):
        args = chapter_parser.parse_args()
        chapter = Chapter.query.get_or_404(chapter_id)
        chapter.name = args['name']
        chapter.description = args['description']
        chapter.num_of_ques = args['num_of_ques']
        db.session.commit()
        return {'message': 'Chapter updated successfully'}, 200

"""class ChapterResource(Resource):
    @marshal_with(chapter_fields)
    def get(self):
        subject_id = request.args.get('subject_id', type=int)
        chapters = Chapter.query.filter_by(subject_id=subject_id).all() if subject_id else Chapter.query.all()
        return chapters

    def post(self):
        args = chapter_parser.parse_args()
        chapter = Chapter(**args)
        db.session.add(chapter)
        db.session.commit()
        return {'message': 'Chapter created successfully'}, 201
"""
# Parser for creating questions
question_parser = reqparse.RequestParser()
question_parser.add_argument('quiz_id', type=int, required=True, help='Quiz ID is required')
question_parser.add_argument('question_statement', type=str, required=True, help='Question statement is required')
question_parser.add_argument('option1', type=str, required=True, help='Option 1 is required')
question_parser.add_argument('option2', type=str, required=True, help='Option 2 is required')
question_parser.add_argument('option3', type=str)
question_parser.add_argument('option4', type=str)
question_parser.add_argument('correct_option', type=str, required=True, help='Correct option is required')

# Fields for marshalling questions
question_fields = {
    'id': fields.Integer,
    'quiz_id': fields.Integer,
    'question_statement': fields.String,
    'option1': fields.String,
    'option2': fields.String,
    'option3': fields.String,
    'option4': fields.String,
    'correct_option': fields.String
}
class QuestionResource(Resource):
    @marshal_with(question_fields)
    def get(self):
        questions = Question.query.all()
        return questions

    def post(self):
        args = question_parser.parse_args()
        question = Question(**args)
        db.session.add(question)
        db.session.commit()
        return {'message': 'Question created successfully'}, 201

# Add resources to the API
api.add_resource(RegisterUser, '/register_user')
api.add_resource(SubjectResource, '/subjects')
api.add_resource(ChapterResource, '/chapters')
api.add_resource(QuestionResource, '/questions')
