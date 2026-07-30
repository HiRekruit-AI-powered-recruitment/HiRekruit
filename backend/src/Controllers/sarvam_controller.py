import threading
from src.Utils.SarvamService import SarvamService


class SarvamInterviewController:
    def __init__(self):
        self.conversation_history = []
        self.resume = ""
        self.prompt = ""
        self.interview_type = "general"
        self.is_muted = False
        self.sid = None

        self.sarvam_service = SarvamService()

        self.lock = threading.Lock()

    def start_interview(self, socketio, sid, data):
        """
        Called when frontend sends:
        type = start_interview
        """

        self.sid = sid

        self.resume = data.get("resumeText", "")
        self.prompt = data.get("prompt", "")
        self.interview_type = data.get("interviewType", "general")

        # Ignore frontend history while testing
        self.conversation_history = []

        print("========== NEW INTERVIEW ==========")
        print("Resume Length :", len(self.resume))
        print("Interview Type :", self.interview_type)
        print("History :", len(self.conversation_history))

        self.sarvam_service.start_interview(
            socketio=socketio,
            sid=sid,
            resume=self.resume,
            prompt=self.prompt,
            history=self.conversation_history,
        )

    def receive_audio(self, socketio, sid, data):
        """
        Audio chunks from frontend.
        """

        if self.is_muted:
            return

        audio = data.get("audio")

        if not audio:
            return

        print("Received Audio Chunk")

        self.sarvam_service.process_audio(
            socketio=socketio,
            sid=sid,
            audio_chunk=audio,
        )

    def written_answer(self, socketio, sid, data):
        """
        Candidate typed answer.
        """

        answers = data.get("answers")

        if not answers:
            return

        self.conversation_history.append(
            {
                "role": "user",
                "content": str(answers),
            }
        )

        print("Written Answer Updated")

        self.sarvam_service.generate_next_question(
            socketio=socketio,
            sid=sid,
        )

    def update_mute(self, data):
        """
        Frontend mute state.
        """

        self.is_muted = data.get("muted", False)

        print("Muted :", self.is_muted)

    def add_user_message(self, text):
        self.conversation_history.append(
            {
                "role": "user",
                "content": text,
            }
        )

    def add_assistant_message(self, text):
        self.conversation_history.append(
            {
                "role": "assistant",
                "content": text,
            }
        )

    def get_history(self):
        return self.conversation_history

    def stop_interview(self, socketio):
        """
        Interview completed.
        """

        print("Interview Finished")

        self.sarvam_service.cleanup()

        socketio.emit(
            "interview_completed",
            {
                "type": "interview_completed",
            },
            room=self.sid,
        )

    def cleanup(self):
        """
        Socket disconnected.
        """

        self.conversation_history.clear()

        self.resume = ""
        self.prompt = ""
        self.sid = None

        self.sarvam_service.cleanup()