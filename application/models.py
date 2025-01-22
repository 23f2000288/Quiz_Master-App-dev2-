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
# Subject model
class Subject(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False)
    description = db.Column(db.Text)
    chapters = db.relationship('Chapter', back_populates='subject', lazy=True)

# Chapter model
class Chapter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    num_of_ques = db.Column(db.Integer)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'), nullable=False)
    quizzes = db.relationship('Quiz', back_populates='chapter', lazy=True)

    subject = db.relationship('Subject', back_populates='chapters')
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

    chapter = db.relationship('Chapter', back_populates='quizzes')

    # Added index for optimization
    __table_args__ = (db.Index('idx_quiz_chapter', 'chapter_id'),)

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

    # Index for quick lookup by quiz
    __table_args__ = (db.Index('idx_question_quiz', 'quiz_id'),)

# Score model
class Score(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
    total_scored = db.Column(db.Integer, nullable=False)
    is_completed = db.Column(db.Boolean, default=False)