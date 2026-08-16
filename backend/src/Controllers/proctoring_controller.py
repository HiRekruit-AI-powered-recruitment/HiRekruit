"""
proctoring_controller.py — Guard 2: Server-side image analysis using Groq Vision.

Receives base64 JPEG snapshots from the frontend, analyzes them using
Groq's llama-4-scout, qwen/qwen3.6-27b Vision model, and logs results to MongoDB.

Detects: phone in view, notes/books, suspicious environment, other people.
"""

import json
import re
import os
from datetime import datetime
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# ── Groq client (reuse existing API key) ──
_groq_client = None

def get_groq_client():
    """Lazy-init Groq client so it doesn't fail at import time."""
    global _groq_client
    if _groq_client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY not found in environment variables")
        _groq_client = Groq(api_key=api_key)
    return _groq_client


# ── Vision analysis prompt ──
VISION_PROMPT = """You are an AI proctoring system for a coding assessment. Analyze this webcam image of the candidate.

Respond ONLY with a valid raw JSON object (no extra text, no markdown wrappers, no intro text):
{
  "phone_detected": true or false,
  "notes_detected": true or false,
  "suspicious_environment": true or false,
  "other_people_visible": true or false,
  "environment_details": "brief description of what you see",
  "violations": [],
  "confidence": 0.0 to 1.0
}

Violation types to include in the "violations" array (only if detected):
- "phone_in_view" — mobile phone, tablet, or secondary device visible
- "notes_visible" — written notes, books, cheat sheets, or reference material visible
- "suspicious_environment" — multiple monitors, unusual or obscured setup
- "other_person" — another person visible in the frame

Rules:
- Be strict but avoid false positives.
- Only flag CLEAR violations you are confident about.
- Respond ONLY with the JSON object."""


def analyze_snapshot(image_base64):
    """
    Analyze a webcam snapshot using Groq Vision (qwen/qwen3.6-27b).

    Args:
        image_base64: Base64 encoded JPEG image (with or without data URL prefix)

    Returns:
        tuple: (analysis_dict, raw_response_string)
               analysis_dict is None on error
    """
    try:
        client = get_groq_client()

        # Ensure proper data URL format for Groq Vision API
        if not image_base64.startswith("data:"):
            image_base64 = f"data:image/jpeg;base64,{image_base64}"

        response = client.chat.completions.create(
            model="qwen/qwen3.6-27b",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": VISION_PROMPT},
                        {
                            "type": "image_url",
                            "image_url": {"url": image_base64},
                        },
                    ],
                }
            ],
            temperature=0.1,
            max_tokens=1500,
        )

        raw_response = response.choices[0].message.content or ""
        analysis = _parse_json_response(raw_response)
        
        if analysis:
            print(f"[Guard 2 Vision] Details: {analysis.get('environment_details')}")
            print(f"[Guard 2 Vision] Violations: {analysis.get('violations')}")

        return analysis, raw_response

    except Exception as e:
        print(f"[Guard 2 Vision] Error: {e}")
        return None, str(e)


def _get_fallback_analysis(reason="Failed to parse Groq response"):
    return {
        "phone_detected": False,
        "notes_detected": False,
        "suspicious_environment": False,
        "other_people_visible": False,
        "environment_details": reason,
        "violations": [],
        "confidence": 0.0,
    }


def _normalize_analysis(data):
    """Ensure consistent boolean keys and standard violation codes expected by frontend."""
    phone_detected = bool(data.get("phone_detected") or data.get("phone_in_view"))
    notes_detected = bool(data.get("notes_detected") or data.get("notes_visible"))
    suspicious_env = bool(data.get("suspicious_environment") or data.get("suspicious_setup"))
    other_people = bool(data.get("other_people_visible") or data.get("other_person") or data.get("multiple_people"))

    violations = set()
    raw_violations = data.get("violations", [])
    if isinstance(raw_violations, list):
        for v in raw_violations:
            v_str = str(v).lower()
            if "phone" in v_str:
                violations.add("phone_in_view")
                phone_detected = True
            elif "note" in v_str or "book" in v_str or "cheat" in v_str:
                violations.add("notes_visible")
                notes_detected = True
            elif "person" in v_str or "people" in v_str:
                violations.add("other_person")
                other_people = True
            elif "suspicious" in v_str or "env" in v_str:
                violations.add("suspicious_environment")
                suspicious_env = True

    if phone_detected:
        violations.add("phone_in_view")
    if notes_detected:
        violations.add("notes_visible")
    if suspicious_env:
        violations.add("suspicious_environment")
    if other_people:
        violations.add("other_person")

    return {
        "phone_detected": phone_detected,
        "notes_detected": notes_detected,
        "suspicious_environment": suspicious_env,
        "other_people_visible": other_people,
        "environment_details": str(data.get("environment_details", "Analysis completed")),
        "violations": list(violations),
        "confidence": float(data.get("confidence", 0.9 if violations else 1.0)),
    }


def _parse_json_response(raw_text):
    """Extract and parse JSON from Groq's response text, handling thinking tags and markdown."""
    if not raw_text:
        return _get_fallback_analysis("Empty response from model")

    # 1. Strip <think>...</think> reasoning blocks if present (common in Qwen/reasoner models)
    cleaned_text = re.sub(r"<think>.*?</think>", "", raw_text, flags=re.DOTALL).strip()
    
    # 2. If unclosed <think> tag remains (e.g. truncated), try finding JSON starting brace
    if "<think>" in cleaned_text or not cleaned_text:
        start_brace = raw_text.rfind('{')
        if start_brace != -1:
            cleaned_text = raw_text[start_brace:]
        else:
            cleaned_text = re.sub(r"<think>.*$", "", raw_text, flags=re.DOTALL).strip()

    if not cleaned_text:
        print("[Guard 2 Vision Warning] Model response was cut off inside <think> block.")
        return _get_fallback_analysis("Response cut off inside thinking block")

    # 3. Try direct JSON parse
    parsed_data = None
    try:
        parsed_data = json.loads(cleaned_text)
    except json.JSONDecodeError:
        pass

    # 4. Try extracting JSON from markdown code block ```json ... ```
    if not parsed_data:
        codeblock_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", cleaned_text, re.DOTALL)
        if codeblock_match:
            try:
                parsed_data = json.loads(codeblock_match.group(1))
            except json.JSONDecodeError:
                pass

    # 5. Try non-greedy outer braces match
    if not parsed_data:
        start_idx = cleaned_text.find('{')
        end_idx = cleaned_text.rfind('}')
        if start_idx != -1 and end_idx > start_idx:
            possible_json = cleaned_text[start_idx:end_idx + 1]
            try:
                parsed_data = json.loads(possible_json)
            except json.JSONDecodeError:
                pass

    if not parsed_data or not isinstance(parsed_data, dict):
        print(f"[Guard 2 Vision] Could not parse JSON from output: {cleaned_text[:200]}")
        return _get_fallback_analysis("Failed to parse Groq JSON response")

    return _normalize_analysis(parsed_data)


def log_proctoring_result(candidate_id, drive_id, analysis_type, analysis,
                          voice_result=None, raw_response=""):
    """
    Log a proctoring analysis result to MongoDB.

    Uses lazy import of db to avoid circular imports during app startup.
    """
    try:
        from src.Utils.Database import db

        log_entry = {
            "candidate_id": candidate_id,
            "drive_id": drive_id,
            "timestamp": datetime.utcnow(),
            "type": analysis_type,
            "analysis": analysis or {},
            "voice_analysis": voice_result or {},
            "violations": analysis.get("violations", []) if analysis else [],
            "is_violation": bool(analysis and analysis.get("violations")),
            "raw_response": raw_response,
        }

        db.proctoring_logs.insert_one(log_entry)
        return True

    except Exception as e:
        print(f"🧠 Proctoring: MongoDB log error: {e}")
        return False
