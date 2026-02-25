from flask import Blueprint
from src.Controllers.notification_controller import get_drive_deadline_notifications

notification_bp = Blueprint("notification_bp", __name__, url_prefix="/api/notifications")

# GET /api/notifications/drive-deadlines?company_id=<id>
notification_bp.route("/drive-deadlines", methods=["GET"])(get_drive_deadline_notifications)
