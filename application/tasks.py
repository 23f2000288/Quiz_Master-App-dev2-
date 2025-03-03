from celery import shared_task
from flask import render_template, current_app
from datetime import datetime, timedelta
from .models import db, Quiz, User, Score,Role
import flask_excel as excel
from .mail_service import send_message
from sqlalchemy import func



@shared_task(ignore_result=False)
def create_resource_csv():
    quiz_res = Quiz.query.with_entities(
        Quiz.id.label('Quiz id'),
        Quiz.name.label('Quiz Name'),
        Quiz.chapter_id.label('Quiz Chapter Id'),
        Quiz.date_of_quiz.label('Quiz Date'),
        Quiz.scores.label('Quiz scores'),
        Quiz.remarks.label('Quiz Remarks')
    ).all()

    csv_output = excel.make_response_from_query_sets(
        quiz_res,
        ["Quiz id", "Quiz Name", "Quiz Chapter Id", "Quiz Date", "Quiz scores", "Quiz Remarks"],
        "csv"
    )
    filename = "test.csv"

    with open(filename, 'wb') as f:
        f.write(csv_output.data)

    return filename
@shared_task(ignore_result=False)
def create_admin_resource_csv():
    user_data = db.session.query(
        User.id.label('User ID'),
        User.fullname.label('User Name'),
        func.count(Score.quiz_id).label('Quizzes Given'),
        func.avg(Score.total_scored).label('Average Score')
    ).outerjoin(Score, User.id == Score.user_id)\
     .group_by(User.id)\
     .all()

    csv_output = excel.make_response_from_query_sets(
        user_data,
        ["User ID", "User Name", "Quizzes Given", "Average Score"],
        "csv"
    )
    filename = "admin_user_quiz_data.csv"

    with open(filename, 'wb') as f:
        f.write(csv_output.data)

    return filename

@shared_task(ignore_result=True)
def send_daily_reminders():
    yesterday = datetime.utcnow() - timedelta(days=1)
    new_quizzes = Quiz.query.filter(Quiz.date_of_quiz >= yesterday).all()
    
    if new_quizzes:
        student_role = Role.query.filter_by(name='stud').first()
        students = User.query.filter(User.roles.contains(student_role)).all()
        subject = "New Quizzes Available!"
        for student in students:
            body = f"Hello {student.fullname},\n\nNew quizzes have been added. Log in to attempt them!"
            quiz_names = ", ".join([quiz.name for quiz in new_quizzes])
            body += f"\n\nNew Quizzes: {quiz_names}"
            send_message(student.email, subject, body)
    return "Ok"

@shared_task(ignore_result=True)
def send_monthly_reports():
    student_role = Role.query.filter_by(name='stud').first()
    students = User.query.filter(User.roles.contains(student_role)).all()
    for student in students:
        send_monthly_report_email(student)
    return "Ok"

def send_monthly_report_email(user):
    last_month = datetime.utcnow().replace(day=1) - timedelta(days=1)
    start_date = last_month.replace(day=1)
    
    scores = Score.query.filter(
        Score.user_id == user.id,
        Score.timestamp >= start_date,
        Score.timestamp < datetime.utcnow().replace(day=1)
    ).all()
    
    total_quizzes = len(scores)
    average_score = sum([score.total_scored for score in scores]) / total_quizzes if total_quizzes > 0 else 0
    
    html_content = render_template(
        'monthly_report.html',
        user=user,
        total_quizzes=total_quizzes,
        scores=scores,
        average_score=average_score
    )
    
    subject = f"Monthly Quiz Report - {last_month.strftime('%B %Y')}"
    send_message(user.email, subject, html_content)
    