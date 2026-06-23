from flask import Flask, redirect, render_template_string, request, session, url_for
import boto3
import psycopg

import config


app = Flask(__name__)
app.secret_key = "demo-only-session-key"

USERS = {
    "admin": {"password": "admin123", "role": "admin"},
    "alice": {"password": "user123", "role": "admin" if config.APP_MODE == "vulnerable" else "viewer"},
}


def db_conn():
    return psycopg.connect(
        host=config.DB_HOST,
        port=config.DB_PORT,
        dbname=config.DB_NAME,
        user=config.DB_USER,
        password=config.DB_PASSWORD,
    )


def minio_client():
    return boto3.client(
        "s3",
        endpoint_url=f"http://{config.MINIO_ENDPOINT}",
        aws_access_key_id=config.MINIO_ACCESS_KEY,
        aws_secret_access_key=config.MINIO_SECRET_KEY,
        region_name="us-east-1",
    )


def current_user():
    username = session.get("username")
    if not username:
        return None
    return {"username": username, **USERS[username]}


def require_login():
    if not current_user():
        return redirect(url_for("login"))
    return None


PAGE = """
<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <title>NMATTT Cloud Security Demo</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 32px; color: #1f2937; }
    nav a { margin-right: 12px; }
    table { border-collapse: collapse; width: 100%; margin-top: 16px; }
    th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
    code, pre { background: #f3f4f6; padding: 2px 4px; }
    .warning { color: #b91c1c; font-weight: 700; }
    .ok { color: #047857; font-weight: 700; }
  </style>
</head>
<body>
  <h1>NMATTT Cloud Security Demo</h1>
  <nav>
    <a href="/">Home</a>
    <a href="/customers">Customers</a>
    <a href="/storage">Storage</a>
    <a href="/admin">Admin</a>
    <a href="/config-risk">Credential Risk</a>
    {% if user %}<a href="/logout">Logout {{ user.username }}</a>{% else %}<a href="/login">Login</a>{% endif %}
  </nav>
  <hr>
  {{ body|safe }}
</body>
</html>
"""


def page(body):
    return render_template_string(PAGE, body=body, user=current_user())


@app.route("/")
def index():
    mode = "khong an toan" if config.APP_MODE == "vulnerable" else "da ap dung fix"
    return page(f"""
    <h2>Kien truc demo</h2>
    <p>Web app ket noi PostgreSQL va MinIO trong cung Docker Network.</p>
    <p>APP_MODE: <code>{config.APP_MODE}</code> - trang thai: <strong>{mode}</strong></p>
    <p>SECRET_MODE: <code>{config.__dict__.get('os').getenv('SECRET_MODE', 'plaintext')}</code></p>
    """)


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        if username in USERS and USERS[username]["password"] == password:
            session["username"] = username
            return redirect(url_for("index"))
        return page("<p class='warning'>Sai tai khoan hoac mat khau.</p>")
    return page("""
    <h2>Login</h2>
    <form method="post">
      <p><input name="username" placeholder="username"></p>
      <p><input name="password" placeholder="password" type="password"></p>
      <button type="submit">Login</button>
    </form>
    <p>Demo: admin/admin123 hoac alice/user123</p>
    """)


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("index"))


@app.route("/customers")
def customers():
    blocked = require_login()
    if blocked:
        return blocked
    with db_conn() as conn:
        rows = conn.execute("SELECT id, full_name, email, phone FROM customers ORDER BY id").fetchall()
    table_rows = "".join(f"<tr><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td></tr>" for r in rows)
    return page(f"""
    <h2>Customer Data</h2>
    <p>Du lieu mau lay tu PostgreSQL.</p>
    <table><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th></tr>{table_rows}</table>
    """)


@app.route("/storage")
def storage():
    client = minio_client()
    objects = client.list_objects_v2(Bucket=config.MINIO_BUCKET).get("Contents", [])
    links = ""
    for obj in objects:
        key = obj["Key"]
        public_url = f"http://{config.MINIO_PUBLIC_ENDPOINT}/{config.MINIO_BUCKET}/{key}"
        links += f"<li><a href='{public_url}'>{public_url}</a></li>"
    return page(f"""
    <h2>Public Storage Bucket</h2>
    <p>Bucket: <code>{config.MINIO_BUCKET}</code></p>
    <ul>{links}</ul>
    <p class="warning">O trang thai vulnerable, cac link nay co the tai truc tiep khong can dang nhap.</p>
    """)


@app.route("/admin")
def admin():
    blocked = require_login()
    if blocked:
        return blocked
    user = current_user()
    if user["role"] != "admin":
        return page("<p class='ok'>Access denied: user thuong khong con quyen admin.</p>")
    return page(f"""
    <h2>Admin Area</h2>
    <p class="warning">Tai khoan hien tai: {user['username']} - role: {user['role']}</p>
    <p>Trong che do vulnerable, alice bi cap nham role admin nen truy cap duoc khu vuc nay.</p>
    <form method="post" action="/admin/delete-sample">
      <button type="submit">Xoa ban ghi mau</button>
    </form>
    """)


@app.route("/admin/delete-sample", methods=["POST"])
def delete_sample():
    blocked = require_login()
    if blocked:
        return blocked
    user = current_user()
    if user["role"] != "admin":
        return page("<p class='ok'>Access denied.</p>")
    with db_conn() as conn:
        conn.execute("DELETE FROM audit_logs WHERE action = 'sample-delete-demo'")
        conn.execute("INSERT INTO audit_logs(action, actor) VALUES ('sample-delete-demo', %s)", (user["username"],))
    return page("<p class='warning'>Da thuc hien thao tac nhay cam bang quyen admin.</p>")


@app.route("/config-risk")
def config_risk():
    secret_mode = config.__dict__.get("os").getenv("SECRET_MODE", "plaintext")
    if secret_mode == "encrypted":
        body = """
        <h2>Credential Leakage Fix</h2>
        <p class="ok">Secret dang duoc doc tu ban ma hoa va giai ma bang private key luc ung dung khoi dong.</p>
        <p>Neu chi bi lo source/config ma khong co private key, attacker khong lay duoc credential dang ro.</p>
        """
    else:
        body = """
        <h2>Credential Leakage</h2>
        <p class="warning">Secret dang nam truc tiep trong bien moi truong Docker Compose.</p>
        <pre>DB_PASSWORD=postgres123
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123</pre>
        """
    return page(body)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
