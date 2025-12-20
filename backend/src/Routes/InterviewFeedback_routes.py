# routes/feedback_routes.py

from flask import Blueprint, request, jsonify
from src.Controllers.InterviewFeedback_controller import FeedbackController

feedback_bp = Blueprint('feedback', __name__)
feedback_controller = FeedbackController()


@feedback_bp.route('/submit', methods=['POST'])
def submit_interview_feedback():
    """
    Submit candidate feedback after interview completion
    
    Request Body:
    {
        "drive_candidate_id": "string",
        "interview_type": "string",
        "candidate_email": "string",
        "candidate_name": "string",
        "overall_experience": int (1-5),
        "interview_difficulty": int (1-5),
        "technical_relevance": int (1-5),
        "interviewer_behavior": int (1-5),
        "platform_usability": int (1-5),
        "would_recommend": "yes" | "maybe" | "no",
        "improvements": "string",
        "additional_comments": "string" (optional)
    }
    
    Returns:
        201: Feedback submitted successfully
        400: Validation error
        500: Internal server error
    """
    print("Interview feedback submit route called")
    try:
        data = request.get_json()
        return feedback_controller.submit_feedback(data)
    except Exception as e:
        print(f"Error in submit_interview_feedback route: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500


@feedback_bp.route('/api/interview/feedback/<drive_candidate_id>', methods=['GET'])
def get_candidate_feedback(drive_candidate_id):
    """
    Get feedback submitted by a specific candidate
    
    Args:
        drive_candidate_id: ID of the drive candidate
    
    Returns:
        200: Feedback data
        404: Feedback not found
        500: Internal server error
    """
    try:
        return feedback_controller.get_feedback_by_candidate(drive_candidate_id)
    except Exception as e:
        print(f"Error in get_candidate_feedback route: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500


@feedback_bp.route('/api/interview/feedback/analytics', methods=['GET'])
def get_feedback_analytics():
    """
    Get aggregated feedback analytics
    
    Query Parameters:
        interview_type (optional): Filter by interview type
    
    Returns:
        200: Analytics data
        500: Internal server error
    """
    try:
        interview_type = request.args.get('interview_type')
        return feedback_controller.get_feedback_analytics(interview_type)
    except Exception as e:
        print(f"Error in get_feedback_analytics route: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500


@feedback_bp.route('/api/interview/feedback/all', methods=['GET'])
def get_all_feedback():
    """
    Get all feedback with pagination
    
    Query Parameters:
        page (optional): Page number (default: 1)
        limit (optional): Items per page (default: 10)
        interview_type (optional): Filter by interview type
        sort_by (optional): Field to sort by (default: submitted_at)
        sort_order (optional): asc or desc (default: desc)
    
    Returns:
        200: List of feedback
        500: Internal server error
    """
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        interview_type = request.args.get('interview_type')
        sort_by = request.args.get('sort_by', 'submitted_at')
        sort_order = request.args.get('sort_order', 'desc')
        
        return feedback_controller.get_all_feedback(
            page=page,
            limit=limit,
            interview_type=interview_type,
            sort_by=sort_by,
            sort_order=sort_order
        )
    except Exception as e:
        print(f"Error in get_all_feedback route: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500


@feedback_bp.route('/api/interview/feedback/stats', methods=['GET'])
def get_feedback_stats():
    """
    Get feedback statistics and trends
    
    Query Parameters:
        days (optional): Number of days to include (default: 30)
    
    Returns:
        200: Statistics data
        500: Internal server error
    """
    try:
        days = int(request.args.get('days', 30))
        return feedback_controller.get_feedback_stats(days)
    except Exception as e:
        print(f"Error in get_feedback_stats route: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500


@feedback_bp.route('/api/interview/feedback/export', methods=['GET'])
def export_feedback():
    """
    Export feedback data to CSV
    
    Query Parameters:
        interview_type (optional): Filter by interview type
        start_date (optional): Start date (YYYY-MM-DD)
        end_date (optional): End date (YYYY-MM-DD)
    
    Returns:
        200: CSV file
        500: Internal server error
    """
    try:
        interview_type = request.args.get('interview_type')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        return feedback_controller.export_feedback_to_csv(
            interview_type=interview_type,
            start_date=start_date,
            end_date=end_date
        )
    except Exception as e:
        print(f"Error in export_feedback route: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500


@feedback_bp.route('/api/interview/feedback/<feedback_id>', methods=['DELETE'])
def delete_feedback(feedback_id):
    """
    Delete a feedback entry (admin only)
    
    Args:
        feedback_id: ID of the feedback to delete
    
    Returns:
        200: Feedback deleted successfully
        404: Feedback not found
        500: Internal server error
    """
    try:
        return feedback_controller.delete_feedback(feedback_id)
    except Exception as e:
        print(f"Error in delete_feedback route: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500