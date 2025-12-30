# models/interview.py
from dataclasses import dataclass
from datetime import datetime

@dataclass
class Interview:
    id: str
    room_name: str
    candidate_token: str
    panel_token: str
    status: str  # scheduled | active | completed
    created_at: datetime
