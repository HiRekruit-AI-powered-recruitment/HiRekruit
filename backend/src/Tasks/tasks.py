# src/Tasks/tasks.py
from celery_app import celery
import os
from src.Agents.EmailingAgent import EmailingAgent
from src.Agents.InterviewSchedulingAgent import InterviewSchedulingAgent
from src.Utils.EmailService import EmailService
# from src.Utils.GoogleEmailService import EmailService 
from dotenv import load_dotenv

load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT"))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

# print(SMTP_PORT)
# print(EMAIL_USER)
# print(EMAIL_PASSWORD)
# print(SMTP_SERVER)

def get_email_config():
    SMTP_SERVER = os.getenv("SMTP_SERVER")
    SMTP_PORT = os.getenv("SMTP_PORT")
    EMAIL_USER = os.getenv("EMAIL_USER")
    EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

    if not all([SMTP_SERVER, SMTP_PORT, EMAIL_USER, EMAIL_PASSWORD]):
        raise ValueError("Email configuration missing in environment variables")

    return SMTP_SERVER, int(SMTP_PORT), EMAIL_USER, EMAIL_PASSWORD

# Simplified task names - remove the "src.Tasks.tasks" prefix
@celery.task(name="email_candidates_task", bind=True)
def email_candidates_task(self, drive_id):
    try:
        SMTP_SERVER, SMTP_PORT, EMAIL_USER, EMAIL_PASSWORD = get_email_config()

        email_service = EmailService(SMTP_SERVER, SMTP_PORT, EMAIL_USER, EMAIL_PASSWORD)
        emailing_agent = EmailingAgent(email_service)
        emailing_agent.send_mail_to_all_candidates(drive_id)

        return {"status": "success", "drive_id": drive_id}

    except Exception as e:
        raise self.retry(exc=e, countdown=60, max_retries=3)


@celery.task(name="send_final_selection_emails_task", bind=True)
def send_final_selection_emails_task(self, drive_id):
    """Send final selection emails to candidates"""
    try:
        print(f"Starting final selection email process for drive {drive_id}")
        email_service = EmailService(SMTP_SERVER, SMTP_PORT, EMAIL_USER, EMAIL_PASSWORD)
        emailing_agent = EmailingAgent(email_service)
        emailing_agent.send_final_selection_emails(drive_id)
        print(f"Final selection emails sent for drive {drive_id}")
        return {"status": "success", "drive_id": drive_id}
    except Exception as e:
        print(f"Error in send_final_selection_emails_task: {str(e)}")
        raise self.retry(exc=e, countdown=60, max_retries=3)

@celery.task(name="schedule_interviews_task", bind=True)
def schedule_interviews_task(self, drive_id, round_type="hr"):
    """Schedule interviews for candidates"""
    try:
        print(f"Starting interview scheduling process for drive {drive_id} with round_type {round_type}")
        email_service = EmailService(SMTP_SERVER, SMTP_PORT, EMAIL_USER, EMAIL_PASSWORD)
        interview_agent = InterviewSchedulingAgent(email_service)
        # Pass round_type through to the agent
        interview_agent.schedule_interviews(drive_id, round_type)
        print(f"Interviews scheduled for drive {drive_id}")
        return {"status": "success", "drive_id": drive_id, "round_type": round_type}
    except Exception as e:
        print(f"Error in schedule_interviews_task: {str(e)}")
        raise self.retry(exc=e, countdown=60, max_retries=3)


@celery.task(name="schedule_coding_assessments_task", bind=True)
def schedule_coding_assessments_task(self, drive_id):
    """Schedule coding assessments for shortlisted candidates"""
    try:
        print(f"Starting coding assessment scheduling process for drive {drive_id}")
        email_service = EmailService(SMTP_SERVER, SMTP_PORT, EMAIL_USER, EMAIL_PASSWORD)
        interview_agent = InterviewSchedulingAgent(email_service)
        interview_agent.schedule_coding_assessments(drive_id)
        print(f"Coding assessments scheduled for drive {drive_id}")
        return {"status": "success", "drive_id": drive_id}
    except Exception as e:
        print(f"Error in schedule_coding_assessments_task: {str(e)}")
        raise self.retry(exc=e, countdown=60, max_retries=3)
