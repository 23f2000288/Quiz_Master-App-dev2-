from celery import shared_task
from flask import render_template, current_app
from datetime import datetime, timedelta
from .models import db, Quiz, User, Score,Role
import flask_excel as excel
from .mail_service import send_message
from sqlalchemy import func
from io import BytesIO




@shared_task(ignore_result=False)
def create_resource_csv(user_id):
    
    try:
        
        quiz_res = db.session.query(
            Quiz.id.label('Quiz ID'),
            Quiz.name.label('Quiz Name'),
            Quiz.remarks.label('Quiz Remarks'),
            Score.total_scored.label('Quiz Score')
        ).join(Score, Quiz.id == Score.quiz_id)\
         .filter(Score.user_id == user_id)\
         .order_by(Quiz.date_of_quiz.desc())\
         .all()

        # Check if there are results for the user
        if not quiz_res:
            current_app.logger.info(f"No quiz data found for user with ID {user_id}")
            return None

        
        csv_data = [
            {
                "Quiz ID": row[0],
                "Quiz Name": row[1],
                "Quiz Remarks": row[2] or "N/A",
                "Quiz Score": row[3]
            }
            for row in quiz_res
        ]

        
        csv_output = excel.make_response_from_records(
            csv_data,
            column_names=["Quiz ID", "Quiz Name", "Quiz Remarks", "Quiz Score"],
            file_type="csv"
        )

       
        return csv_output.data.decode('utf-8')

    except Exception as e:
        current_app.logger.error(f"Error generating CSV for user {user_id}: {str(e)}")
        raise


@shared_task(ignore_result=False)
def create_admin_resource_csv():
    
    user_data = db.session.query(
        User.id.label('User ID'),
        User.fullname.label('User Name'),
        func.count(Score.quiz_id).label('Quizzes Given'),
        func.avg(
            (Score.total_scored * 100.0 / Quiz.num_of_ques)
        ).label('Average Score Percentage')
    ).outerjoin(Score, User.id == Score.user_id)\
     .outerjoin(Quiz, Score.quiz_id == Quiz.id)\
     .group_by(User.id)\
     .all()

    
    headers = ["User ID", "User Name", "Quizzes Given", "Average Score Percentage"]
    formatted_data = [
        (row[0], row[1], row[2], f"{row[3]:.2f}%" if row[3] is not None else "N/A")
        for row in user_data
    ]

    
    csv_output = excel.make_response_from_array(
        [headers] + formatted_data,  
        "csv",
        file_name="admin_user_quiz_data.csv"
    )

    # Save the file
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
    