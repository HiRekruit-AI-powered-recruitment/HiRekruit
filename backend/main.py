from flask import Flask
from flask_cors import CORS
import os
from src.Routes.interview_routes import interview_bp
from src.Routes.resume_routes import resume_bp
from src.Routes.user_routes import auth_bp
from src.Routes.drive_routes import drive_bp
from src.Routes.chatbot_routes import chatbot_bp
from src.Controllers.allresumes_controller import get_allresumes_controller
from src.Controllers import interview_controller
from src.Config.auth_config import AuthConfig

# for coding-assessment
from src.CodingAssessment.Routes.problem_routes import problem_bp
from src.CodingAssessment.Routes.submission_routes import submission_bp


# Import the database to initialize connection
from src.Utils.Database import db

app = Flask(__name__, static_folder="static", static_url_path="/static")

app.config.update(
    SESSION_COOKIE_SAMESITE="None",  # REQUIRED for cross-domain
    SESSION_COOKIE_SECURE=True,      # REQUIRED for HTTPS
    SESSION_COOKIE_HTTPONLY=True
)



# Enable CORS
CORS(
    app,
    resources={r"/api/*": {
        "origins": [
            "http://localhost:5173",
            "https://www.hirekruit.com"
        ],
        "allow_headers": ["Content-Type", "Authorization"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "supports_credentials": True
    }}
)

app.secret_key = AuthConfig.SECRET_KEY

# Register routes
app.register_blueprint(interview_bp, url_prefix="/api/interview")
app.register_blueprint(resume_bp, url_prefix="/api/resume")
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(drive_bp, url_prefix = "/api/drive")
app.register_blueprint(chatbot_bp, url_prefix="/api/chatbot")

# for coding-assessment
app.register_blueprint(problem_bp, url_prefix="/api/coding-assessment/problem")
app.register_blueprint(submission_bp, url_prefix="/api/coding-assessment/submission")




if __name__ == "__main__":
    print("Flask server started on http://localhost:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
