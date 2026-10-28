import os
import requests
from dotenv import load_dotenv
from dataclasses import dataclass


load_dotenv()

DATABASE_URL = os.getenv("DB_URL")
AUTH_TOKEN = os.getenv("DB_TOKEN")


def get_database_url():
    if not DATABASE_URL:
        raise ValueError("DB_URL is missing from .env")

    if not AUTH_TOKEN:
        raise ValueError("DB_TOKEN is missing from .env")

    url = DATABASE_URL.replace("libsql://", "https://", 1).rstrip("/")
    return url + "/v2/pipeline"

def execute_query(query: str, values: tuple = ()):
    """Execute a parameterized SQL query using Turso."""

    url = DATABASE_URL.replace("libsql://", "https://").rstrip("/") + "/v2/pipeline"

    args = []
    for value in values:
        if value is None:
            args.append({"type": "null"})
        else:
            args.append({
                "type": "text",
                "value": str(value)
            })

    payload = {
        "requests": [
            {
                "type": "execute",
                "stmt": {
                    "sql": query,
                    "args": args
                }
            },
            {
                "type": "close"
            }
        ]
    }

    response = requests.post(
        url,
        headers={
            "Authorization": f"Bearer {AUTH_TOKEN}",
            "Content-Type": "application/json"
        },
        json=payload,
        timeout=15
    )

    response.raise_for_status()

    result = response.json()["results"][0]

    if result["type"] == "error":
        raise RuntimeError(result["error"]["message"])

    return result["response"]["result"]