import os
from pathlib import Path

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.fernet import Fernet


def _read_file(path):
    return Path(path).read_text(encoding="utf-8").strip()


def _decrypt_hybrid_secret(name):
    secret_dir = Path(os.getenv("SECRET_DIR", "/run/demo-secrets"))
    private_key_path = secret_dir / "private_key.pem"
    encrypted_key_path = secret_dir / "encrypted_aes_key.bin"
    encrypted_value_path = secret_dir / f"{name}.enc"

    private_key = serialization.load_pem_private_key(
        private_key_path.read_bytes(),
        password=None,
    )
    aes_key = private_key.decrypt(
        encrypted_key_path.read_bytes(),
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None,
        ),
    )
    return Fernet(aes_key).decrypt(encrypted_value_path.read_bytes()).decode("utf-8")


def get_secret(name, env_name, default=""):
    if os.getenv("SECRET_MODE") == "encrypted":
        return _decrypt_hybrid_secret(name)
    return os.getenv(env_name, default)


APP_MODE = os.getenv("APP_MODE", "vulnerable")

DB_HOST = os.getenv("DB_HOST", "postgres")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME", "cloud_lab")
DB_USER = os.getenv("DB_USER", "app_user")
DB_PASSWORD = get_secret("DB_PASSWORD", "DB_PASSWORD", "postgres123")

MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "minio:9000")
MINIO_PUBLIC_ENDPOINT = os.getenv("MINIO_PUBLIC_ENDPOINT", "localhost:9000")
MINIO_ACCESS_KEY = get_secret("MINIO_ACCESS_KEY", "MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET_KEY = get_secret("MINIO_SECRET_KEY", "MINIO_SECRET_KEY", "minioadmin123")
MINIO_BUCKET = os.getenv("MINIO_BUCKET", "public-customer-data")
