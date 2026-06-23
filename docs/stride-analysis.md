# Phan tich STRIDE

| Kich ban | STRIDE | Mo ta rui ro | Bien phap |
|---|---|---|---|
| Public Storage Bucket | Information Disclosure | Du lieu trong bucket bi tai khong can xac thuc | Private bucket, access policy, ma hoa du lieu |
| IAM Misconfiguration | Elevation of Privilege | User thuong co quyen admin | RBAC, Least Privilege, kiem tra quyen o backend |
| IAM Misconfiguration | Tampering | User sai quyen co the thay doi/xoa du lieu | Phan tach vai tro, audit log |
| Credential Leakage | Spoofing | Attacker dung credential bi lo de gia mao ung dung | Ma hoa secret, bao ve private key, xoay vong key |
| Credential Leakage | Information Disclosure | Credential dang ro lam lo DB/storage | Khong hardcode secret, secret manager, hybrid encryption |
