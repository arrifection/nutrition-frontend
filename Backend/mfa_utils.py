"""TOTP secret encryption helpers for MFA."""
import base64
import hashlib

import pyotp
from cryptography.fernet import Fernet, InvalidToken

from auth_utils import SECRET_KEY


def _fernet() -> Fernet:
    key = base64.urlsafe_b64encode(hashlib.sha256(SECRET_KEY.encode("utf-8")).digest())
    return Fernet(key)


def encrypt_mfa_secret(secret: str) -> str:
    return _fernet().encrypt(secret.encode("utf-8")).decode("utf-8")


def decrypt_mfa_secret(encrypted: str) -> str | None:
    if not encrypted:
        return None
    try:
        return _fernet().decrypt(encrypted.encode("utf-8")).decode("utf-8")
    except InvalidToken:
        return None


def generate_totp_secret() -> str:
    return pyotp.random_base32()


def verify_totp(secret: str, code: str) -> bool:
    if not secret or not code:
        return False
    normalized = "".join(ch for ch in str(code).strip() if ch.isdigit())
    if len(normalized) != 6:
        return False
    return pyotp.TOTP(secret).verify(normalized, valid_window=1)


def provisioning_uri(secret: str, email: str, issuer_name: str = "DietDesk") -> str:
    return pyotp.TOTP(secret).provisioning_uri(name=email, issuer_name=issuer_name)
