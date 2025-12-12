import json
from datetime import datetime

from bson import ObjectId
from src.LLM.Groq import GroqLLM
from src.Prompts.PromptBuilder import PromptBuilder
from src.Utils.Database import db  # Import the database

groq = GroqLLM()

class ResumeShortlistingAgent:
    def __init__(self):
        self.prompt_builder = PromptBuilder()
        self.llm = groq.get_model()

    def shortlist_candidates(self, candidates, keywords, job_role):
        """
        Takes extracted candidate info, keywords list, and job role.
        Returns shortlisted and not_shortlisted lists.
        Also updates the shortlist status and resume score in the database.
        """
        # print("ShortlistingAgent called with candidates")
        # print("Number of candidates to process:", len(candidates))
        # print("Keywords:", keywords)
        # print("Job Role:", job_role)

        shortlisted = []
        not_shortlisted = []

        system_prompt = f"""
        You are an intelligent Resume Screening Agent.

        Job Role: {job_role}
        Required Skills/Keywords: {keywords}

        You will receive:
        1. The candidate's resume text.

        Your task:
        - Assess how well the candidate fits the {job_role} role, even if skill names or job titles are worded differently.
        - Recognize synonyms, related tools, frameworks, and transferable skills.
        - Give more weight to core role-specific skills and relevant work experience than to exact keyword matches.
        - Account for abbreviations, alternative names, and related technologies.
        - Consider potential to learn quickly if experience is similar but not exact.
        - Check that the resume includes at least 2 projects.

        Scoring:
        1. Assign a match score between 0 and 100 based on overall fit.
        2. Shortlist a candidate only if:
           - The score is 75 or above, AND
           - The resume contains at least 2 distinct projects.
        3. Otherwise, mark them as not shortlisted.

        Output format:
        Do not return any explanations or additional text.
        **Must** return ONLY a valid JSON object:
        {{
            "shortlisted": "yes" or "no",
            "score": <number between 0 and 100>
        }}

        Do NOT wrap the response in code blocks or markdown. Return ONLY the raw JSON object.
        """
        
        # print("here..........")
        for candidate in candidates:

            # here first we need to fetch the resume content from candidate
            # from the drivecandidate first get the candidate id then form candidate fetch the resume content
            candidate_id = candidate.get("candidate_id")
            candidate_data = db.candidates.find_one({"_id": ObjectId(candidate_id)})
            resume_content = candidate_data.get("resume_content", "")

            human_prompt = (
                f"Here is the candidate's resume content:\n{resume_content}\n\n"
                "Based on this resume, determine if the candidate is a suitable match for the job role and required skills. "
                "Provide the match score and shortlist decision."
            )

            messages = self.prompt_builder.build(system_prompt, human_prompt)
            response = self.llm.invoke(messages)

            try:
                llm_output = json.loads(response.content.strip())
                # print("Shortlisting Agent:", llm_output)
            except json.JSONDecodeError:
                print(f"Invalid JSON for {candidate.get('resume', 'unknown')}:\n", response.content)
                continue

            shortlist_status = llm_output.get("shortlisted", "").lower()
            resume_score = llm_output.get("score", 0)  # Extract the score
            
            result = {
                "resume": candidate_data.get("resume_content", ""),
                "name": candidate_data.get("name", ""),
                "email": candidate_data.get("email", ""),
                "score": resume_score
            }

            # Update the shortlist status and resume score in the database
            db.drive_candidates.update_one(
                {"_id": candidate.get("_id")},
                {"$set": {
                    "resume_shortlisted": "yes" if shortlist_status == "yes" else "no",
                    "resume_score": resume_score,  # Store the resume score
                    "updated_at": datetime.utcnow()
                }}
            )

            if shortlist_status == "yes":
                shortlisted.append(result)
            else:
                not_shortlisted.append(result)

        # print("shortlisted", len(shortlisted))
        # print("not_shortlisted", len(not_shortlisted))

        return {
            "shortlisted": shortlisted,
            "not_shortlisted": not_shortlisted
        }