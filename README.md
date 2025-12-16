# README.md file is not updated completely


# 📄 Resume Intake Agent

The **Resume Intake Agent** is responsible for extracting structured information from candidate resumes.  
It focuses on **resume parsing**, ensuring that **name, email, and raw content** are captured for downstream processing.  

---

## 🚀 Features
- **PDF Parsing** – Reads resumes directly from uploaded PDF files.  
- **Candidate Name Extraction** – Heuristically identifies the candidate's name.  
- **Email Extraction** – Uses regex-based pattern matching to find valid emails.  
- **Resume Content Extraction** – Retrieves complete resume text for AI evaluation.  
- **LLM Integration (Optional)** – If details are written in different formats, an LLM can infer and normalize candidate details.  

---

## 🔍 How It Works

### 1️⃣ Input
- Candidate resumes in **PDF format**.  

### 2️⃣ Processing Steps
- Extract raw text from the PDF.  
- Identify candidate name (heuristics / LLM-based parsing).  
- Extract first valid email.  
- Return all details in structured form.  

### 3️⃣ Output Format
```json
{
  "resume": "path/to/resume.pdf",
  "name": "Candidate Name",
  "email": "candidate@email.com",
  "resume_content": "Full extracted text..."
}
```



# ✅ Resume Shortlisting Agent

The **Resume Shortlisting Agent** evaluates parsed resumes (from the Intake Agent) against job role requirements.  
It applies **semantic skill matching**, **experience checks**, and **project validation** to decide shortlisting.  


## 🚀 Features
- **Semantic Skill Matching** – Detects synonyms, abbreviations, and related tools.  
- **Weighted Scoring** – Prioritizes **core skills** and **practical experience**.  
- **Project Validation** – Confirms that resumes include at least **2 distinct projects**.  
- **Role-Specific Matching** – Evaluates candidates for the provided job role.  
- **Structured JSON Output** – Standardized results for integration with other agents.  


## 🔍 How It Works

### 1️⃣ Input
- **Job Role & Required Skills** (keywords).  
- **Candidate Resume Text** (from Resume Intake Agent).  

### 2️⃣ Evaluation Process
- Match skills and relevant experiences.  
- Check for synonyms and transferable skills.  
- Assign weighted scores (`0–100`).  
- Validate **minimum 2 projects** in the resume.  

### 3️⃣ Decision Criteria
- **Shortlist if:**  
  - Score ≥ **75**  
  - At least **2 projects** listed.  
- Otherwise → Not Shortlisted.  

### 4️⃣ Output Format
```json
{
  "shortlisted": "yes/no",
  "name": "<Candidate Name>",
  "email": "<Candidate Email>"
}
```

# 📧 Emailing Agent

The **Emailing Agent** is an automated email notification system that sends personalized updates to candidates based on their shortlisting status.  
It integrates seamlessly with the **Resume Intake Agent** to inform applicants whether they have been shortlisted for the next stage.

---

## 🚀 Features
- **Automated Email Sending** – Sends notifications without manual intervention.
- **Dynamic Personalization** – Inserts candidate names and company details into email templates.
- **Separate Templates** – Maintains distinct professional messages for shortlisted and not shortlisted candidates.
- **Secure Credentials** – Uses environment variables to store SMTP server details and passwords.
- **Integration Ready** – Works directly with Resume Intake Agent’s JSON output.

---

## 🔍 How It Works

### 1️⃣ Input
- **Shortlisted List** – Array of candidate objects with `name` and `email`.
- **Not Shortlisted List** – Array of candidate objects with `name` and `email`.
- **Email Templates** – Predefined messages with placeholders for personalization.

### 2️⃣ Email Sending Process
- Reads SMTP configuration from environment variables (`SMTP_SERVER`, `SMTP_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`).
- Selects the appropriate template (`shortlisted` or `not_shortlisted`).
- Replaces placeholders like `{name}` and `{company_name}` with real data.
- Sends the email using **TLS-secured SMTP connection**.

### 3️⃣ Example Flow
1. **Resume Intake Agent** produces two lists: `shortlisted` and `not_shortlisted`.
2. **Emailing Agent** loops through each list:
   - Sends a **congratulatory email** to shortlisted candidates.
   - Sends a **polite rejection email** to not shortlisted candidates.

---

## 🛠 Environment Variables

```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_generated_app_password
```

# 📅 Interview Scheduling Agent  

The **Interview Scheduling Agent** is an automated system that schedules interviews for shortlisted candidates and sends them professional, personalized interview invitations via email.  
It integrates seamlessly with the **Emailing Agent** to deliver the interview details (date, time, and meeting link) to candidates.  

---

## 🚀 Features  
- **Automated Interview Scheduling** – No manual coordination required.  
- **Default Scheduling** – If no time is specified, it auto-schedules interviews for **tomorrow at 10 AM**.  
- **Dynamic Personalization** – Inserts candidate names, dates, and meeting links into email templates.  
- **Configurable Links** – Supports Google Meet, Zoom, or any custom meeting platform.  
- **Seamless Integration** – Works directly with candidate lists provided by the Resume Intake Agent.  

---

## 🔍 How It Works  

### 1️⃣ Input  
- **Shortlisted Candidates** – Array of candidate objects with `name` and `email`.  
- **Interview Date & Time** – (Optional) A `datetime` object for scheduling interviews.  
- **Meeting Link** – (Optional) A link to the online interview platform.  

### 2️⃣ Scheduling Process  
- If no date/time is provided → Defaults to **tomorrow at 10:00 AM**.  
- If no meeting link is provided → Uses a **default Google Meet link**.  
- Loops through shortlisted candidates and prepares a personalized email.  
- Sends interview invitations via the integrated **Emailing Agent**.  

### 3️⃣ Example Flow  
1. **Shortlisted candidate list** is passed to the Interview Scheduling Agent.  
2. For each candidate:  
   - A **personalized email** is generated with date, time, and meeting link.  
   - The **Emailing Agent** sends the invitation.  
3. ✅ Candidates receive interview invitations in their inbox.  

---

## 📧 Email Template  

Dear {name},

Congratulations! You have been shortlisted for the next stage of our recruitment process.

We would like to invite you to an interview scheduled as follows:

📅 Date: {date}
⏰ Time: {time}
🔗 Interview Link: {meeting_link}

Please be available at the scheduled time.
Wishing you the best of luck!

Best regards,
HR Team


# 🎤 Mock Interview Agent  

The **Mock Interview Agent** is an AI-powered evaluator that simulates HR-style mock interviews and provides structured feedback on candidate performance.  
It analyzes the candidate’s **resume** along with the **interview transcript** and generates an **evaluation report** in JSON format.  

---

## 🚀 Features  
- **Resume + Transcript Analysis** – Considers both the candidate’s resume and their spoken answers.  
- **Automated Evaluation** – Produces a decision (**SELECT / REJECT**) based on performance.  
- **Strengths & Weaknesses Detection** – Highlights key positive and negative points.  
- **Constructive Feedback** – Provides detailed, professional feedback to help candidates improve.  
- **Structured Output** – Always returns valid JSON for easy integration with other agents or dashboards.  

---

## 🔍 How It Works  

### 1️⃣ Input  
- **Resume Text** – Extracted plain text from the candidate’s resume.  
- **Interview Transcript** – Array of messages containing the conversation between the candidate and the interviewer.  

### 2️⃣ Evaluation Process  
1. Combines the **resume** and **transcript** into a structured evaluation prompt.  
2. Sends it to the underlying **LLM (Groq / OpenAI)** for analysis.  
3. Parses the LLM response to ensure **valid JSON output**.  
4. Returns the evaluation object with decision, strengths, weaknesses, and feedback.  

### 3️⃣ Example Flow  
1. Candidate finishes a mock interview.  
2. Transcript and resume are sent to the **Mock Interview Agent**.  
3. The agent evaluates and produces JSON:  

```json
{
  "decision": "SELECT",
  "strengths": ["Good communication", "Strong technical background", "Confident problem-solving"],
  "weaknesses": ["Needs improvement in behavioral responses"],
  "feedback": "The candidate demonstrates strong technical knowledge and clear communication but should work on providing more structured answers to behavioral questions."
}
```

# 💬 Chatbot Agent [Saarthi]

The **Chatbot Agent** is an AI-powered assistant integrated into the **HireKruit** platform.  
It provides concise, professional responses to candidate and recruiter queries about the platform’s features, hiring drives, and workflows.  
It is designed to always stay on-brand, keep replies short, and focus only on HireKruit-related topics.  

---

## 🚀 Features  
- **Platform Awareness** – Explains HireKruit’s purpose and features in simple, clear sentences.  
- **Concise Responses** – Keeps answers short, professional, and to the point (max 2–3 sentences).  
- **Brand Consistency** – Ensures every response aligns with HireKruit’s role as an AI-powered hiring automation platform.  
- **Context Handling** – Answers only questions relevant to the platform; politely declines unrelated queries.  
- **Customizable System Prompt** – Uses a predefined prompt to maintain consistency in tone and scope.  

---

## 🔍 How It Works  

### 1️⃣ Input  
- **User Queries** – Any question from recruiters or candidates (e.g., "What is HireKruit?", "How do drives work?").  

### 2️⃣ Response Process  
1. Uses the **system prompt** to stay aligned with HireKruit’s scope.  
2. Generates **short, professional replies** about hiring automation, drives, candidate management, or related features.  
3. If a question is irrelevant, politely declines with a brief note.  

### 3️⃣ Example Flow  

**User:** *"What is HireKruit?"*  
**Chatbot Agent:** *"HireKruit is an AI-powered hiring automation platform that manages everything from resume collection to interview scheduling and candidate selection."*  

**User:** *"Tell me all the details about AI in hiring."*  
**Chatbot Agent:** *"HireKruit uses AI to automate resume screening, candidate evaluation, and interview coordination, saving recruiters time and effort."*  

**User:** *"What’s the weather today?"*  
**Chatbot Agent:** *"That’s outside my scope. I can only help with HireKruit-related questions."*  

---

## ⚙️ System Prompt  

```text
You are the **Chatbot Agent** for HireKruit.  
Your role is to answer questions about the platform in a **short, professional, and helpful** way (max 2–3 sentences).  
Always stay on-topic about HireKruit’s features such as hiring automation, resume screening, interview scheduling, candidate evaluation, and drives.  
If asked something irrelevant (like weather, movies, or unrelated topics), politely respond that you can only answer HireKruit-related questions.  
Do not generate long responses. Keep answers concise and clear.  



