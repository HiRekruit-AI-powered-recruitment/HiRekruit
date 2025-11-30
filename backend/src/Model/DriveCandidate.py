from datetime import datetime

def create_drive_candidate(
    candidate_id, 
    drive_id, 
    rounds_status=None,
    resume_shortlisted="no",
    resume_score=None,
    email_sent="no",
    selected="no", 
    feedback="NA",
    final_email_sent="no"
):
    """
    Create a drive candidate document with dynamic round tracking.
    rounds_status will track each round's completion status for the candidate.
    resume_score stores the score assigned to the resume after shortlisting.
    """
    return {
        "candidate_id": candidate_id,
        "drive_id": drive_id,
        "resume_shortlisted": resume_shortlisted,
        "resume_score": resume_score,  # Score assigned after resume shortlisting
        "email_sent": email_sent,
        "rounds_status": rounds_status or [],
        "current_round": 0,
        "selected": selected,
        "feedback": feedback,
        "final_email_sent": final_email_sent,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }


def initialize_candidate_rounds(drive_rounds):
    """
    Initialize rounds_status for a candidate based on drive rounds.
    Added 'score' field for each round.
    """
    rounds_status = []
    for idx, round_info in enumerate(drive_rounds):
        rounds_status.append({
            "round_number": idx + 1,
            "round_type": round_info.get("type"),
            "scheduled": "no",
            "completed": "no",
            "result": "pending",  # pending, passed, failed
            "feedback": "",
            "scheduled_date": None,
            "completed_date": None,
            "score": None    #NEW FIELD → Score for each round
        })
    return rounds_status
