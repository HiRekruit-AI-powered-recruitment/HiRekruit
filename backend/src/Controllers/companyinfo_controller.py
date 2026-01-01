from src.Agents.CompanyInfoAgent import CompanyInfoAgent

# Create a single instance of CompanyInfoAgent
company_info_agent = CompanyInfoAgent()

def handle_comapnyinfo_query(company_name: str) -> str:
    """
    Controller function that delegates company name to CompanyInfoAgent.
    """
    print("companyinfo controller called.")
    try:
        reply = company_info_agent.get_reply(company_name)
        return reply
    except Exception as e:
        raise Exception(f"Groq API error: {str(e)}")
