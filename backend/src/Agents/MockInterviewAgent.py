from src.LLM.Groq import GroqLLM
from src.Prompts.PromptBuilder import PromptBuilder
from src.Utils.Database import db
import json

from src.Prompts.SystemPrompts import HR_EVALUATION_PROMPT

groq = GroqLLM()
llm = groq.get_model()


class MockInterviewAgent:

    def safe_json_parse(self, response_text):
        """
        Safely parse JSON from LLM output.
        Removes junk, markdown fences, and extracts clean JSON.
        """
        try:
            return json.loads(response_text.strip())
        except json.JSONDecodeError:
            cleaned = response_text.strip()

            # Remove markdown fences like ```json ... ```
            if cleaned.startswith("```"):
                cleaned = cleaned.strip("`")

            # Extract JSON object by first { ... last }
            start = cleaned.find("{")
            end = cleaned.rfind("}")
            if start != -1 and end != -1:
                cleaned = cleaned[start:end+1]

            try:
                return json.loads(cleaned)
            except json.JSONDecodeError:
                return None


    def evaluate_interview(self, resume_text, transcript, interviewType):
        print("Evaluating interview MockInterview agent ...")

        system_message = ""
        if interviewType == "hr":
            system_message = HR_EVALUATION_PROMPT

        human_message = f"""
        CANDIDATE RESUME (Reference Only):
        {resume_text}

        INTERVIEW TRANSCRIPT (Primary Evaluation Source):
        {transcript}

        Evaluate ONLY based on the transcript and return STRICT JSON.
        """

        prompt = PromptBuilder.build(system_message, human_message)
        response = llm.invoke(prompt)

        # print("Evaluation Raw Output:", response.content)

        # 1️⃣ First attempt to parse JSON
        result = self.safe_json_parse(response.content)

        # 2️⃣ If invalid, retry with JSON-fix prompt
        if not result:
            print("❌ Invalid JSON in response. Retrying with repair prompt...")

            repair_prompt = f"""
            The following output is NOT valid JSON. Fix it and return ONLY valid JSON:

            {response.content}
            """

            repair_messages = PromptBuilder.build(system_message, repair_prompt)
            repair_response = llm.invoke(repair_messages)

            print("Repair Output:", repair_response.content)
            result = self.safe_json_parse(repair_response.content)

        # 3️⃣ If still invalid → return fallback JSON
        if not result:
            print("❌ JSON parsing failed even after repair. Using fallback.")

            result = {
                "communication_score": 0,
                "technical_score": 0,
                "behavioral_score": 0,
                "engagement_score": 0,
                "resume_alignment_score": 0,
                "final_round_score": 0,
                "decision": "FAIL",
                "feedback": "Could not parse model output. The AI did not return valid JSON."
            }

        return result