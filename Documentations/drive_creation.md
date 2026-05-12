# Drive Creation Flow

This document provides a high-level overview of the Drive (Job) Creation feature in the HireMate application, explaining how the frontend and backend collaborate to create a new hiring drive and extract coding questions using AI.

## Job Description Fields

When an HR representative creates a new drive, they fill out a comprehensive form capturing the following details:

*   **Identifiers**: `company_id`, `job_id`
*   **Basic Details**: `role`, `location`, `candidates_to_hire`
*   **Job Category**: `job_type` (e.g., full-time, internship) and `internship_duration` (if applicable)
*   **Experience Requirements**: `experience_type` (fresher or experienced), `experience_min`, `experience_max`
*   **Timeline**: `start_date`, `end_date`, `application_deadline`
*   **Candidate Requirements**: `skills` (required technical or soft skills)
*   **Interview Process**: `rounds` (a list specifying the sequence of interview rounds, such as HR, Technical, Coding, etc., along with optional descriptions)
*   **Assessment Details**: `assessment_duration_hours`, `assessment_duration_minutes`
*   **Coding Questions**: `coding_questions` (a detailed list of programming questions, including titles, descriptions, constraints, and public/hidden test cases)

## Frontend Flow (`JobCreation.jsx`)

The frontend handles data collection, AI extraction triggers, and final submission payload preparation.

1.  **Data Entry**: The HR fills out the various job description fields in a dynamic form.
2.  **Instant AI Extraction**: If a "Coding" round is added, the HR has the option to upload a PDF containing coding questions. The moment the file is selected:
    *   The frontend instantly calls a specific backend endpoint (`/api/drive/extract-questions`) with the PDF file.
    *   Upon receiving the extracted questions from the backend, the frontend automatically populates the manual entry fields with the AI-extracted data.
3.  **Manual Edits**: The HR can review the AI-extracted questions, manually add new ones, or modify test cases directly in the UI.
4.  **Submission**: When the HR clicks "Confirm & Submit":
    *   The frontend strips out any raw file objects (like the PDF) to keep the payload lightweight.
    *   It bundles all the form fields and the final list of `coding_questions` into a clean JSON payload.
    *   It sends this JSON payload to the backend to finalize the drive creation.

## Backend Flow

The backend handles the AI processing and database persistence cleanly across two distinct controllers.

### 1. AI Extraction Phase (`drive_routes.py` -> `extract_questions_controller`)
*   **File Upload**: Receives the PDF from the frontend and uploads it to a cloud storage service (Cloudinary) to get a secure URL.
*   **AI Processing (`QuestionIntakeAgent.py`)**: Passes the secure URL to an AI Agent. The agent reads the PDF and intelligently extracts the coding questions, descriptions, constraints, and test cases.
*   **Response**: The controller returns the structured JSON list of extracted questions back to the frontend without saving anything to the database yet.

### 2. Drive Creation Phase (`drive_routes.py` -> `create_drive_controller`)
*   **Payload Parsing**: Receives the final, clean JSON payload from the frontend containing all job details and the finalized list of coding questions.
*   **Question Storage**: It loops through the `coding_questions` array and inserts each question into the `coding_questions` database collection, generating unique IDs for each.
*   **Drive Storage**: It bundles the generated question IDs with all the job description fields (role, experience, rounds, etc.) and creates a final document in the `drives` database collection.
*   **Result**: The drive is officially created and linked to the respective company and coding questions.
