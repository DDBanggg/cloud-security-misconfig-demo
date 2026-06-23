# NMATTT Cloud Security Demo

Đây là project demo cho môn **Nhập môn An toàn thông tin**. Project mô phỏng một hệ thống cloud nhỏ chạy bằng Docker, gồm web app Flask, PostgreSQL và MinIO, nhằm minh họa các lỗi cấu hình bảo mật phổ biến trong môi trường điện toán đám mây.

## Mục tiêu

Project tập trung trình bày 3 rủi ro bảo mật thường gặp:

1. **Public Storage Bucket**: bucket lưu trữ được cấu hình public, cho phép truy cập dữ liệu trực tiếp mà không cần xác thực.
2. **IAM Misconfiguration**: tài khoản người dùng thường bị cấp nhầm quyền admin.
3. **Credential Leakage**: thông tin nhạy cảm như mật khẩu database và access key bị đặt trực tiếp trong cấu hình, sau đó được cải thiện bằng cơ chế mã hóa secret.

## Kiến trúc

Các thành phần chính:

- **Flask Web App**: giao diện demo, đăng nhập, xem dữ liệu khách hàng, truy cập bucket và kiểm tra rủi ro credential.
- **PostgreSQL**: lưu dữ liệu khách hàng và audit log mẫu.
- **MinIO**: giả lập dịch vụ object storage tương tự Amazon S3.
- **Docker Compose**: khởi chạy toàn bộ môi trường demo.

## Công nghệ sử dụng

- Python / Flask
- PostgreSQL
- MinIO
- Docker & Docker Compose
- Boto3
- Psycopg
- Cryptography / Fernet

## Cấu trúc thư mục

```text
.
├── app/                     # Source code Flask app
├── db/                      # Script khởi tạo database
├── docs/                    # Tài liệu phân tích và kịch bản demo
├── minio/                   # Script tạo bucket và dữ liệu mẫu
├── scripts/                 # Script sinh secret mã hóa
├── secrets/                 # File secret mẫu cho demo
├── docker-compose.yml       # Cấu hình các service Docker
├── requirements-dev.txt     # Dependency cho script local
└── README.md
```

## Cách chạy project

### 1. Tạo môi trường Python local

Trên Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements-dev.txt
```

Trên WSL/Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements-dev.txt
```

### 2. Sinh secret mã hóa

```bash
python scripts/generate_encrypted_secrets.py
```

### 3. Chạy Docker demo

```bash
docker compose up --build
```

## Địa chỉ truy cập

- Web app: <http://localhost:5000>
- MinIO Console: <http://localhost:9001>
- MinIO API: <http://localhost:9000>
- PostgreSQL: `localhost:5432`

## Tài khoản demo

### Web app

| Username | Password | Ghi chú |
| --- | --- | --- |
| `admin` | `admin123` | Tài khoản admin |
| `alice` | `user123` | Trong chế độ vulnerable, user này bị cấp nhầm quyền admin |

### MinIO

| Username | Password |
| --- | --- |
| `minioadmin` | `minioadmin123` |

## Các trang demo chính

- `/customers`: xem dữ liệu khách hàng từ PostgreSQL.
- `/storage`: xem link object trong MinIO bucket public.
- `/admin`: minh họa lỗi phân quyền sai.
- `/config-risk`: minh họa rủi ro lộ credential và hướng cải thiện bằng secret mã hóa.

## Chế độ vulnerable và fixed

Mặc định project chạy ở chế độ dễ bị tấn công:

```yaml
APP_MODE: vulnerable
SECRET_MODE: plaintext
```

Có thể điều chỉnh trong `docker-compose.yml` để mô phỏng trạng thái đã khắc phục, ví dụ:

```yaml
APP_MODE: fixed
SECRET_MODE: encrypted
```

## Tài liệu đi kèm

- `docs/demo-plan.md`: kế hoạch demo.
- `docs/demo-script.md`: kịch bản trình bày.
- `docs/stride-analysis.md`: phân tích mối đe dọa theo STRIDE.
- `docs/before-after-comparison.md`: so sánh trước và sau khi khắc phục.

## Lưu ý khi đưa lên GitHub

Project này dùng credential và secret cho mục đích demo. Trước khi public repository, cần kiểm tra kỹ để không commit private key, file `.enc`, file `.env`, hoặc secret thật. Các giá trị trong project chỉ nên được dùng trong môi trường local/demo, không dùng cho production.

## Giấy phép

Project phục vụ mục đích học tập và minh họa bảo mật.
