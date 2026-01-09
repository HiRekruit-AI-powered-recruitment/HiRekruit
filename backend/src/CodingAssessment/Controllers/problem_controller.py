import json
import os

from bson import ObjectId
from datetime import datetime

# Assuming you have database access
from src.Utils.Database import db

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
        
        # Convert ObjectId to string for JSON serialization
        for problem in problems:
            problem['_id'] = str(problem['_id'])
            
            # Handle datetime fields
            if 'created_at' in problem and isinstance(problem['created_at'], datetime):
                problem['created_at'] = problem['created_at'].isoformat()
            if 'updated_at' in problem and isinstance(problem['updated_at'], datetime):
                problem['updated_at'] = problem['updated_at'].isoformat()
        
        return problems
        
    except Exception as e:
        print(f"Error fetching problems: {str(e)}")
        return {"error": "Failed to fetch coding problems", "details": str(e), "status": 500}


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