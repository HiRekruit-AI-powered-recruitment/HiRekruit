from datetime import datetime
from enum import Enum

class DriveStatus(str, Enum):
    DRIVE_CREATED = "driveCreated"
    RESUME_UPLOADED = "resumeUploaded"
    RESUME_SHORTLISTED = "resumeShortlisted"
    EMAIL_SENT = "emailSent"
    SELECTION_EMAIL_SENT = "selectionEmailSent"
    COMPLETED = "completed"

class JobType(str, Enum):
    FULL_TIME = "full-time"
    INTERNSHIP = "internship"

class RoundStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


# -----------------------------------------
# 🔥 Generate Stages Dynamically
# -----------------------------------------
def generate_stages(rounds):
    stages = [
        "resumeUploaded",
        "resumeShortlisted",
        "emailSent"
    ]

    # Add round scheduling stages dynamically
    for r in rounds:
        round_type = r.get("type", "").strip()
        if not round_type:
            continue

        formatted = "schedule" + round_type.replace(" ", "").capitalize() + "Round"
        stages.append(formatted)

    stages.append("finalMail")
    return stages

def create_drive(
    company_id,
    role,
    location,
    start_date,
    end_date,
    candidates_to_hire,
    job_type=JobType.FULL_TIME,
    skills=None,
    rounds=None,
    job_id=None,
    status=None,
    internship_duration=None,
    coding_question_ids=None,
    experience_type=None,
    experience_min=None,
    experience_max=None,
    assessment_duration_hours=0,    # 🔥 NEW PARAMETER
    assessment_duration_minutes=0   # 🔥 NEW PARAMETER
):
    """
    Create a drive (job posting) document with dynamic round statuses and stages.
    """
    if rounds is None:
        rounds = [{"type": "HR", "description": ""}]

    # Normalize status
    if isinstance(status, DriveStatus):
        status_val = status.value
    else:
        status_val = status or DriveStatus.DRIVE_CREATED.value

    if status_val not in DriveStatus._value2member_map_:
        raise ValueError(f"Invalid status '{status_val}'.")

    # Validate job type
    if isinstance(job_type, JobType):
        job_type_val = job_type.value
    else:
        job_type_val = job_type

    if job_type_val not in JobType._value2member_map_:
        raise ValueError(f"Invalid job_type '{job_type_val}'.")

    # Internship validation
    if job_type_val == "internship" and not internship_duration:
        raise ValueError("internship_duration is required for internship roles")

    # Validate hiring count
    if not isinstance(candidates_to_hire, int) or candidates_to_hire < 1:
        raise ValueError("candidates_to_hire must be a positive integer")

    # Experience validation
    if experience_type == "experienced":
        if experience_min is None or experience_max is None:
            raise ValueError("experience_min and experience_max required")
        experience_min = int(experience_min)
        experience_max = int(experience_max)
        if experience_min < 0 or experience_max < 0 or experience_min > experience_max:
            raise ValueError("Invalid experience range")
    else:
        experience_type = "fresher"
        experience_min = None
        experience_max = None

    # -----------------------------------------
    # 🔥 Generate dynamic stages
    # -----------------------------------------
    stages = generate_stages(rounds)

    # -----------------------------------------
    # 🔥 Generate dynamic round statuses
    # -----------------------------------------
    round_statuses = []
    for idx, r in enumerate(rounds):
        round_statuses.append({
            "round_number": idx + 1,
            "round_type": r.get("type"),
            "status": RoundStatus.PENDING,
            "scheduled": "no",
            "completed": "no",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })

    drive_data = {
        "job_id": job_id,
        "company_id": company_id,
        "role": role,
        "location": location,
        "start_date": start_date,
        "end_date": end_date,
        "candidates_to_hire": candidates_to_hire,
        "job_type": job_type_val,
        "skills": skills or [],
        "rounds": rounds,
        "round_statuses": round_statuses,
        "stages": stages,
        "currentStage": 0,
        "status": status_val,
        "coding_question_ids": coding_question_ids or [],
        "experience_type": experience_type,
        "experience_min": experience_min,
        "experience_max": experience_max,
        
        # 🔥 STORE ASSESSMENT DURATION
        "assessment_duration_hours": int(assessment_duration_hours),
        "assessment_duration_minutes": int(assessment_duration_minutes),
        
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    if internship_duration:
        drive_data["internship_duration"] = internship_duration

    return drive_data