CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    action TEXT NOT NULL,
    actor TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO customers(full_name, email, phone) VALUES
    ('Nguyen Van An', 'an.nguyen@example.test', '0901000001'),
    ('Tran Thi Binh', 'binh.tran@example.test', '0901000002'),
    ('Le Quoc Cuong', 'cuong.le@example.test', '0901000003')
ON CONFLICT DO NOTHING;
