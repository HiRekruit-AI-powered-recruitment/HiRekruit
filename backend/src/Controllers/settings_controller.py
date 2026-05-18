from flask import request, jsonify
from src.Utils.Database import db
from src.Model.Feedback import create_feedback
from bson import ObjectId
from datetime import datetime

def submit_feedback():
    try:
        data = request.json
        user_id = data.get("user_id")
        name = data.get("name", "Unknown User")
        email = data.get("email", "Unknown Email")
        company_name = data.get("company_name", "Unknown Company")
        message = data.get("message")

        if not message:
            return jsonify({"error": "Feedback message is required."}), 400

        feedback_doc = create_feedback(
            user_id=ObjectId(user_id) if user_id else None,
            name=name,
            email=email,
            company_name=company_name,
            message=message
        )

        result = db.feedbacks.insert_one(feedback_doc)
        
        if result.inserted_id:
            return jsonify({"message": "Feedback submitted successfully.", "id": str(result.inserted_id)}), 201
        else:
            return jsonify({"error": "Failed to submit feedback."}), 500

    except Exception as e:
        print(f"Error in submit_feedback: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

def get_all_feedback():
    try:
        status_filter = request.args.get("status")
        query = {}
        if status_filter:
            query["status"] = status_filter

        feedbacks = list(db.feedbacks.find(query).sort("created_at", -1))

        # Format output
        formatted_feedbacks = []
        for f in feedbacks:
            f["_id"] = str(f["_id"])
            if f.get("user_id"):
                f["user_id"] = str(f["user_id"])
            formatted_feedbacks.append(f)

        return jsonify(formatted_feedbacks), 200

    except Exception as e:
        print(f"Error in get_all_feedback: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

def update_feedback_status(feedback_id):
    try:
        data = request.json
        new_status = data.get("status")

        if new_status not in ["pending", "resolved"]:
            return jsonify({"error": "Invalid status."}), 400

        result = db.feedbacks.update_one(
            {"_id": ObjectId(feedback_id)},
            {"$set": {"status": new_status, "updated_at": datetime.utcnow()}}
        )

        if result.modified_count > 0:
            return jsonify({"message": "Status updated successfully."}), 200
        else:
            return jsonify({"error": "Feedback not found or status already matches."}), 404

    except Exception as e:
        print(f"Error in update_feedback_status: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
