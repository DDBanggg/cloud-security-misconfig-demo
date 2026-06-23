# Script trinh bay demo

## Mo dau

Nhom em xay dung mot moi truong cloud gia lap bang Docker gom Web App, PostgreSQL va MinIO. Muc tieu la minh hoa cac rui ro cau hinh sai trong cloud va so sanh trang thai truoc/sau khi ap dung bien phap bao ve.

## Public Storage Bucket

O trang thai ban dau, bucket `public-customer-data` duoc cau hinh public. Khi mo link file tu Web App, trinh duyet co the tai file truc tiep ma khong can dang nhap. Dieu nay minh hoa rui ro ro ri du lieu do cau hinh bucket sai.

Sau do nhom chuyen bucket ve private va thu lai link cu. Ket qua mong doi la truy cap bi tu choi.

## IAM Misconfiguration

Tai khoan `alice` la user thuong nhung trong trang thai vulnerable bi cap role admin. Vi vay Alice co the truy cap khu vuc `/admin` va thuc hien thao tac nhay cam.

Sau khi doi sang `APP_MODE=secure`, Alice chi con role viewer va bi chan khi truy cap `/admin`.

## Credential Leakage

O trang thai ban dau, credential duoc luu dang ro trong file cau hinh. Neu source hoac config bi lo, credential co the bi dung de truy cap he thong.

Nhom ap dung fix bang hybrid encryption. Secret duoc ma hoa bang AES/Fernet, khoa AES duoc ma hoa bang RSA public key. Ung dung chi co the giai ma khi co private key.

## Ket luan

Ba kich ban tuong ung voi cac rui ro Information Disclosure, Elevation of Privilege va Tampering trong STRIDE. Qua demo, nhom cho thay cau hinh bao mat dung co vai tro quan trong trong viec bao ve tai nguyen cloud.
