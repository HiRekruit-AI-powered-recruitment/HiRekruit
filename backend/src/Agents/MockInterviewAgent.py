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
            You are an expert HR evaluator with 10+ years of experience in technical hiring. 
            Your job is to evaluate the candidate's interview performance based on their conversation with the interviewer.

            ⚠️ EVALUATION CRITERIA:

            **PRIMARY FOCUS - INTERVIEW PERFORMANCE (80% weight):**
            1. **Communication Skills** (25%)
            - Clarity and articulation of responses
            - Ability to explain technical concepts simply
            - Active listening and responding appropriately to questions
            - Professional demeanor and confidence

            2. **Technical Knowledge & Problem-Solving** (25%)
            - Depth of understanding in mentioned technologies
            - Logical approach to problem-solving questions
            - Ability to discuss projects and challenges coherently
            - Quality of technical explanations and examples

            3. **Behavioral & Soft Skills** (20%)
            - Teamwork and collaboration examples
            - Handling of challenging situations
            - Learning mindset and adaptability
            - Leadership potential and initiative

            4. **Interview Engagement** (10%)
            - Enthusiasm and interest in the role
            - Quality of questions asked to interviewer
            - Overall engagement throughout conversation
            - Cultural fit indicators

            **SECONDARY REFERENCE - RESUME ALIGNMENT (20% weight):**
            - Use resume only to verify if candidate can substantiate their claims
            - Check consistency between written experience and verbal explanations
            - Assess if they can elaborate on projects/skills listed

            ⚠️ DECISION GUIDELINES:
            - **SELECT**: Candidate demonstrates strong interview performance with good communication, technical depth, and professional behavior
            - **REJECT**: Poor communication, inability to explain experience, unprofessional behavior, or major red flags

            ⚠️ IMPORTANT FORMATTING:
            - Always return ONLY valid JSON
            - No explanations outside JSON structure
            - Use exactly this format:
            {
            "decision": "SELECT" or "REJECT",
            
            }
            """

        human_message = f"""
            **CANDIDATE RESUME (For Reference Only):**
            {resume_text}

            **INTERVIEW CONVERSATION (Primary Evaluation Source):**
            {transcript}

            **EVALUATION TASK:**
            Evaluate this candidate's interview performance based primarily on their conversation with the interviewer. Focus on:

            1. How well did they communicate and explain their thoughts?
            2. Did they demonstrate technical knowledge when discussing their experience?
            3. How did they handle behavioral and situational questions?
            4. Were they engaged and professional throughout?
            5. Can they substantiate the experience mentioned in their resume through their responses?

            Provide specific examples from the conversation to support your evaluation.
            """

        # Build prompt with system + human message
        prompt = PromptBuilder.build(system_message, human_message)
        response = llm.invoke(prompt)

        # Safe JSON parsing
        try:
            result = json.loads(response.content.strip())
            print("Evaluation Result:", result)
        except Exception:
            result = {
                "decision": "REJECT",
                "feedback": "Could not parse structured output."
            }

        return result
    
# # "feedback": "Detailed constructive feedback focusing on interview performance, specific examples from conversation, strengths, areas for improvement, and actionable recommendations"
