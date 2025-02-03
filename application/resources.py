from flask_restful import Resource, Api, reqparse, marshal_with, fields, request,marshal
from .models import Subject, Chapter, Quiz, Question, User, db, Role
from flask import jsonify, current_app
from datetime import datetime
from flask_security import roles_required, auth_required, hash_password
from uuid import uuid4
from datetime import datetime
from sqlalchemy.exc import IntegrityError

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
# Subject Parser for validating input for creating/updating subjects
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
        args = subject_parser.parse_args()
        subject = Subject.query.get_or_404(subject_id)
        
        try:
            subject.name = args['name']
            subject.description = args['description']
            db.session.commit()
            return {"message": "Subject updated successfully", "subject": marshal(subject, subject_fields)}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"Failed to update subject: {str(e)}"}, 500


chapter_parser = reqparse.RequestParser()
chapter_parser.add_argument('name', type=str, required=True, help='Chapter name is required')
chapter_parser.add_argument('description', type=str, required=True, help='Chapter description is required')
chapter_parser.add_argument('subject_id', type=int, required=True, help='Subject ID is required')
chapter_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    
    'subject_id': fields.Integer,
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
            if subject_id:
                chapters = Chapter.query.filter_by(subject_id=subject_id).all()
            else:
                chapters = Chapter.query.all()
            return chapters
        except Exception as e:
            return {"message": f"Failed to fetch chapters: {str(e)}"}, 500

    @auth_required('token')
    @roles_required('admin')
    def post(self):
        """Create a new chapter."""
        args = chapter_parser.parse_args()
        try:
            # Ensure subject_id is valid
            subject = Subject.query.get_or_404(args['subject_id'])
            chapter = Chapter(
                name=args['name'],
                description=args['description'],
                
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
            
            db.session.commit()
            return {"message": "Chapter updated successfully"}, 200
        except Exception as e:
            return {"message": f"Failed to update chapter: {str(e)}"}, 500
# Chapter Resource
quiz_parser = reqparse.RequestParser()
quiz_parser.add_argument('name', type=str, required=True, help='Quiz name is required')
quiz_parser.add_argument('time_duration', type=str, required=True, help='Time duration (HH:MM) is required')
quiz_parser.add_argument('remarks', type=str, help='Remarks for the quiz')
quiz_parser.add_argument('chapter_id', type=int, required=True, help='Chapter ID is required')
quiz_parser.add_argument('date_of_quiz',type=str,required=True,help='date_of_quiz is required')
quiz_parser.add_argument('num_of_ques',type=int,required=True,help='num_of_ques is required')
quiz_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'time_duration': fields.String,
    'remarks': fields.String,
    'chapter_id': fields.Integer,
    'date_of_quiz':fields.String,
    'num_of_ques':fields.Integer
}
class QuizResource(Resource):
    
    @auth_required('token')
    @roles_required('admin')
    @marshal_with(quiz_fields)
    def get(self, chapter_id=None, quiz_id=None):
        print(f"Received request for quizzes. chapter_id: {chapter_id}, quiz_id: {quiz_id}")
        try:
            if quiz_id:
                quiz = Quiz.query.get_or_404(quiz_id)
                return quiz
            elif chapter_id:
                quizzes = Quiz.query.filter_by(chapter_id=chapter_id).all()
                print(f"Found {len(quizzes)} quizzes for chapter {chapter_id}")
                return quizzes  # Return an empty list if no quizzes found
            else:
                quizzes = Quiz.query.all()
                return quizzes
        except Exception as e:
            print(f"Error in GET request: {str(e)}")
            return {"message": f"Failed to fetch quizzes: {str(e)}"}, 500
    
    @auth_required('token')
    @roles_required('admin')
    def post(self, chapter_id):
        """Create a quiz for a specific chapter."""
        args = quiz_parser.parse_args()
        try:
            Chapter.query.get_or_404(chapter_id)
            existing_quiz = Quiz.query.filter_by(chapter_id=chapter_id).first()
            if existing_quiz:
                return {"message": "A quiz already exists for this chapter."}, 400

            quiz = Quiz(
                name=args['name'],
                time_duration=datetime.strptime(args['time_duration'], "%H:%M").time(),
                remarks=args['remarks'],
                num_of_ques=args['num_of_ques'],
                chapter_id=chapter_id,
                date_of_quiz=datetime.strptime(args['date_of_quiz'], '%Y-%m-%d').date()
            )
            db.session.add(quiz)
            db.session.commit()
            return {"message": "Quiz created successfully."}, 201
        except Exception as e:
            return {"message": f"Failed to create quiz: {str(e)}"}, 500

    
    
    @auth_required('token')
    @roles_required('admin')
    def delete(self, quiz_id):
        
        
        if quiz_id is None:
            return {"message": "Quiz ID is required for deletion."}, 400
        
        try:
            quiz = Quiz.query.get_or_404(quiz_id)
            db.session.delete(quiz)
            db.session.commit()
            return {"message": "Quiz deleted successfully."}, 200
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting quiz: {str(e)}")
            return {"message": f"Failed to delete quiz: {str(e)}"}, 500
        
    @auth_required('token')
    @roles_required('admin')
    def put(self, quiz_id):
        """Update a specific quiz."""
        args = quiz_parser.parse_args()
        try:
            quiz = Quiz.query.get_or_404(quiz_id)
            quiz.name = args['name']
            
            # Handle both "HH:MM" and "HH:MM:SS" formats
            time_str = args['time_duration'].strip()
            if len(time_str.split(':')) == 2:
                time_str += ":00"  # Append seconds if missing
            
            try:
                quiz.time_duration = datetime.strptime(time_str, "%H:%M:%S").time()
            except ValueError:
                return {"message": "Invalid time format. Use HH:MM or HH:MM:SS"}, 400
            
            quiz.remarks = args['remarks']
            quiz.num_of_ques = args['num_of_ques']
            quiz.date_of_quiz = datetime.strptime(args['date_of_quiz'], '%Y-%m-%d').date()
            db.session.commit()
            return {"message": "Quiz updated successfully."}, 200
        except Exception as e:
            return {"message": f"Failed to update quiz: {str(e)}"}, 500

question_parser = reqparse.RequestParser()
question_parser.add_argument('question_statement', type=str, required=True, help='Question statement is required')
question_parser.add_argument('question_title', type=str, required=True, help='Question title is required')
question_parser.add_argument('options', type=dict, required=True, help='Options are required')
question_parser.add_argument('correct_option', type=str, required=True, help='Correct option is required')
question_fields = {
    'id': fields.Integer,
    'question_statement': fields.String,
    'question_title': fields.String,
    'options': fields.Raw,
    'correct_option': fields.String,
}
class QuestionResource(Resource):
    @auth_required('token')
    @roles_required('admin')
    @marshal_with(question_fields)
    def get(self, quiz_id, question_id=None):
        if question_id:
            question = Question.query.filter_by(quiz_id=quiz_id, id=question_id).first_or_404()
            return question
        else:
            questions = Question.query.filter_by(quiz_id=quiz_id).all()
            return questions

    @auth_required('token')
    @roles_required('admin')
    @marshal_with(question_fields)
    def post(self, quiz_id):
        args = question_parser.parse_args()
        try:
            quiz = Quiz.query.get_or_404(quiz_id)
            if args['correct_option'] not in args['options'].values():
                return {"message": "Correct option must be one of the provided options."}, 400
            
            question = Question(
                question_statement=args['question_statement'],
                question_title=args['question_title'],
                options=args['options'],
                correct_option=args['correct_option'],
                quiz_id=quiz_id
            )
            db.session.add(question)
            db.session.commit()
            return question, 201
        except IntegrityError:
            db.session.rollback()
            return {"message": "Failed to create question due to integrity error."}, 400
        except Exception as e:
            db.session.rollback()
            return {"message": f"Failed to create question: {str(e)}"}, 500

    @auth_required('token')
    @roles_required('admin')
    def delete(self, quiz_id, question_id):
        print(f"Attempting to delete question with id={question_id} from quiz with id={quiz_id}")

        question = Question.query.filter_by(quiz_id=quiz_id, id=question_id).first()
        if question is None:
                return {"message": "Question not found."}, 404
        db.session.delete(question)
        db.session.commit()
        return {"message": "Question deleted successfully."}, 200
        
    @auth_required('token')
    @roles_required('admin')
    @marshal_with(question_fields)
    def put(self, quiz_id, question_id):
        args = question_parser.parse_args()
        try:
            question = Question.query.filter_by(quiz_id=quiz_id, id=question_id).first_or_404()
            
            # Add validation for correct option
            if args['correct_option'] not in [str(v) for v in args['options'].values()]:
                return {"message": "Correct option must match one of the option values"}, 400

            # Update fields
            question.question_statement = args['question_statement']
            question.question_title = args['question_title']
            question.options = args['options']
            question.correct_option = args['correct_option']
            
            db.session.commit()
            return question, 200
        except Exception as e:
            db.session.rollback()
            print(f"Update error: {str(e)}")  # Detailed logging
            return {"message": f"Failed to update question: {str(e)}"}, 500

# Registering Resources
api.add_resource(SubjectResource, '/subjects', '/subjects/<int:subject_id>')
api.add_resource(
    ChapterResource, 
    '/chapters',                      # Fetch all chapters or create a new chapter
    '/chapters/<int:chapter_id>'      # Update or delete a specific chapter
)

api.add_resource(QuizResource, 
                 '/quizzes/<int:chapter_id>',  # For GET requests (fetching quizzes for a chapter)
                 '/quizzes/<int:quiz_id>',
                 ) 
api.add_resource(QuizResource, '/quizzes/<int:quiz_id>/delete', endpoint='quiz_delete')
api.add_resource(QuizResource, 
    '/quizzes/<int:quiz_id>/update', 
    endpoint='quiz_update'
)


api.add_resource(QuestionResource, 
        
             '/quizzes/<int:quiz_id>/questions',
                 '/quizzes/<int:quiz_id>/questions/<int:question_id>')
api.add_resource(RegisterUser,'/register_user')
