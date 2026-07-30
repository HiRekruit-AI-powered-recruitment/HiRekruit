from flask_socketio import emit

from src.SocketIO.SocketIO_Instance import socketio
from src.Routes.Sarvam_interview_routes import register_sarvam_socketio


# -----------------------------
# Common Socket Events
# -----------------------------

@socketio.on("connect")
def on_connect():
    print("🔌 Client connected")

    emit("server_ready", {
        "msg": "Connected to MockInterview live server"
    })


@socketio.on("disconnect")
def on_disconnect():
    print("🔌 Client disconnected")


# -----------------------------
# Register Sarvam Socket Events
# -----------------------------

register_sarvam_socketio(socketio)