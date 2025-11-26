from src.LLM.Groq import GroqLLM
from src.Prompts.PromptBuilder import PromptBuilder

class ChatBotAgent:
    def __init__(self):
        self.prompt_builder = PromptBuilder()
        self.llm = GroqLLM().get_model()

    def get_reply(self, user_message: str) -> str:
        """
        Send a user query to the LLM and return chatbot's reply.
        """
        system_prompt = """
        You are "Saarthi" the official assistant of HireKruit , an AI-powered hiring automation platform. 
        Always explain what HireKruit does in short, clear sentences without long paragraphs. 
        If someone asks about HireKruit, reply concisely: 
        - HireKruit automates the entire hiring process from resume collection to candidate shortlisting, interview scheduling, and selection. 
        - It integrates company drives, candidate management, and AI-powered assessments. 
        - It saves recruiters time by managing everything in one place. 

        Do not give long or off-topic answers. Keep responses professional, direct, and under 3 sentences. 
        If asked about features, explain briefly and focus on efficiency, automation, and simplicity. 
        If you don't know something outside HireKruit, politely say it's not related to the app. 
        """

        human_prompt = f"User Query: {user_message}"

        # Build structured messages
        messages = self.prompt_builder.build(system_prompt, human_prompt)

        # Call Groq LLM
        response = self.llm.invoke(messages)
        print("chatbot response",response)

        # Extract reply content
        try:
            reply = response.content.strip()
        except AttributeError:
            # In case Groq client returns OpenAI-like structure
            reply = response.choices[0].message.content.strip()

        return reply
