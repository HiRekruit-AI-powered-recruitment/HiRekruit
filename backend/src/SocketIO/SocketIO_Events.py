from flask_socketio import emit
from src.SocketIO.SocketIO_Instance import socketio
# from src.Controllers.Live_Controller import handle_utterance

# Register Guard 2 proctoring Socket.IO events
import src.SocketIO.proctoring_socket_events  # noqa: F401

@socketio.on("connect")
def on_connect():
    print("🔌 Client connected")
    emit("server_ready", {"msg": "Connected to MockInterview live server"})

@socketio.on("disconnect")
def on_disconnect():
    print("🔌 Client disconnected")

# @socketio.on("utterance")
# def on_utterance(data):
#     """
#     data: {
#       "buffer": <binary ArrayBuffer>,
#       "mime": "audio/webm"
#     }
#     """
#     try:
#         result = handle_utterance(data)
#         emit("agent_reply", result)
#     except Exception as e:
#         print("Error in on_utterance:", e)
#         emit("agent_reply", {"reply": "Sorry, I had trouble hearing that.", "error": True})
