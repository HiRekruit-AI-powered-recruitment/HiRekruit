# celery_app.py
import sys
import os
from dotenv import load_dotenv
from celery import Celery

load_dotenv()

CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL")

# Do NOT print here — runs for every worker process
# print("Broker URL :", CELERY_BROKER_URL)

# Add project root to Python path
project_root = os.path.dirname(os.path.abspath(__file__))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

celery = Celery(
    "hiremate",
    broker=CELERY_BROKER_URL,
    backend="rpc://"
)

celery.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,
)

# Import tasks (NO prints here)
try:
    from src.Tasks import tasks
except Exception as e:
    # Only print failures
    print(f"✗ Failed to import tasks: {e}")
    import traceback
    traceback.print_exc()

# Print ONLY when running manually, not in Celery workers
if __name__ == "__main__":
    print("Broker URL :", CELERY_BROKER_URL)
    print("✓ Tasks module imported successfully")
