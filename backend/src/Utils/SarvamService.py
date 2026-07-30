import os
import traceback

from sarvamai import SarvamAI
from sarvamai import ChatCompletionRequestMessage_User


class SarvamService:

    def __init__(self):

        print("🚀 Initializing SarvamService")

        self.client = SarvamAI(
            api_subscription_key=os.getenv("SARVAM_API_KEY")
        )

        self.resume = ""
        self.prompt = ""
        self.history = []
        # self.test_answer_sent = False
        self.fake_answer_count = 0
        self.is_speaking = False

    def start_interview(
        self,
        socketio,
        sid,
        resume,
        prompt,
        history,
    ):

        print("\n==============================")
        print("INSIDE start_interview()")
        print("==============================")

        self.resume = resume
        self.prompt = prompt
        self.history = history or []
        # self.test_answer_sent = False
        self.fake_answer_count = 0

        print("Resume Length :", len(self.resume))
        print("History Length :", len(self.history))

        socketio.emit(
            "interview_started",
            {
                "type": "interview_started"
            },
            room=sid,
        )

        print("✅ interview_started emitted")

        print("Calling generate_next_question()...")

        self.is_speaking = True

        self.generate_next_question(
            socketio=socketio,
            sid=sid,
        )

    def process_audio(
        self,
        socketio,
        sid,
        audio_chunk,
    ):
        """
        Temporary fake STT.
        Generates the next question once after receiving audio.
        """


        print("\n========== AUDIO DEBUG ==========")
        print("Type :", type(audio_chunk))
        print("Length :", len(audio_chunk))

        if isinstance(audio_chunk, str):
            print("First 150 chars:")
            print(audio_chunk[:150])
        else:
            print("First 30 bytes:")
            print(audio_chunk[:30])

        print("================================\n")        
        print("is_speaking =", self.is_speaking)
        if self.is_speaking:
            print("Ignoring audio while assistant is speaking")
            return

        # Only process the first fake answer
        # if self.test_answer_sent:
        #     return

        # self.test_answer_sent = True    
        if self.fake_answer_count >= 3:
            return

        self.fake_answer_count += 1

        answers = [
            "I built a FastAPI backend for a recruitment platform with JWT authentication and PostgreSQL.",
            "I used SQLAlchemy ORM because it simplified database operations and relationships.",
            "One challenge was handling concurrent requests efficiently, which I solved using async APIs.",
            "I integrated AI using Sarvam APIs to build a voice interview assistant."
        ]

        fake_answer = answers[min(self.fake_answer_count - 1, len(answers) - 1)]

        print("Using fake transcript:")
        print(fake_answer)

        # Prevent more chunks while LLM is processing
        self.is_speaking = True

        self.history.append(
            {
                "role": "user",
                "content": fake_answer,
            }
        )

        self.generate_next_question(
            socketio=socketio,
            sid=sid,
        )

    def generate_next_question(
        self,
        socketio,
        sid,
    ):
        try:

            # First question
            if len(self.history) == 0:

                prompt = f"""
    You are an HR interviewer.

    Candidate Resume:
    {self.resume[:2500]}

    Ask ONLY ONE short interview question.

    Rules:
    - Do not greet.
    - Do not introduce yourself.
    - Ask exactly one question.
    - Maximum 20 words.
    """

            # Remaining questions
            else:

                prompt = f"""
    You are an HR interviewer.

    Conversation so far:

    {self.history[-6:]}

    Ask ONLY the next interview question.

    Rules:
    - Ask only ONE question.
    - Maximum 20 words.
    - No explanation.
    - No greeting.
    """

            response = self.client.chat.completions(
                model="sarvam-105b",
                messages = [
                    {
                        "role": "system",
                        "content": """
                You are an HR interviewer.

                Always ask exactly ONE interview question.

                Never explain.

                Never think aloud.

                Never output reasoning.

                Return ONLY the interview question.
                """
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    },
                ],
                temperature=0.2,
                max_tokens=50,
               
            )

            print("\n========== RAW LLM RESPONSE ==========")
            print(response)
            print("======================================\n")

            message = response.choices[0].message

            if message.content:
                question = message.content.strip()

            elif hasattr(message, "reasoning_content") and message.reasoning_content:
                print("⚠ Model returned only reasoning.")
                question = "Can you describe one FastAPI project you worked on?"

            else:
                print("⚠ Empty model response.")
                question = "Can you introduce yourself?"

            print("Question:")
            print(question)

            self.history.append(
                {
                    "role": "assistant",
                    "content": question,
                }
            )

            # self.is_speaking = True

            socketio.emit(
                "assistant_response",
                {
                    "type": "assistant_response",
                    "text": question,
                },
                room=sid,
            )

            self.text_to_speech(
                socketio=socketio,
                sid=sid,
                text=question,
            )

        except Exception:
            self.is_speaking = False
            traceback.print_exc()
    def text_to_speech(
        self,
        socketio,
        sid,
        text,
    ):

        try:

            print("\n🔊 INSIDE text_to_speech()")

            response = self.client.text_to_speech.convert(
                text=text,
                target_language_code="en-IN",
                model="bulbul:v3",
                speaker="priya",
            )

            print("✅ TTS API Success")

            audio_base64 = response.audios[0]

            socketio.emit(
                "audio",
                {
                    "type": "audio",
                    "audio": audio_base64,
                },
                room=sid,
            )

            import threading

            threading.Timer(
                8,
                lambda: setattr(self, "is_speaking", False)
            ).start()   

            print("✅ Audio emitted to frontend")

        except Exception:
            self.is_speaking = False
            print("\n❌ ERROR INSIDE text_to_speech()")
            traceback.print_exc()

    def cleanup(self):

        print("🧹 Cleaning SarvamService")

        self.resume = ""
        self.prompt = ""
        self.history = []