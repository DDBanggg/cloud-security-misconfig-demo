# Bang so sanh truoc va sau khac phuc

| Hang muc | Truoc khi khac phuc | Sau khi khac phuc |
| --- | --- | --- |
| Public Bucket | Object trong MinIO co the truy cap truc tiep khong can xac thuc | Bucket chuyen sang private, truy cap truc tiep bi tu choi |
| IAM | User thuong `alice` truy cap duoc `/admin` | `alice` bi chan khoi trang quan tri |
| Credential | DB password va MinIO key nam trong cau hinh dang ro | Secret duoc tach rieng va ma hoa |
| Rui ro | Co nguy co ro ri du lieu khach hang va secret | Giam rui ro bang least privilege va encrypted secret |
| Bang chung | Anh `06`, `07`, `08`, `09`, `11-1-before` | Anh `11-admin-fixed`, `12`, `13`, `14`, `11-2-after` |
