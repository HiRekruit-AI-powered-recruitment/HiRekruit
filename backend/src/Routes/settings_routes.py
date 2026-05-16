from flask import Blueprint
from src.Controllers.settings_controller import submit_feedback, get_all_feedback, update_feedback_status

settings_routes = Blueprint("settings_routes", __name__)

settings_routes.route("/feedback/submit", methods=["POST"])(submit_feedback)
settings_routes.route("/feedback/all", methods=["GET"])(get_all_feedback)
settings_routes.route("/feedback/<feedback_id>/status", methods=["PUT"])(update_feedback_status)
