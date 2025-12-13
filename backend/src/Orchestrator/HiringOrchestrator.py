# src/Orchestrators/HiringOrchestrator.py
import os
from src.Agents.ResumeIntakeAgent import ResumeIntakeAgent
from src.Agents.ResumeShortlistingAgent import ResumeShortlistingAgent
from src.Agents.EmailingAgent import EmailingAgent
from src.Agents.InterviewSchedulingAgent import InterviewSchedulingAgent
from src.Utils.EmailService import EmailService
from src.Utils.AsyncEmailService import AsyncEmailService
from src.Utils.BrevoEmailService import BrevoEmailService

from dotenv import load_dotenv

load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT"))
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

# Once HR submit the resumes along with job role and keywords,
# 1. Create a candidate instances for each resume using ResumeIntakeAgent
# 2. Create a drivecadnidate instances for each resume using ResumeShortlistingAgent
def create_driveCandidate(file_paths, keywords, job_role, drive_id):
    # print("Starting drive candidate process")
    # ResumeIntakeAgent processes resumes and extracts candidate information
    resume_agent = ResumeIntakeAgent()
    candidates = resume_agent.process_resumes(file_paths,drive_id)
    return candidates

# Shortlisting agent shortlists candidates based on keywords and job role
def shortlist_candidates(candidates, keywords, job_role):
    # print("Starting shortlisting process")
    shortlisting_agent = ResumeShortlistingAgent()
    shortlist_result  = shortlisting_agent.shortlist_candidates(candidates, keywords, job_role)
    # return shortlist_result

# EmailingAgent sends emails to shortlisted and not-shortlisted candidates
def email_candidates(drive_id):
    print("Starting emailing process")
    #creating the email service instance
    # for EmailService
    # email_service = EmailService(SMTP_SERVER, SMTP_PORT, EMAIL_USER, EMAIL_PASSWORD)

    # for AsyncEmailService
    # email_service = AsyncEmailService(SMTP_SERVER, SMTP_PORT, EMAIL_USER, EMAIL_PASSWORD)
    
    # for BrevoEmailService
    email_service = BrevoEmailService()

    emailing_agent = EmailingAgent(email_service)
    
    emailing_agent.send_mail_to_all_candidates(drive_id)
    # return "Emails sent successfully"

# Scheduling interviews for shortlisted candidates
def schedule_interviews(drive_id, round_type):
    print("Starting interview scheduling process")
    #creating the email service instance
    # for EmailService
    # email_service = EmailService(SMTP_SERVER, SMTP_PORT, EMAIL_USER, EMAIL_PASSWORD)
    
    # for AsyncEmailService
    # email_service = AsyncEmailService(SMTP_SERVER, SMTP_PORT, EMAIL_USER, EMAIL_PASSWORD)

    # for BrevoEmailService
    email_service = BrevoEmailService()

    interview_scheduling_agent = InterviewSchedulingAgent(email_service)

    interview_scheduling_agent.schedule_interviews(drive_id,round_type)
    # return "Interviews scheduled successfully"

# Final selection mail to the selected candidates
def send_final_selection_emails(drive_id):
    print("Starting final selection emailing process")
    #creating the email service instance
    # for EmailService
    # email_service = EmailService(SMTP_SERVER, SMTP_PORT, EMAIL_USER, EMAIL_PASSWORD)
   
    # for AsyncEmailService
    # email_service = AsyncEmailService(SMTP_SERVER, SMTP_PORT, EMAIL_USER, EMAIL_PASSWORD)

    # for BrevoEmailService
    email_service = BrevoEmailService()
    
    emailing_agent = EmailingAgent(email_service)

    emailing_agent.send_final_selection_emails(drive_id)
    # return "Final selection emails sent successfully"

# here write a function for scheduling the coding assessment 
