"""
voice_analyzer.py — Guard 2: Voice/speech analysis using Groq Whisper + LLM.

Separate module for all voice-related proctoring logic.

Flow:
  1. Receive base64 audio clip (WebM format from MediaRecorder)
  2. Transcribe with Groq Whisper (whisper-large-v3-turbo)
  3. If speech detected, analyze transcript with Groq LLM for suspiciousness
  4. Return structured result

Detects:
  - What the candidate is saying
  - If another person's voice is present (dictating answers)
  - If they're getting help from someone
"""

import base64
import json
import os
import re
import tempfile
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# ── Groq client (reuse same key as proctoring_controller) ──
_groq_client = None


def _get_client():
    """Lazy-init Groq client."""
    global _groq_client
    if _groq_client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY not found in environment variables")
        _groq_client = Groq(api_key=api_key)
    return _groq_client


def analyze_voice(audio_base64):
    """
    Analyze an audio clip: transcribe + check for suspicious speech.

    Args:
        audio_base64: Base64 encoded audio (WebM format).
                      May include data URL prefix (data:audio/webm;base64,...).

    Returns:
        dict with keys: transcript, suspicious, other_voices, details
    """
    tmp_path = None
    try:
        # Strip data URL prefix if present
        if "," in audio_base64:
            audio_base64 = audio_base64.split(",", 1)[1]

        audio_bytes = base64.b64decode(audio_base64)

        # Groq Whisper requires a file — write to temp
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        # ── Step 1: Transcribe with Whisper ──
        transcript = _transcribe_audio(tmp_path)

        # Clean up temp file
        _cleanup(tmp_path)
        tmp_path = None

        # If no meaningful speech, return clean result
        if not transcript or len(transcript.strip()) < 3:
            return {
                "transcript": "",
                "suspicious": False,
                "other_voices": False,
                "details": "No speech detected",
            }

        # ── Step 2: Analyze transcript for suspiciousness ──
        analysis = _analyze_transcript(transcript)
        analysis["transcript"] = transcript

        return analysis

    except Exception as e:
        print(f"🗣️ Voice Analyzer: Error: {e}")
        _cleanup(tmp_path)
        return {
            "transcript": "",
            "suspicious": False,
            "other_voices": False,
            "details": f"Analysis error: {str(e)}",
        }


def _transcribe_audio(file_path):
    """Transcribe an audio file using Groq Whisper."""
    try:
        client = _get_client()

        with open(file_path, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                file=("audio.webm", audio_file.read()),
                model="whisper-large-v3-turbo",
                language="en",
                response_format="text",
            )

        # The response is either a string (text format) or has a .text attr
        if isinstance(transcription, str):
            return transcription.strip()
        return transcription.text.strip()

    except Exception as e:
        print(f"🗣️ Voice Analyzer: Whisper transcription error: {e}")
        return ""


def _analyze_transcript(transcript):
    """
    Use Groq LLM to determine if the transcript contains suspicious speech.

    NOT suspicious (normal during a coding test):
      - Reading the problem aloud
      - Thinking aloud ("hmm", "let me think", "okay so...")
      - Brief coughs, sighs

    Suspicious:
      - Asking someone for help
      - Another person dictating answers
      - Phone call with someone reading answers
    """
    try:
        client = _get_client()

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an AI proctoring assistant. Analyze this transcript "
                        "from a coding assessment candidate's microphone.\n\n"
                        "Determine if the speech is suspicious. Respond ONLY with valid JSON:\n"
                        '{\n'
                        '  "suspicious": true or false,\n'
                        '  "other_voices": true or false,\n'
                        '  "details": "brief explanation"\n'
                        '}\n\n'
                        "Suspicious indicators:\n"
                        "- Asking someone else for help or answers\n"
                        "- Another person dictating answers or giving hints\n"
                        "- Reading answers from a phone call\n"
                        "- Discussion about assessment questions with someone else\n\n"
                        "NOT suspicious (normal):\n"
                        "- Reading the problem aloud to themselves\n"
                        "- Thinking aloud / talking through logic\n"
                        '- Brief utterances like "hmm", "okay", "let me think"\n'
                        "- Coughs, sighs, or ambient noise\n\n"
                        "Be lenient — only flag CLEARLY suspicious speech.\n"
                        "Respond ONLY with the JSON object."
                    ),
                },
                {
                    "role": "user",
                    "content": f'Transcript: "{transcript}"',
                },
            ],
            temperature=0.1,
            max_tokens=200,
        )

        raw = response.choices[0].message.content

        # Parse JSON
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", raw, re.DOTALL)
            if match:
                return json.loads(match.group())
            return {
                "suspicious": False,
                "other_voices": False,
                "details": "Could not parse LLM response",
            }

    except Exception as e:
        print(f"🗣️ Voice Analyzer: Transcript analysis error: {e}")
        return {
            "suspicious": False,
            "other_voices": False,
            "details": f"Error: {str(e)}",
        }


def _cleanup(file_path):
    """Safely remove a temp file."""
    if file_path:
        try:
            os.unlink(file_path)
        except OSError:
            pass
