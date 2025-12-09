import fitz
import json
import requests
from datetime import datetime
from src.LLM.Groq import GroqLLM
from src.Prompts.PromptBuilder import PromptBuilder
from src.Utils.Database import db
from src.Model.Candidate import create_candidate
from src.Model.DriveCandidate import create_drive_candidate

groq = GroqLLM()

class ResumeIntakeAgent:
    def __init__(self):
        self.prompt_builder = PromptBuilder()
        self.llm = groq.get_model()

    def download_pdf(self, url):
    # Ensure PDF is served correctly as raw file
        if "/image/upload/" in url:
            url = url.replace("/image/upload/", "/raw/upload/")

        response = requests.get(url, stream=True)

        if response.status_code == 200:
            return response.content
        
        raise Exception(f"Failed to download PDF: {url}")

    def extract_text(self, pdf_bytes):
        """Extract readable text from PDF bytes"""
        text = ""
        with fitz.open(stream=pdf_bytes, filetype="pdf") as pdf:
            for page in pdf:
                text += page.get_text()
        return text.strip()


    def safe_json_parse(self, response_text):
        """
        Attempt to safely parse JSON from LLM output.
        Strips junk and retries common fixes.
        """
        try:
            return json.loads(response_text.strip())
        except json.JSONDecodeError:
            cleaned = response_text.strip()

            # Remove markdown fences if present
            if cleaned.startswith("```"):
                cleaned = cleaned.strip("`")

            # Try to isolate JSON object
            start = cleaned.find("{")
            end = cleaned.rfind("}")
            if start != -1 and end != -1:
                cleaned = cleaned[start:end+1]

            try:
                return json.loads(cleaned)
            except json.JSONDecodeError:
                return None



    def process_resumes(self, resume_urls, drive_id):
        candidates = []

        system_prompt = """
            You are a Resume Information Extraction Agent.
            Your task is to carefully extract structured candidate details
            from raw resume text.

            Extraction Rules:
            - Extract the full candidate name exactly as written in the resume header or first lines.
            - Extract the primary email address in valid format (local@domain).
            * Ignore prefixes/symbols around emails (like 'R username@gmail.com' -> 'username@gmail.com').
            * If multiple emails, choose the personal Gmail/Outlook one.
            - Keep the full resume content as a plain text string with the following processing:
            * Remove any special or non-printable characters such as unusual symbols (for example: '↕', 'ï').
            * Keep standard punctuation, letters, numbers, and common formatting like newlines.
            * Escape double quotes inside the text.
            * Ensure the text is clean and free from characters that can break JSON parsing.

            Output format:
            - Return ONLY valid JSON.
            - Use exactly this schema:
            {
                "name": "string",
                "email": "string",
                "resume_content": "string"
            }
            - Do not add or remove keys.
            - Do not include markdown, comments, or explanations.
            - If the output is not valid JSON, regenerate until it is valid JSON.
        """

        for resume_url in resume_urls:
            print(f"Processing resume from Cloudinary URL: {resume_url}")

            pdf_bytes = self.download_pdf(resume_url)
            raw_text = self.extract_text(pdf_bytes)

            human_prompt = f"Extract candidate information:\n\n{raw_text}"
            messages = self.prompt_builder.build(system_prompt, human_prompt)
            response = self.llm.invoke(messages)
            print("LLM Response :", response.content)

            # Try parsing JSON safely
            llm_output = self.safe_json_parse(response.content)

            # If parsing fails, retry once with a repair prompt
            if not llm_output:
                print(f"❌ Invalid JSON returned for: {resume_url}. Retrying with repair prompt...")
                repair_prompt = f"""
                The following text is invalid JSON. Fix it so it becomes valid JSON only:

                {response.content}
                """
                repair_messages = self.prompt_builder.build(system_prompt, repair_prompt)
                repair_response = self.llm.invoke(repair_messages)
                llm_output = self.safe_json_parse(repair_response.content)

            if not llm_output:
                print(f"❌ Could not parse JSON even after repair for: {resume_url}")
                continue

            # Build candidate data
            candidate_data = create_candidate(
                name=llm_output["name"],
                email=llm_output["email"],
                resume_content=llm_output["resume_content"],
                resume_url=resume_url  # ✅ Store Cloudinary PDF link
            )

            # Preserve created_at if candidate already exists
            existing = db.candidates.find_one({"email": candidate_data["email"]})
            if existing:
                candidate_data["created_at"] = existing["created_at"]
            else:
                candidate_data["created_at"] = datetime.utcnow()

            # Save candidate
            db.candidates.update_one(
                {"email": candidate_data["email"]},
                {"$set": candidate_data},
                upsert=True
            )

            # Fetch stored candidate ID
            stored = db.candidates.find_one({"email": candidate_data["email"]})
            candidate_data["candidate_id"] = str(stored["_id"])

            # Create drive-candidate entry
            drive_entry = create_drive_candidate(candidate_id=candidate_data["candidate_id"], drive_id=drive_id)
            db.drive_candidates.update_one(
                {"candidate_id": candidate_data["candidate_id"], "drive_id": drive_id},
                {"$set": drive_entry},
                upsert=True
            )

            candidates.append(candidate_data)

        return candidates

