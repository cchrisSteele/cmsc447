import os
import requests
from dotenv import load_dotenv
from dataclasses import dataclass


load_dotenv()

DATABASE_URL = os.getenv("DB_URL")
AUTH_TOKEN = os.getenv("DB_TOKEN")

# Map each table to its primary key column
TABLE_ID_COLUMNS = {
    "admins": "admin_id",
    "locations": "location_id"
}

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

def get_db_value(table, column, row_id):
    # Get the ID column based on the table
    id_column = TABLE_ID_COLUMNS.get(table)

    if id_column is None:
        raise ValueError(f"Invalid table: {table}")

    # Build query
    query = f"SELECT {column} FROM {table} WHERE {id_column} = ?"

    # Execute query
    result = execute_query(query, (row_id,))

    # Return value or None if not found
    if not result:
        return None

    return result[0][0]