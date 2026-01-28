import os
import requests
import json

JUDGE0_URL = os.environ.get("0_URL", "https://0-ce.p.rapidapi.com")
JUDGE0_API_KEY = os.environ.get("0_API_KEY")
JUDGE0_HOST = os.environ.get("0_HOST", "0-ce.p.rapidapi.com")
TIMEOUT = int(os.environ.get("0_TIMEOUT_SEC", 30))

def _build_headers():
    headers = {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": JUDGE0_API_KEY,
        "X-RapidAPI-Host": JUDGE0_HOST
    }
    return headers

def submit_and_wait(source_code: str, language_id: int = 71, stdin: str = "") -> dict:
    endpoint = JUDGE0_URL.rstrip("/") + "/submissions/?base64_encoded=false&wait=true"
    payload = {
        "language_id": language_id,
        "source_code": source_code,
        "stdin": stdin
    }

    headers = _build_headers()
    try:
        r = requests.post(endpoint, headers=headers, json=payload, timeout=TIMEOUT)
    except Exception as e:
        return {"error": "Failed to reach 0", "detail": str(e)}

    if r.status_code not in (200, 201):
        return {"error": "0 returned error", "status_code": r.status_code, "body": r.text}

    try:
        resp = r.json()
    except json.JSONDecodeError:
        return {"error": "Invalid JSON from 0", "body": r.text}

    return {
        "stdout": resp.get("stdout"),
        "stderr": resp.get("stderr"),
        "compile_output": resp.get("compile_output"),
        "status": resp.get("status"),
        "time": resp.get("time"),
        "memory": resp.get("memory"),
        "token": resp.get("token"),
        "raw": resp
    }
