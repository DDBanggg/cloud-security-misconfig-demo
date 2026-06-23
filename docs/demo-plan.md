# Ke hoach demo Cloud Security bang Docker

## 1. Muc tieu

Demo xay dung mot moi truong cloud gia lap gom Web App, PostgreSQL va MinIO de minh hoa ba loi bao mat pho bien:

1. Public Storage Bucket
2. IAM Misconfiguration
3. Credential Leakage

Muc tieu khong phai tan cong he thong that, ma la quan sat rui ro trong moi truong co kiem soat va so sanh hieu qua sau khi ap dung bien phap phong ve.

## 2. Kien truc

```text
User
 |
 v
Web App  -----> PostgreSQL
 |
 v
MinIO Object Storage
```

Cac thanh phan chay trong cung Docker Network `cloud-lab`.

## 3. Kich ban 1: Public Storage Bucket

### Trang thai khong an toan

- Bucket `public-customer-data` duoc cau hinh public.
- Cac file mau `customers.csv` va `invoices.txt` co the tai truc tiep qua URL.

### Cach demo

1. Truy cap Web App tai `http://localhost:5000/storage`.
2. Mo link file trong bucket.
3. Quan sat viec tai file khong can dang nhap.

### Rui ro

- Ro ri du lieu khach hang.
- STRIDE: Information Disclosure.

### Fix

- Chuyen bucket ve private:

```bash
docker compose exec minio-init mc anonymous set none local/public-customer-data
```

- Sau do truy cap lai URL public va quan sat ket qua bi tu choi.

## 4. Kich ban 2: IAM Misconfiguration

### Trang thai khong an toan

- Tai khoan `alice/user123` la user thuong nhung bi cap role `admin` khi `APP_MODE=vulnerable`.
- Alice co the truy cap `/admin` va thuc hien thao tac nhay cam.

### Cach demo

1. Dang nhap bang `alice/user123`.
2. Truy cap `http://localhost:5000/admin`.
3. Thuc hien thao tac mau "Xoa ban ghi mau".

### Rui ro

- User thuong co quyen vuot muc can thiet.
- STRIDE: Elevation of Privilege, Tampering, Information Disclosure.

### Fix

- Doi `APP_MODE` trong `docker-compose.yml` tu `vulnerable` sang `secure`.
- Chay lai:

```bash
docker compose up --build
```

- Dang nhap lai bang `alice/user123`, truy cap `/admin` se bi chan.

## 5. Kich ban 3: Credential Leakage

### Trang thai khong an toan

- Credential nam truc tiep trong `docker-compose.yml` hoac `secrets/leaked-config.env`.
- Neu source/config bi lo, attacker co the dung credential de ket noi PostgreSQL hoac MinIO.

### Cach demo

1. Mo `secrets/leaked-config.env`.
2. Chi ra cac gia tri `DB_PASSWORD`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY` dang o dang ro.
3. Truy cap `/config-risk` de xem ung dung canh bao secret plaintext.

### Fix bang ma hoa secret

Nhom su dung mo hinh hybrid encryption:

- AES/Fernet ma hoa gia tri secret.
- RSA public key ma hoa khoa AES.
- Ung dung dung RSA private key de giai ma khoa AES, sau do giai ma secret khi khoi dong.

Sinh secret da ma hoa:

Truoc tien tao va kich hoat Python venv:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-dev.txt
```

Neu dung Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt
```

Sau do chay:

```bash
python scripts/generate_encrypted_secrets.py
```

Cap nhat `docker-compose.yml`:

```yaml
SECRET_MODE: encrypted
SECRET_DIR: /run/demo-secrets
```

Sau khi fix:

- File cau hinh khong con secret dang ro.
- Neu chi lo source/config ma khong co private key, attacker khong lay duoc credential.

## 6. Thu tu trinh bay

1. Gioi thieu muc tieu va kien truc.
2. Chay `docker compose up --build`.
3. Demo Public Bucket o trang thai public.
4. Chuyen bucket ve private va thu lai.
5. Demo Alice co quyen admin sai.
6. Doi `APP_MODE=secure` va thu lai.
7. Demo secret dang ro trong config.
8. Sinh secret ma hoa, doi `SECRET_MODE=encrypted`, chay lai app.
9. Tong ket STRIDE va bang so sanh truoc/sau.

## 7. Ket qua mong doi

| Noi dung | Truoc fix | Sau fix |
|---|---|---|
| Public Bucket | Tai file khong can dang nhap | URL public bi tu choi |
| IAM | User thuong vao duoc `/admin` | User thuong bi chan |
| Secret | Mat khau/access key dang ro | Secret duoc ma hoa |
