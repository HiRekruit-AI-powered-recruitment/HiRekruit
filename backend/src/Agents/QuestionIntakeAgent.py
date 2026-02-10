import fitz
import json
import requests
from src.LLM.Groq import GroqLLM
from src.Prompts.PromptBuilder import PromptBuilder

groq = GroqLLM()

class QuestionIntakeAgent:
    def __init__(self):
        self.prompt_builder = PromptBuilder()
        self.llm = groq.get_model()

    def download_pdf(self, url):
        # Ensure Cloudinary serves the PDF correctly as a raw file
        if "/image/upload/" in url:
            url = url.replace("/image/upload/", "/raw/upload/")
        response = requests.get(url, stream=True)
        if response.status_code == 200:
            return response.content
        raise Exception(f"Failed to download Question PDF: {url}")

    def extract_text(self, pdf_bytes):
        text = ""
        with fitz.open(stream=pdf_bytes, filetype="pdf") as pdf:
            for page in pdf:
                text += page.get_text()
        return text.strip()

    def safe_json_parse(self, response_text):
        try:
            cleaned = response_text.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.strip("`").replace("json", "", 1)
            
            # Isolate JSON Array
            start = cleaned.find("[")
            end = cleaned.rfind("]")
            if start != -1 and end != -1:
                cleaned = cleaned[start:end+1]
            return json.loads(cleaned)
        except Exception:
            return None

    def process_question_pdf(self, pdf_url):
        print(f"Agent analyzing Question PDF: {pdf_url}")
        
        pdf_bytes = self.download_pdf(pdf_url)
        raw_text = self.extract_text(pdf_bytes)

        system_prompt = """
            You are a Computer Science Professor and Coding Challenge Architect.
            Your task is to extract coding questions from the provided text into a structured JSON format.

            Rules:
            - Identify all distinct coding problems.
            - For each problem, generate a JSON object with:
                1. 'title': Short name.
                2. 'description': Detailed problem statement with examples.
                3. 'constraints': Time/memory limits or input ranges.
                4. 'testCases': An array of objects with 'input', 'output', and 'type' (default to 'public').
            
            Return ONLY a valid JSON array. No markdown. No intro text.
            Schema:
            [
                {
                    "title": "string",
                    "description": "string",
                    "constraints": "string",
                    "testCases": [{"input": "str", "output": "str", "type": "public"}]
                }
            ]
        """

        human_prompt = f"Convert the following document into structured coding questions:\n\n{raw_text}"
        messages = self.prompt_builder.build(system_prompt, human_prompt)
        response = self.llm.invoke(messages)
        
        questions = self.safe_json_parse(response.content)
        return questions if questions else []