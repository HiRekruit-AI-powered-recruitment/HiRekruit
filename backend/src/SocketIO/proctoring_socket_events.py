"""
proctoring_socket_events.py — Socket.IO events for Guard 2 proctoring.

Handles real-time communication between the frontend and the
proctoring analysis pipeline (Groq Vision + Whisper).

Events:
  proctor_snapshot  — Candidate sends image + audio for analysis
  proctor_start     — Candidate started assessment (session log)
  proctor_end       — Candidate ended assessment (session log)
"""

from datetime import datetime
from flask_socketio import emit
from src.SocketIO.SocketIO_Instance import socketio
from src.Controllers.proctoring_controller import analyze_snapshot, log_proctoring_result
from src.Controllers.voice_analyzer import analyze_voice


@socketio.on("proctor_snapshot")
def on_proctor_snapshot(data):
    """
    Analyze a proctoring snapshot (image + optional audio).

    Expected data:
    {
        "image": "base64 encoded JPEG",
        "audio": "base64 encoded WebM" or null,
        "candidateId": "string",
        "driveId": "string"
    }
    """
    try:
        image_b64 = data.get("image")
        audio_b64 = data.get("audio")
        candidate_id = data.get("candidateId", "unknown")
        drive_id = data.get("driveId", "unknown")

        if not image_b64:
            emit("proctor_result", {"error": "No image provided", "success": False})
            return

        print(f"[Guard 2] Analyzing snapshot for candidate {candidate_id}...")

        # 1. Analyze image with Groq Vision
        analysis, raw_response = analyze_snapshot(image_b64)

        # 2. Analyze audio if provided
        voice_result = None
        if audio_b64:
            print(f"[Guard 2] Analyzing voice for candidate {candidate_id}...")
            voice_result = analyze_voice(audio_b64)

        # 3. Collect all violations
        violations = []
        if analysis and isinstance(analysis.get("violations"), list):
            violations.extend(analysis.get("violations", []))
        if voice_result and voice_result.get("suspicious"):
            violations.append("suspicious_speech")
        if voice_result and voice_result.get("other_voices"):
            violations.append("other_voice_detected")

        # Deduplicate violations while preserving order
        violations = list(dict.fromkeys(violations))
        is_violation = len(violations) > 0

        # 4. Log to MongoDB
        log_proctoring_result(
            candidate_id=candidate_id,
            drive_id=drive_id,
            analysis_type="snapshot_analysis",
            analysis=analysis,
            voice_result=voice_result,
            raw_response=raw_response or "",
        )

        # 5. Send result back to frontend
        result = {
            "success": True,
            "is_violation": is_violation,
            "violations": violations,
            "analysis": analysis or {},
            "voice_analysis": voice_result or {},
            "timestamp": datetime.utcnow().isoformat(),
        }

        if is_violation:
            print(f"[Guard 2] VIOLATION detected for {candidate_id}: {violations}")
        else:
            print(f"[Guard 2] All clear for {candidate_id}")

        emit("proctor_result", result)

    except Exception as e:
        print(f"[Guard 2] Error processing snapshot: {e}")
        emit("proctor_result", {"error": str(e), "success": False})


@socketio.on("proctor_start")
def on_proctor_start(data):
    """Log proctoring session start."""
    candidate_id = data.get("candidateId", "unknown")
    drive_id = data.get("driveId", "unknown")
    print(f"🧠 Guard 2: Proctoring started — candidate={candidate_id}, drive={drive_id}")
    log_proctoring_result(candidate_id, drive_id, "session_start", {"status": "started"})


@socketio.on("proctor_end")
def on_proctor_end(data):
    """Log proctoring session end."""
    candidate_id = data.get("candidateId", "unknown")
    drive_id = data.get("driveId", "unknown")
    print(f"🧠 Guard 2: Proctoring ended — candidate={candidate_id}, drive={drive_id}")
    log_proctoring_result(candidate_id, drive_id, "session_end", {"status": "ended"})
