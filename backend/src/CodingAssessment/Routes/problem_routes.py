from flask import Blueprint, jsonify, request
from src.CodingAssessment.Controllers.problem_controller import (
    get_all_problems,
    get_problem_by_id,
    create_problem,
    update_problem,
    delete_problem,
    get_problem_count_by_drive
)

problem_bp = Blueprint("problem", __name__)


@problem_bp.route("/", methods=["GET"])
def problems():
    """
    GET /api/coding-assessment/problem
    
    Query Parameters:
        - drive_id (optional): Filter problems by drive ID
    
    Returns:
        - All problems if no drive_id provided
        - Problems associated with drive_id if provided
    """
    drive_id = request.args.get('drive_id')
    result = get_all_problems(drive_id=drive_id)
    
    # Check if result is an error dictionary
    if isinstance(result, dict) and 'error' in result:
        status_code = result.pop('status', 500)
        return jsonify(result), status_code
    
    return jsonify(result), 200


@problem_bp.route("/<problem_id>", methods=["GET"])
def problem(problem_id):
    """
    GET /api/coding-assessment/problem/<problem_id>
    
    Returns:
        - Single problem by ID
    """
    result = get_problem_by_id(problem_id)
    
    # Check if result is an error dictionary
    if isinstance(result, dict) and 'error' in result:
        status_code = result.pop('status', 404)
        return jsonify(result), status_code
    
    return jsonify(result), 200


@problem_bp.route("/", methods=["POST"])
def create():
    """
    POST /api/coding-assessment/problem
    
    Body:
        - title (required): Problem title
        - description (required): Problem description
        - test_cases (required): Array of test cases
        - constraints (optional): Array of constraints
        - difficulty (optional): Easy/Medium/Hard
        - tags (optional): Array of tags
    
    Returns:
        - Created problem
    """
    data = request.get_json()
    result = create_problem(data)
    
    status_code = result.pop('status', 201)
    return jsonify(result), status_code


@problem_bp.route("/<problem_id>", methods=["PUT"])
def update(problem_id):
    """
    PUT /api/coding-assessment/problem/<problem_id>
    
    Body:
        - Any problem fields to update
    
    Returns:
        - Success message
    """
    data = request.get_json()
    result = update_problem(problem_id, data)
    
    status_code = result.pop('status', 200)
    return jsonify(result), status_code


@problem_bp.route("/<problem_id>", methods=["DELETE"])
def delete(problem_id):
    """
    DELETE /api/coding-assessment/problem/<problem_id>
    
    Returns:
        - Success message
    """
    result = delete_problem(problem_id)
    
    status_code = result.pop('status', 200)
    return jsonify(result), status_code

@problem_bp.route("/count/<drive_id>", methods=["GET"])
def problem_count(drive_id):
    """
    GET /api/coding-assessment/problem/count/<drive_id>
    
    Returns:
        - The number of questions assigned to the specific drive
    """
    result = get_problem_count_by_drive(drive_id)
    
    # Check if result is an error dictionary
    if isinstance(result, dict) and 'error' in result:
        status_code = result.pop('status', 404)
        return jsonify(result), status_code
    
    return jsonify(result), 200