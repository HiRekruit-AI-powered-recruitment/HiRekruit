---
description: Interview state & reload recovery
---

This workflow documents how interview state is managed during an active interview and how the app resumes after a page reload/network interruption.

# Goals

- Prevent the AI interview (VAPI) from restarting from the beginning after reload.
- Restore the UI (conversation/transcript/question) immediately on reload.
- Restart VAPI with prior conversation context.
- Perform a resume handshake ("Are you audible?") before continuing.
- Persist final transcript in the database when evaluation occurs.

# Source of truth

- **During the interview (in-progress):** `localStorage` is the source of truth for resume state.
- **After the interview (final):** MongoDB stores the transcript in `drive_candidates.rounds_status[].conversation`.

# Data we persist in localStorage (candidate only)

- `conversation` (VAPI messages, normalized)
- `fullTranscript` (final transcript entries)
- `currentQuestion`
- `interviewStarted`
- `savedAt` timestamp

**Key format**

- `interview_state:<driveCandidateId>:<interviewType>`

# Reload resume flow (candidate)

1. **On InterviewPage mount**
   - Compute `interviewStorageKey`.
   - Read `localStorage.getItem(interviewStorageKey)`.
   - If present and fresh (<= 6 hours), restore:
     - `initialConversation`
     - `conversation`
     - `fullTranscript`
     - `currentQuestion`
   - Set `resumePending=true`.

2. **Important rule: do NOT set started flags from storage**
   - Do **not** set `interviewStarted=true` or `isRecording=true` during restore.
   - Those must only be set by the VAPI lifecycle events (`call-start`).

3. **Auto-start VAPI once dependencies are ready**
   - When these are true:
     - `dependencyStates.completionCheck`
     - `dependencyStates.permissions`
     - `dependencyStates.livekit`
     - `isVapiReady`
     - `resumePending=true`
     - `!interviewStarted`
     - `!isConnecting`
   - Call `handleStartInterview()` exactly once via a ref guard.

4. **VAPI resume handshake (audible confirmation)**
   - In `useVapi.handleStartInterview()`:
     - If `initialConversation` exists, build a resume system prompt that enforces:
       1. Ask: "I can reconnect now. Are you audible? Reply only YES/NO."
       2. If NO: give 1-2 troubleshooting steps and wait.
       3. If YES: continue from context; do not restart.
     - Provide the last ~12 user/assistant turns in the prompt as conversation context.

# Ongoing persistence (candidate)

- On every meaningful state update (interview started OR conversation length > 0), persist to localStorage:
  - `conversation`, `fullTranscript`, `currentQuestion`, `interviewStarted`, `savedAt`

# Clearing saved state

- When the interview ends in InterviewPage (`handleEndInterview`):
  - `localStorage.removeItem(interviewStorageKey)`

# Backend transcript persistence (final)

- Final evaluation is triggered via `POST /api/interview/evaluate`.
- In `evaluate_interview_controller(...)` we:
  - Normalize transcript into `conversation_only`.
  - Update the matching round in `drive_candidates.rounds_status`:
    - `completed`, `completed_date`, `result`, `feedback`, `score`
    - `conversation = conversation_only`

# Notes / Troubleshooting

- If resume loads UI but AI doesn’t speak:
  - Ensure `resumePending` is set.
  - Ensure we did not set `interviewStarted` from localStorage.
  - Ensure `isVapiReady` becomes true and the auto-start effect triggers.
- Keep the stored payload small (only last N turns if needed) if localStorage size becomes an issue.
