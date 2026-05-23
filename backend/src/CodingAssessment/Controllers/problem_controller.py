import json
import os

from bson import ObjectId
from datetime import datetime

# Assuming you have database access
from src.Utils.Database import db


def serialize_mongo_doc(document):
    document['_id'] = str(document['_id'])

    if 'created_at' in document and isinstance(document['created_at'], datetime):
        document['created_at'] = document['created_at'].isoformat()
    if 'updated_at' in document and isinstance(document['updated_at'], datetime):
        document['updated_at'] = document['updated_at'].isoformat()

    return document

def get_all_problems(drive_id=None):
    """
    Fetch all coding problems or filter by drive_id's
    
    Args:
        drive_id (str, optional): Drive ID to filter problems
        
    Returns:
        list: List of coding problems
    """
    try:
        if drive_id:
            # Fetch drive to get coding_question_ids
            drive = db.drives.find_one({"_id": ObjectId(drive_id)})
            
            if not drive:
                return {"error": "Drive not found", "status": 404}
            
            coding_question_ids = drive.get('coding_question_ids', [])
            
            if not coding_question_ids:
                return {"error": "No coding questions assigned to this drive", "status": 404}
            
            # Convert string IDs to ObjectId if needed
            object_ids = [
                ObjectId(qid) if isinstance(qid, str) else qid 
                for qid in coding_question_ids
            ]
            
            # Fetch all questions matching these IDs
            problems = list(db.coding_questions.find({"_id": {"$in": object_ids}}))
        else:
            # Fetch all problems from database
            problems = list(db.coding_questions.find())
        
        for problem in problems:
            serialize_mongo_doc(problem)
        
        return problems
        
    except Exception as e:
        print(f"Error fetching problems: {str(e)}")
        return {"error": "Failed to fetch coding problems", "details": str(e), "status": 500}


def get_technical_questions_by_drive(drive_id):
    """
    Fetch free-form technical interview questions assigned to a drive.
    """
    try:
        if not drive_id:
            return {"error": "drive_id is required", "status": 400}

        drive = db.drives.find_one({"_id": ObjectId(drive_id)})
        if not drive:
            return {"error": "Drive not found", "status": 404}

        technical_question_ids = drive.get('technical_question_ids', [])
        if not technical_question_ids:
            return {
                "error": "No technical questions assigned to this drive",
                "status": 404
            }

        object_ids = [
            ObjectId(qid) if isinstance(qid, str) else qid
            for qid in technical_question_ids
        ]

        questions = list(db.technical_questions.find({"_id": {"$in": object_ids}}))
        for question in questions:
            serialize_mongo_doc(question)

        return questions

    except Exception as e:
        print(f"Error fetching technical questions: {str(e)}")
        return {
            "error": "Failed to fetch technical questions",
            "details": str(e),
            "status": 500
        }


def submit_technical_question_answers(data):
    """
    Store candidate text answers for technical-round questions.
    """
    try:
        candidate_id = data.get("candidate_id")
        drive_id = data.get("drive_id")
        answers = data.get("answers", [])

        if not candidate_id:
            return {"error": "candidate_id is required", "status": 400}
        if not drive_id:
            return {"error": "drive_id is required", "status": 400}
        if not isinstance(answers, list) or not answers:
            return {"error": "answers are required", "status": 400}

        sanitized_answers = []
        for answer in answers:
            question_id = answer.get("question_id")
            response_text = answer.get("answer", "")
            if not question_id:
                continue
            sanitized_answers.append({
                "question_id": question_id,
                "answer": str(response_text).strip(),
                "answered_at": datetime.utcnow()
            })

        if not sanitized_answers:
            return {"error": "No valid answers provided", "status": 400}

        result = db.technical_question_submissions.update_one(
            {"candidate_id": candidate_id, "drive_id": drive_id},
            {
                "$set": {
                    "candidate_id": candidate_id,
                    "drive_id": drive_id,
                    "answers": sanitized_answers,
                    "submitted_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "status": "submitted"
                },
                "$setOnInsert": {
                    "created_at": datetime.utcnow()
                }
            },
            upsert=True
        )

        return {
            "message": "Technical answers submitted successfully",
            "upserted_id": str(result.upserted_id) if result.upserted_id else None,
            "status": 200
        }

    except Exception as e:
        print(f"Error submitting technical answers: {str(e)}")
        return {"error": "Failed to submit technical answers", "details": str(e), "status": 500}


def save_technical_question_draft(data):
    """
    Autosave candidate text answers during the live technical interview.
    """
    try:
        drive_candidate_id = data.get("drive_candidate_id")
        candidate_id = data.get("candidate_id")
        drive_id = data.get("drive_id")
        answers = data.get("answers", [])

        if not candidate_id:
            return {"error": "candidate_id is required", "status": 400}
        if not drive_id:
            return {"error": "drive_id is required", "status": 400}
        if not isinstance(answers, list):
            return {"error": "answers must be a list", "status": 400}

        sanitized_answers = []
        for answer in answers:
            question_id = answer.get("question_id")
            if not question_id:
                continue

            sanitized_answers.append({
                "question_id": question_id,
                "question_text": str(answer.get("question_text", "")).strip(),
                "answer": str(answer.get("answer", "")).strip(),
                "updated_at": datetime.utcnow()
            })

        update_doc = {
            "candidate_id": candidate_id,
            "drive_id": drive_id,
            "answers": sanitized_answers,
            "status": "in_progress",
            "last_autosaved_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        if drive_candidate_id:
            update_doc["drive_candidate_id"] = drive_candidate_id

        result = db.technical_question_submissions.update_one(
            {"candidate_id": candidate_id, "drive_id": drive_id},
            {
                "$set": update_doc,
                "$setOnInsert": {
                    "created_at": datetime.utcnow()
                }
            },
            upsert=True
        )

        return {
            "message": "Technical answers autosaved",
            "upserted_id": str(result.upserted_id) if result.upserted_id else None,
            "status": 200
        }

    except Exception as e:
        print(f"Error autosaving technical answers: {str(e)}")
        return {"error": "Failed to autosave technical answers", "details": str(e), "status": 500}


def get_problem_by_id(problem_id):
    """
    Fetch a single coding problem by ID
    
    Args:
        problem_id (str): Problem ID
        
    Returns:
        dict: Problem data or error
    """
    try:
        problem = db.coding_questions.find_one({"_id": ObjectId(problem_id)})
        
        if not problem:
            return {"error": "Problem not found", "status": 404}
        
        # Convert ObjectId to string
        problem['_id'] = str(problem['_id'])
        
        # Handle datetime fields
        if 'created_at' in problem and isinstance(problem['created_at'], datetime):
            problem['created_at'] = problem['created_at'].isoformat()
        if 'updated_at' in problem and isinstance(problem['updated_at'], datetime):
            problem['updated_at'] = problem['updated_at'].isoformat()
        
        return problem
        
    except Exception as e:
        print(f"Error fetching problem: {str(e)}")
        return {"error": "Failed to fetch problem", "details": str(e), "status": 500}


def create_problem(data):
    """
    Create a new coding problem
    
    Args:
        data (dict): Problem data
        
    Returns:
        dict: Created problem or error
    """
    try:
        # Validate required fields
        required_fields = ['title', 'description', 'test_cases']
        for field in required_fields:
            if field not in data:
                return {"error": f"Missing required field: {field}", "status": 400}
        
        problem = {
            "title": data['title'],
            "description": data['description'],
            "constraints": data.get('constraints', []),
            "test_cases": data['test_cases'],
            "difficulty": data.get('difficulty', 'Medium'),
            "tags": data.get('tags', []),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = db.coding_questions.insert_one(problem)
        problem['_id'] = str(result.inserted_id)
        problem['created_at'] = problem['created_at'].isoformat()
        problem['updated_at'] = problem['updated_at'].isoformat()
        
        return {"message": "Problem created successfully", "problem": problem, "status": 201}
        
    except Exception as e:
        print(f"Error creating problem: {str(e)}")
        return {"error": "Failed to create problem", "details": str(e), "status": 500}


def update_problem(problem_id, data):
    """
    Update an existing coding problem
    
    Args:
        problem_id (str): Problem ID
        data (dict): Updated problem data
        
    Returns:
        dict: Success message or error
    """
    try:
        update_data = {}
        allowed_fields = ['title', 'description', 'constraints', 'test_cases', 'difficulty', 'tags']
        
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]
        
        update_data['updated_at'] = datetime.utcnow()
        
        result = db.coding_questions.update_one(
            {"_id": ObjectId(problem_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            return {"error": "Problem not found", "status": 404}
        
        return {"message": "Problem updated successfully", "status": 200}
        
    except Exception as e:
        print(f"Error updating problem: {str(e)}")
        return {"error": "Failed to update problem", "details": str(e), "status": 500}


def delete_problem(problem_id):
    """
    Delete a coding problem
    
    Args:
        problem_id (str): Problem ID
        
    Returns:
        dict: Success message or error
    """
    try:
        result = db.coding_questions.delete_one({"_id": ObjectId(problem_id)})
        
        if result.deleted_count == 0:
            return {"error": "Problem not found", "status": 404}
        
        return {"message": "Problem deleted successfully", "status": 200}
        
    except Exception as e:
        print(f"Error deleting problem: {str(e)}")
        return {"error": "Failed to delete problem", "details": str(e), "status": 500}


def get_problem_count_by_drive(drive_id):
    """
    Returns only the total count of questions assigned to a specific drive.
    
    Args:
        drive_id (str): The ID of the drive
        
    Returns:
        dict: Object containing the count or an error
    """
    try:
        # We use projection {"coding_question_ids": 1} to only pull the necessary field
        drive = db.drives.find_one(
            {"_id": ObjectId(drive_id)}, 
            {"coding_question_ids": 1}
        )
        
        if not drive:
            return {"error": "Drive not found", "status": 404}
        
        # Get the list of IDs and return its length
        question_ids = drive.get('coding_question_ids', [])
        return {
            "drive_id": drive_id,
            "question_count": len(question_ids),
            "status": 200
        }
        
    except Exception as e:
        print(f"Error getting problem count: {str(e)}")
        return {"error": "Failed to get count", "details": str(e), "status": 500}
