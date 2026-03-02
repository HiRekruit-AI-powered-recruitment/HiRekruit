from src.Agents.ChatBotAgnet import ChatBotAgent

# Create a single instance of ChatBotAgent

# for implemeting rag 
# chatbot_agent = ChatBotAgent()

# for implemeting without rag 
chatbot_agent = ChatBotAgent(fallback=True)

def handle_chatbot_query(user_message: str) -> str:
    """
    Controller function that delegates user query to ChatBotAgent.
    """
    print("chatbot controller called.")
    try:
        reply = chatbot_agent.get_reply(user_message)
        return reply
    except Exception as e:
        raise Exception(f"Groq API error: {str(e)}")
