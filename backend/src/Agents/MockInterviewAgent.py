from src.LLM.Groq import GroqLLM
from src.Prompts.PromptBuilder import PromptBuilder
from src.Utils.Database import db
import json

groq = GroqLLM()
llm = groq.get_model()


class MockInterviewAgent:

    def evaluate_interview(self, resume_text, transcript):
        print("Evaluating interview MockInterview agent ...")
        
        system_message = """
        You are an expert HR + Technical interviewer evaluator with 10+ years of experience.
        Your job is to evaluate the candidate's interview performance and assign a numerical score
        for this interview round.

        ⚠️ SCORING RULES (Return all values between 0-100):

        1. Communication Skills (25%)
           - clarity, explanation ability, confidence

        2. Technical Knowledge & Problem-Solving (25%)
           - technical depth, logical thinking, project understanding

        3. Behavioral & Soft Skills (20%)
           - teamwork, leadership, adaptability, attitude

        4. Interview Engagement (10%)
           - interest, enthusiasm, participation

        5. Resume Alignment (20%)
           - validation of resume claims based on their spoken answers

        ⚠️ FINAL ROUND SCORE:
        final_round_score = 
            (communication_score * 0.25) +
            (technical_score * 0.25) +
            (behavioral_score * 0.20) +
            (engagement_score * 0.10) +
            (resume_alignment_score * 0.20)

        DECISION RULE:
        - PASS if final_round_score >= 60
        - FAIL if final_round_score < 60

        ⚠️ OUTPUT FORMAT — VERY IMPORTANT:
        Return ONLY valid JSON with this exact structure:

        {
          "communication_score": number,
          "technical_score": number,
          "behavioral_score": number,
          "engagement_score": number,
          "resume_alignment_score": number,
          "final_round_score": number,
          "decision": "PASS" or "FAIL",
          "feedback": "string feedback with strengths & improvements"
        }
        """

        human_message = f"""
        **CANDIDATE RESUME (Reference Only):**
        {resume_text}

        **INTERVIEW TRANSCRIPT (Primary Evaluation Source):**
        {transcript}

        Evaluate the candidate based ONLY on the transcript. 
        Provide category-wise scores and overall decision.
        """

        prompt = PromptBuilder.build(system_message, human_message)
        response = llm.invoke(prompt)

        # Safe JSON parsing
        try:
            result = json.loads(response.content.strip())
            print("Evaluation Result:", result)
        except Exception:
            result = {
                "communication_score": 0,
                "technical_score": 0,
                "behavioral_score": 0,
                "engagement_score": 0,
                "resume_alignment_score": 0,
                "final_round_score": 0,
                "decision": "FAIL",
                "feedback": "Could not parse structured output."
            }

        return result
