from flask import Flask, render_template
from flask_security import Security, SQLAlchemyUserDatastore
from application.models import db, User,Role, Score,Quiz
from config import DevelopmentConfig
from application.resources import api
from application.sec import datastore
from application.worker import celery_init_app
import flask_excel as excel
from celery.schedules import crontab
from application.tasks import  send_monthly_reports, send_daily_reminders
from datetime import datetime, timedelta
def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)
    db.init_app(app)
    api.init_app(app)
    excel.init_excel(app)
    
    app.security=Security(app, datastore)

    with app.app_context():
        import application.views
    return app
app  = create_app()
celery_app= celery_init_app(app)
"""
@celery_app.on_after_configure.connect
def send_email(sender, **kwargs):
    sender.add_periodic_task(
        crontab(hour=21, minute=53, day_of_week=5),
        daily_reminder.s("faizkhan@gmail.com",'Daily Test'),
    )"""

@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Daily reminder at 8 PM
    sender.add_periodic_task(
        crontab(hour=22, minute=5),
        send_daily_reminders.s(),
    )
    
    # Monthly report on the 1st of every month at 9 AM
    sender.add_periodic_task(
        crontab(day_of_month=15, hour=22, minute=5),
        send_monthly_reports.s(),
    )

if __name__=="__main__":
    app.run(debug=True)