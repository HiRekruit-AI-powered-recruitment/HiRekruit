from src.LLM.Groq import GroqLLM
from src.Prompts.PromptBuilder import PromptBuilder
from src.Utils.Database import db
import json

from src.Prompts.SystemPrompts import HR_EVALUATION_PROMPT

groq = GroqLLM()
llm = groq.get_model()


class MockInterviewAgent:

    def evaluate_interview(self, resume_text, transcript, interviewType):
        print("Evaluating interview MockInterview agent ...")
        
        system_message = ""

        if interviewType == "hr"  : 
            system_message = HR_EVALUATION_PROMPT

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
