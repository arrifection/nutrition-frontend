"""Password strength validation for registration and password changes."""
import re

MIN_PASSWORD_LENGTH = 10
MAX_PASSWORD_LENGTH = 128

_PASSWORD_RULES = [
    (r"[a-z]", "one lowercase letter"),
    (r"[A-Z]", "one uppercase letter"),
    (r"\d", "one number"),
    (r"[^\w\s]", "one special character"),
]


def validate_password_strength(password: str) -> None:
    if not password or not isinstance(password, str):
        raise ValueError("Password is required.")

    if len(password) < MIN_PASSWORD_LENGTH:
        raise ValueError(f"Password must be at least {MIN_PASSWORD_LENGTH} characters.")

    if len(password) > MAX_PASSWORD_LENGTH:
        raise ValueError(f"Password must be at most {MAX_PASSWORD_LENGTH} characters.")

    missing = [label for pattern, label in _PASSWORD_RULES if not re.search(pattern, password)]
    if missing:
        raise ValueError(
            "Password must include " + ", ".join(missing) + "."
        )

    if password.strip() != password:
        raise ValueError("Password cannot start or end with spaces.")
