from pathlib import Path

from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa


ROOT = Path(__file__).resolve().parents[1]
SECRET_DIR = ROOT / "secrets"

SECRETS = {
    "DB_PASSWORD": "postgres123",
    "MINIO_ACCESS_KEY": "minioadmin",
    "MINIO_SECRET_KEY": "minioadmin123",
}


def main():
    SECRET_DIR.mkdir(exist_ok=True)

    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    public_key = private_key.public_key()
    aes_key = Fernet.generate_key()
    fernet = Fernet(aes_key)

    (SECRET_DIR / "private_key.pem").write_bytes(
        private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption(),
        )
    )
    (SECRET_DIR / "public_key.pem").write_bytes(
        public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        )
    )
    (SECRET_DIR / "encrypted_aes_key.bin").write_bytes(
        public_key.encrypt(
            aes_key,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None,
            ),
        )
    )

    for name, value in SECRETS.items():
        (SECRET_DIR / f"{name}.enc").write_bytes(fernet.encrypt(value.encode("utf-8")))

    print(f"Generated encrypted demo secrets in {SECRET_DIR}")


if __name__ == "__main__":
    main()
