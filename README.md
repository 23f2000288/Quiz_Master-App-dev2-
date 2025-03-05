# Quiz_Master-App-dev2-
This multi-user application serves as a comprehensive exam preparation platform for various courses. It features an administrator role to create quizzes inside each chapter of a subject and adding questions to it and able to do all crud operations and also manage  user accounts, while other users can give quizzes and practice for the exam. A key feature is the timed quiz function, which simulates real exam conditions and helps users manage their time effectively. After each quiz, users their score, time taken, and a breakdown of correct and incorrect answers. This feedback, combined with progress tracking across different subjects, allows users to identify areas for improvement and gauge their exam readiness. The platform's interactive features create an engaging and effective real exam environment for multiple courses.
# Steps to start Quiz-Master Application

# Step1:-Start Redis Server in WSL:
 command(redis-server )

# Step2:- Start MailHog in WSL:
command(~/go/bin/MailHog)

# Step:-3 Activate Virtual Environment in PowerShell:
.\myvenv\Scripts\activate

# Step:-4 Run the Main Application:
python main.py

# Step:-5 Start Celery Worker:
celery -A main:celery_app worker --loglevel INFO --pool=solo

# Step:-6 Start Celery Beat:
celery -A main:celery_app beat --loglevel=INFO 
