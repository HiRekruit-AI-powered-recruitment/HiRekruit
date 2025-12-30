# routes/livekit_routes.py

from flask import Blueprint, request, jsonify
import os
from src.Utils.LivekitService import generate_livekit_token

livekit_bp = Blueprint("livekit", __name__)

LIVEKIT_URL = os.getenv("LIVEKIT_URL", "ws://localhost:7880")

@livekit_bp.route("/token", methods=["GET"])
def get_livekit_token():
    """
    Generate LiveKit access token for a participant
    
    Query Parameters:
    - driveCandidateId: string (required) - Unique ID for the interview
    - type: string (required) - Interview type (hr, technical, etc.)
    - role: string (required) - "candidate" or "hr"
    - identity: string (optional) - Custom identity, falls back to role_driveCandidateId
    
    Returns:
    - token: JWT access token
    - roomName: Name of the LiveKit room
    - livekitUrl: WebSocket URL for LiveKit server
    - identity: Participant identity
    - role: Participant role
    """
    try:
        print("🔑 Get LiveKit token route called")
        
        # Get query parameters
        drive_candidate_id = request.args.get("driveCandidateId")
        interview_type = request.args.get("type")
        role = request.args.get("role")
        custom_identity = request.args.get("identity")  # Optional custom identity

        # Validate required parameters
        if not drive_candidate_id:
            return jsonify({"error": "Missing parameter: driveCandidateId"}), 400
        
        if not interview_type:
            return jsonify({"error": "Missing parameter: type"}), 400
        
        if not role:
            return jsonify({"error": "Missing parameter: role"}), 400
        
        # Validate role
        if role not in ["candidate", "hr"]:
            return jsonify({"error": "Invalid role. Must be 'candidate' or 'hr'"}), 400

        # Generate room name
        room_name = f"interview_{drive_candidate_id}_{interview_type}"
        
        # Generate identity
        # Use custom identity if provided, otherwise generate from role
        if custom_identity:
            # Clean up identity (remove spaces, special chars)
            identity = custom_identity.replace(" ", "_").replace("-", "_")
        else:
            identity = f"{role}_{drive_candidate_id}"

        print(f"📋 Generating token for:")
        print(f"   Room: {room_name}")
        print(f"   Identity: {identity}")
        print(f"   Role: {role}")

        # Generate token using service
        token = generate_livekit_token(
            room_name=room_name,
            identity=identity,
            role=role
        )

        if not token:
            return jsonify({"error": "Failed to generate token"}), 500

        print(f"✅ Token generated successfully for {identity}")

        # Return token and connection details
        response = {
            "token": token,
            "roomName": room_name,
            "livekitUrl": LIVEKIT_URL,
            "identity": identity,
            "role": role
        }

        return jsonify(response), 200

    except Exception as e:
        print(f"❌ Error generating LiveKit token: {str(e)}")
        return jsonify({
            "error": "Failed to generate token",
            "message": str(e)
        }), 500


@livekit_bp.route("/room/<room_name>", methods=["GET"])
def get_room_info(room_name):
    """
    Get information about a specific room
    
    Path Parameters:
    - room_name: string (required) - Name of the room
    
    Returns:
    - roomName: Name of the room
    - status: Room status
    """
    try:
        print(f"📊 Getting info for room: {room_name}")
        
        # Here you could use LiveKit RoomService to get actual room info
        # For now, return basic info
        response = {
            "roomName": room_name,
            "status": "active",
            "livekitUrl": LIVEKIT_URL
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        print(f"❌ Error getting room info: {str(e)}")
        return jsonify({
            "error": "Failed to get room info",
            "message": str(e)
        }), 500


@livekit_bp.route("/room/<room_name>/close", methods=["POST"])
def close_room(room_name):
    """
    Close a specific room
    
    Path Parameters:
    - room_name: string (required) - Name of the room to close
    
    Returns:
    - success: boolean
    - message: string
    """
    try:
        print(f"📴 Closing room: {room_name}")
        
        # Here you would use LiveKit RoomService to close the room
        # Example:
        # from livekit import RoomServiceClient
        # room_service = RoomServiceClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
        # await room_service.delete_room(room_name)
        
        response = {
            "success": True,
            "message": f"Room {room_name} closed successfully"
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        print(f"❌ Error closing room: {str(e)}")
        return jsonify({
            "error": "Failed to close room",
            "message": str(e)
        }), 500


@livekit_bp.route("/health", methods=["GET"])
def health_check():
    """
    Health check endpoint for LiveKit service
    
    Returns:
    - status: Service status
    - livekitUrl: WebSocket URL
    """
    try:
        # Check if environment variables are set
        api_key = os.getenv("LIVEKIT_API_KEY")
        api_secret = os.getenv("LIVEKIT_API_SECRET")
        
        if not api_key or not api_secret:
            return jsonify({
                "status": "error",
                "message": "LiveKit credentials not configured"
            }), 500
        
        return jsonify({
            "status": "healthy",
            "livekitUrl": LIVEKIT_URL,
            "configured": True
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500