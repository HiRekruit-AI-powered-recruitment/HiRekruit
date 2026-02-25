# ---------- Base Image ----------
FROM python:3.12-slim

# ---------- Set environment variables ----------
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

# ---------- Set working directory ----------
WORKDIR /app

# ---------- Install essential system dependencies ----------
# These are needed for common Python packages like cryptography, PyMuPDF, and psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libssl-dev \
    libffi-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# ---------- Copy dependency list ----------
COPY requirements.txt .

# ---------- Install Python dependencies ----------
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ---------- Pre-download SentenceTransformer model ----------
# Bake the all-MiniLM-L6-v2 model (~80MB) into the Docker image
# so it doesn't re-download from HuggingFace on every container start.
# This eliminates the 30-60s delay on first chatbot query.
ENV SENTENCE_TRANSFORMERS_HOME=/app/models
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2', cache_folder='/app/models')"

# ---------- Copy project files ----------
COPY . .

# ---------- Default command: Run Celery Worker ----------
# Points directly to the Celery instance in celery_app.py
CMD ["celery", "-A", "celery_app.celery", "worker", "--loglevel=info"]
