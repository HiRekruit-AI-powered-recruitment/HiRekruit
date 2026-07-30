from flask import request
from flask_socketio import emit

from src.Controllers.sarvam_controller import SarvamInterviewController

controller = SarvamInterviewController()


def register_sarvam_socketio(socketio):
    """
    Register all SocketIO events related to Sarvam Interview.
    """

    @socketio.on("connect")
    def handle_connect():
        print("✅ Client connected:", request.sid)

        emit("connected", {
            "status": "connected",
            "sid": request.sid,
            "message": "Connected to Sarvam Interview Server"
        })


    @socketio.on("disconnect")
    def handle_disconnect():
        print("❌ Client disconnected:", request.sid)

        controller.cleanup()


    @socketio.on("start_interview")
    def start_interview(data):
        """
        Starts Sarvam interview.
        """

        print("🎤 Starting interview for:", request.sid)

        controller.start_interview(
            socketio=socketio,
            sid=request.sid,
            data=data
        )


    @socketio.on("audio")
    def receive_audio(data):
        """
        Receives microphone chunks.
        """

        controller.receive_audio(
            socketio=socketio,
            sid=request.sid,
            data=data
        )


    @socketio.on("written_answer_update")
    def written_answer(data):
        """
        Candidate typed answer.
        """

        controller.written_answer(
            socketio=socketio,
            sid=request.sid,
            data=data
        )


    @socketio.on("mute")
    def mute(data):
        """
        Candidate mute/unmute.
        """

        controller.update_mute(
            data
        )


    @socketio.on("stop_interview")
    def stop():
        """
        End interview.
        """

        controller.stop_interview(
            socketio
        )