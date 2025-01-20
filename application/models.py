from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin

db=SQLAlchemy()

class RolesUsers(db.Model):
    id=db.Column(db.Integer(), primary_key=True)
    user_id=db.Column('user_id', db.Integer(), db.ForeignKey('user.id'))
    role_id=db.Column('role_id', db.Integer(), db.ForeignKey('role.id'))


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, unique=True)
    fullname=db.Column(db.String)
    password = db.Column(db.String(255))
    active = db.Column(db.Boolean())
    fs_uniquifier = db.Column(db.String(250), unique=True, nullable=False)
    role_id= db.Column(db.String, db.ForeignKey('role.id'))
    qualification=db.Column(db.String)
    dob=db.Column(db.Date)
    roles= db.relationship('Role', secondary='roles_users',
                           backref=db.backref('users', lazy='dynamic'))
class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))
#Subject Model
class Subject(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False)
    description = db.Column(db.Text)
    chapters = db.relationship('Chapter', backref='subject', lazy=True)

# Chapter model
class Chapter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    num_of_ques=db.Column(db.Integer)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'), nullable=False)
    quizzes = db.relationship('Quiz', backref='chapter', lazy=True)

# Quiz model
class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    chapter_id = db.Column(db.Integer, db.ForeignKey('chapter.id'), nullable=False)
    date_of_quiz = db.Column(db.DateTime)
    time_duration = db.Column(db.Time, nullable=False)
    remarks = db.Column(db.Text)
    questions = db.relationship('Question', backref='quiz', lazy=True)
    scores = db.relationship('Score', backref='quiz', lazy=True)

# Question model
class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    question_statement = db.Column(db.Text, nullable=False)
    option1 = db.Column(db.String(120), nullable=False)
    option2 = db.Column(db.String(120), nullable=False)
    option3 = db.Column(db.String(120))
    option4 = db.Column(db.String(120))
    correct_option = db.Column(db.String(120), nullable=False)

# Score model
class Score(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    timestamp = db.Column(db.DateTime)
    total_scored = db.Column(db.Integer)
