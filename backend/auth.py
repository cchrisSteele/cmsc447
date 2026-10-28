
import uuid
from werkzeug.security import generate_password_hash, check_password_hash

from database import execute_query, get_db_value


def hash_password(password: str) -> str:
    """Hash a plaintext password."""
    return generate_password_hash(password)


def check_password(password: str, password_hash: str) -> bool:
    """Check whether a password matches its hash."""
    return check_password_hash(password_hash, password)


def create_account(username: str, email: str, password: str):
    """Create a new administrator account."""

    username = username.strip()
    email = email.strip().lower()

    if not username or not email or not password:
        return {
            "success": False,
            "message": "All fields are required"
        }

    # Check if username already exists
    existing_username = get_db_value(
        "admins", "admin_id", "username", username
    )

    if existing_username is not None:
        return {
            "success": False,
            "message": "Username already exists"
        }

    # Check if email already exists
    existing_email = get_db_value(
        "admins", "admin_id", "email", email
    )

    if existing_email is not None:
        return {
            "success": False,
            "message": "Email already exists"
        }

    admin_id = str(uuid.uuid4())
    password_hash = hash_password(password)

    query = """
        INSERT INTO admins
        (admin_id, username, email, password_hash)
        VALUES (?, ?, ?, ?)
    """

    try:
        execute_query(
            query,
            (admin_id, username, email, password_hash)
        )

    except RuntimeError as e:
        return {
            "success": False,
            "message": str(e)
        }

    return {
        "success": True,
        "message": "Account created successfully",
        "admin_id": admin_id
    }


def login_account(email: str, password: str):
    """Verify administrator email and password."""

    email = email.strip().lower()

    query = """
        SELECT admin_id, username, email, password_hash
        FROM admins
        WHERE email = ?
        LIMIT 1
    """

    rows = execute_query(query, (email,))

    if not rows:
        return {
            "success": False,
            "message": "Invalid email or password"
        }

    admin = rows[0]

    if not check_password(password, admin["password_hash"]):
        return {
            "success": False,
            "message": "Invalid email or password"
        }

    return {
        "success": True,
        "message": "Login successful",
        "admin_id": admin["admin_id"],
        "username": admin["username"],
        "email": admin["email"]
    }
