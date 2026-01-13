from src.LLM.Groq import GroqLLM
from src.Prompts.PromptBuilder import PromptBuilder
from src.SarthiRag.rag import SarthiRAG

class ChatBotAgent:
    def __init__(self):
        self.prompt_builder = PromptBuilder()
        self.llm = GroqLLM().get_model()
        self.rag = SarthiRAG()

    def get_reply(self, user_message: str) -> str:
        # Build RAG context
        system_prompt = self.rag.build_context(user_message)

        # Build structured messages
        messages = self.prompt_builder.build(system_prompt, user_message)

        # Call Groq LLM
        response = self.llm.invoke(messages)
        print("chatbot response",response.content)

        # Extract reply content
        try:
            reply = response.content.strip()
        except AttributeError:
            # In case Groq client returns OpenAI-like structure
            reply = response.choices[0].message.content.strip()

        return reply