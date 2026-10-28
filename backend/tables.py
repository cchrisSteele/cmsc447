from database import execute_query 
from dataclasses import dataclass



ADMIN_SCHEMA = f"""
CREATE TABLE IF NOT EXISTS admins (
    admin_id TEXT PRIMARY KEY NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);
"""

LOCATIONS_SCHEMA = f"""
CREATE TABLE IF NOT EXISTS locations (
    location_id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    location_type TEXT NOT NULL,
    admin_id TEXT NOT NULL,
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id)
);
"""

@dataclass
class Admin:
    admin_id: str
    username: str
    email: str
    password_hash: str


@dataclass
class Location:
    location_id: str
    name: str
    description: str
    latitude: float
    longitude: float
    location_type: str
    admin_id: str



def create_tables():
    """Create the necessary tables in the database."""
    execute_query(ADMIN_SCHEMA)
    execute_query(LOCATIONS_SCHEMA)

if __name__ == "__main__":
    create_tables()