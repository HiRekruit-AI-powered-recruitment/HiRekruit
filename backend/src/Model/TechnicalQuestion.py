from datetime import datetime


def create_technical_question(
    question_text,
    title=None,
    expected_answer="",
    evaluation_points=None,
    difficulty="medium",
    tags=None,
    company_id=None,
    drive_id=None,
    source_type="manual",
    raw_question=None,
):
    """
    Create a technical interview question document.

    These questions are for the live technical interview coding/assessment
    switch, and may be coding, math, physics, system-design, or client-specific
    problem statements. They are not Judge0 executable coding questions.
    """
    if not question_text or not str(question_text).strip():
        raise ValueError("question_text is required")

    question_data = {
        "title": str(title or "Technical Question").strip(),
        "question_text": str(question_text).strip(),
        "expected_answer": str(expected_answer or "").strip(),
        "evaluation_points": evaluation_points or [],
        "difficulty": str(difficulty or "medium").lower(),
        "tags": tags or [],
        "source_type": source_type,
        "raw_question": str(raw_question or question_text).strip(),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    if company_id:
        question_data["company_id"] = company_id

    if drive_id:
        question_data["drive_id"] = drive_id

    return question_data
