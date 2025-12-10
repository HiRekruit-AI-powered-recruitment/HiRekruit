from datetime import datetime
from enum import Enum

class DriveStatus(str, Enum):
    DRIVE_CREATED = "driveCreated"
    RESUME_UPLOADED = "resumeUploaded"
    RESUME_SHORTLISTED = "resumeShortlisted"
    EMAIL_SENT = "emailSent"
    # Dynamic round statuses will be generated based on rounds
    SELECTION_EMAIL_SENT = "selectionEmailSent"
    COMPLETED = "completed"

class JobType(str, Enum):
    FULL_TIME = "full-time"
    INTERNSHIP = "internship"

class RoundStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


def generate_round_statuses(rounds):
    """
    Generate status fields for each round dynamically.
    Returns a list of round status objects.
    """
    round_statuses = []
    for idx, round_info in enumerate(rounds):
        round_statuses.append({
            "round_number": idx + 1,
            "round_type": round_info.get("type"),
            "status": RoundStatus.PENDING,
            "scheduled": "no",
            "completed": "no",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
    return round_statuses


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
    experience_max=None
):
    """
    Create a drive (job posting) document with dynamic round statuses.
    """
    if rounds is None:
        rounds = [{"type": "Technical", "description": ""}]

    # Normalize and validate status (accept enum or string)
    if isinstance(status, DriveStatus):
        status_val = status.value
    elif isinstance(status, str):
        status_val = status
    else:
        status_val = DriveStatus.DRIVE_CREATED.value

    if status_val not in DriveStatus._value2member_map_:
        raise ValueError(f"Invalid status '{status_val}'. Must be one of: {list(DriveStatus._value2member_map_.keys())}")

    # Normalize and validate job_type (accept enum or string)
    if isinstance(job_type, JobType):
        job_type_val = job_type.value
    else:
        job_type_val = job_type

    if job_type_val not in JobType._value2member_map_:
        raise ValueError(f"Invalid job_type '{job_type_val}'. Must be one of: {list(JobType._value2member_map_.keys())}")
    
    # Validate internship duration if job type is internship
    if job_type_val == JobType.INTERNSHIP.value and not internship_duration:
        raise ValueError("internship_duration is required when job_type is 'internship'")
    
    # Validate candidates_to_hire
    if not isinstance(candidates_to_hire, int) or candidates_to_hire < 1:
        raise ValueError("candidates_to_hire must be a positive integer")

    # Experience fields validation: optional, but if provided and 'experienced' ensure range
    if experience_type is not None:
        if experience_type not in ("fresher", "experienced"):
            raise ValueError("experience_type must be either 'fresher' or 'experienced'")

    if experience_type == "experienced":
        # Require both min and max to be provided and valid integers
        if experience_min is None or experience_max is None:
            raise ValueError("experience_min and experience_max are required when experience_type is 'experienced'")

        try:
            min_num = int(experience_min)
            max_num = int(experience_max)
        except Exception:
            raise ValueError("experience_min and experience_max must be integers")

        if min_num < 0 or max_num < 0 or min_num > max_num:
            raise ValueError("Invalid experience range: ensure 0 <= min <= max")
    else:
        min_num = None
        max_num = None

    # Generate round statuses dynamically
    round_statuses = generate_round_statuses(rounds)

    drive_data = {
        "job_id": job_id,
        "company_id": company_id,
        "role": role,
        "location": location,
        "start_date": start_date,
        "end_date": end_date,
        "candidates_to_hire": candidates_to_hire,
        "job_type": job_type,
        "rounds": rounds,
        "round_statuses": round_statuses,  # Dynamic round tracking
        "current_round": 0,  # Track which round is currently active
        "status": status,
        "skills": skills or [],
        "coding_question_ids": coding_question_ids or [],
        "experience_type": experience_type or "fresher",
        "experience_min": min_num,
        "experience_max": max_num,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    # Add internship_duration only if provided
    if internship_duration:
        drive_data["internship_duration"] = internship_duration

    return drive_data