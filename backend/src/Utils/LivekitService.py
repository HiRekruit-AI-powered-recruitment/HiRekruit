# src/Utils/LivekitService.py

import os
from livekit import api
from datetime import timedelta

# Environment variables
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")
LIVEKIT_URL = os.getenv("LIVEKIT_URL", "ws://localhost:7880")


def generate_livekit_token(room_name, identity, role, ttl_hours=24):
    """
    Generate a LiveKit access token for a participant
    
    Args:
        room_name (str): Name of the LiveKit room
        identity (str): Unique identifier for the participant
        role (str): Role of the participant ('candidate' or 'hr')
        ttl_hours (int): Token validity in hours (default: 24)
    
    Returns:
        str: JWT access token
    
    Raises:
        ValueError: If credentials are missing or role is invalid
        Exception: If token generation fails
    """
    print(f"🔑 Generating LiveKit token for {identity} in room {room_name}")
    
    # Validate credentials
    if not LIVEKIT_API_KEY or not LIVEKIT_API_SECRET:
        error_msg = "LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be set in environment"
        print(f"❌ {error_msg}")
        raise ValueError(error_msg)
    
    # Validate role
    if role not in ["candidate", "hr"]:
        error_msg = f"Invalid role: {role}. Must be 'candidate' or 'hr'"
        print(f"❌ {error_msg}")
        raise ValueError(error_msg)
    
    try:
        # Set permissions based on role
        # Both candidate and HR can publish (speak/show video)
        # HR can also publish to ask questions
        can_publish = True  # Both roles can publish
        can_subscribe = True  # Both can see/hear others
        can_publish_data = True  # Both can send data messages
        
        print(f"📋 Permissions for {role}:")
        print(f"   - Can Publish: {can_publish}")
        print(f"   - Can Subscribe: {can_subscribe}")
        print(f"   - Can Publish Data: {can_publish_data}")
        
        # Create video grants
        grants = api.VideoGrants(
            room_join=True,
            room=room_name,
            can_subscribe=can_subscribe,
            can_publish=can_publish,
            can_publish_data=can_publish_data,
        )
        
        # Create access token
        token = api.AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
        
        # Set identity
        token = token.with_identity(identity)
        
        # Set grants
        token = token.with_grants(grants)
        
        # Set TTL (time to live)
        # Token will expire after specified hours
        token = token.with_ttl(timedelta(hours=ttl_hours))
        
        # Generate JWT
        jwt_token = token.to_jwt()
        
        print(f"✅ Token generated successfully for {identity}")
        print(f"   Token valid for: {ttl_hours} hours")
        
        return jwt_token
        
    except Exception as e:
        error_msg = f"Failed to generate LiveKit token: {str(e)}"
        print(f"❌ {error_msg}")
        raise Exception(error_msg)


def generate_readonly_token(room_name, identity, ttl_hours=24):
    """
    Generate a read-only LiveKit token (for observers)
    
    Args:
        room_name (str): Name of the LiveKit room
        identity (str): Unique identifier for the participant
        ttl_hours (int): Token validity in hours (default: 24)
    
    Returns:
        str: JWT access token with read-only permissions
    """
    print(f"👁️ Generating read-only token for {identity} in room {room_name}")
    
    if not LIVEKIT_API_KEY or not LIVEKIT_API_SECRET:
        raise ValueError("LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be set")
    
    try:
        # Read-only permissions
        grants = api.VideoGrants(
            room_join=True,
            room=room_name,
            can_subscribe=True,  # Can see/hear
            can_publish=False,   # Cannot publish video/audio
            can_publish_data=False,  # Cannot send data
        )
        
        token = (
            api.AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
            .with_identity(identity)
            .with_grants(grants)
            .with_ttl(timedelta(hours=ttl_hours))
        )
        
        jwt_token = token.to_jwt()
        
        print(f"✅ Read-only token generated for {identity}")
        
        return jwt_token
        
    except Exception as e:
        error_msg = f"Failed to generate read-only token: {str(e)}"
        print(f"❌ {error_msg}")
        raise Exception(error_msg)


def generate_admin_token(room_name, identity, ttl_hours=24):
    """
    Generate an admin LiveKit token (full permissions)
    
    Args:
        room_name (str): Name of the LiveKit room
        identity (str): Unique identifier for the admin
        ttl_hours (int): Token validity in hours (default: 24)
    
    Returns:
        str: JWT access token with admin permissions
    """
    print(f"👑 Generating admin token for {identity} in room {room_name}")
    
    if not LIVEKIT_API_KEY or not LIVEKIT_API_SECRET:
        raise ValueError("LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be set")
    
    try:
        # Admin permissions
        grants = api.VideoGrants(
            room_join=True,
            room=room_name,
            can_subscribe=True,
            can_publish=True,
            can_publish_data=True,
            room_admin=True,  # Admin can kick participants, etc.
            room_record=True,  # Can record the room
        )
        
        token = (
            api.AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
            .with_identity(identity)
            .with_grants(grants)
            .with_ttl(timedelta(hours=ttl_hours))
        )
        
        jwt_token = token.to_jwt()
        
        print(f"✅ Admin token generated for {identity}")
        
        return jwt_token
        
    except Exception as e:
        error_msg = f"Failed to generate admin token: {str(e)}"
        print(f"❌ {error_msg}")
        raise Exception(error_msg)


def validate_livekit_config():
    """
    Validate that LiveKit configuration is properly set
    
    Returns:
        tuple: (is_valid: bool, error_message: str or None)
    """
    if not LIVEKIT_API_KEY:
        return False, "LIVEKIT_API_KEY is not set"
    
    if not LIVEKIT_API_SECRET:
        return False, "LIVEKIT_API_SECRET is not set"
    
    if not LIVEKIT_URL:
        return False, "LIVEKIT_URL is not set"
    
    print("✅ LiveKit configuration is valid")
    return True, None


# Optional: Room management functions (if you need them)

def get_room_service_client():
    """
    Create and return a LiveKit RoomServiceClient
    
    Returns:
        RoomServiceClient: Client for managing rooms
    """
    from livekit import RoomServiceClient
    
    if not LIVEKIT_API_KEY or not LIVEKIT_API_SECRET:
        raise ValueError("LiveKit credentials not configured")
    
    return RoomServiceClient(
        url=LIVEKIT_URL,
        api_key=LIVEKIT_API_KEY,
        api_secret=LIVEKIT_API_SECRET
    )


async def list_rooms():
    """
    List all active LiveKit rooms
    
    Returns:
        list: List of room names
    """
    try:
        client = get_room_service_client()
        rooms = await client.list_rooms()
        return [room.name for room in rooms]
    except Exception as e:
        print(f"❌ Error listing rooms: {str(e)}")
        return []


async def delete_room(room_name):
    """
    Delete a LiveKit room
    
    Args:
        room_name (str): Name of the room to delete
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        client = get_room_service_client()
        await client.delete_room(room_name)
        print(f"✅ Room {room_name} deleted successfully")
        return True
    except Exception as e:
        print(f"❌ Error deleting room {room_name}: {str(e)}")
        return False


async def get_room_participants(room_name):
    """
    Get list of participants in a room
    
    Args:
        room_name (str): Name of the room
    
    Returns:
        list: List of participant identities
    """
    try:
        client = get_room_service_client()
        participants = await client.list_participants(room_name)
        return [p.identity for p in participants]
    except Exception as e:
        print(f"❌ Error getting participants for room {room_name}: {str(e)}")
        return []


async def remove_participant(room_name, identity):
    """
    Remove a participant from a room
    
    Args:
        room_name (str): Name of the room
        identity (str): Identity of the participant to remove
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        client = get_room_service_client()
        await client.remove_participant(room_name, identity)
        print(f"✅ Participant {identity} removed from room {room_name}")
        return True
    except Exception as e:
        print(f"❌ Error removing participant {identity}: {str(e)}")
        return False