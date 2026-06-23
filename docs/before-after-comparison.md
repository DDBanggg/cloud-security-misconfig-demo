# So sanh truoc va sau khi fix

| Hang muc | Truoc fix | Sau fix | Ket qua kiem tra |
|---|---|---|---|
| Bucket MinIO | Public download | Private bucket | Link public bi tu choi |
| Quyen user | Alice co role admin | Alice co role viewer | `/admin` bi chan |
| Credential | Luu dang ro trong config | Luu dang ma hoa | Khong thay secret that trong file config |
| Quan ly khoa | Khong co | RSA private key dung de giai ma | Thieu private key thi app khong doc duoc secret |
