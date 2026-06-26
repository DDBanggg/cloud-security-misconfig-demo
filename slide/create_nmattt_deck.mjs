import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const ROOT = "\\\\wsl.localhost\\Ubuntu\\home\\ddb11\\projects\\NMATTT";
const PICTURES = path.join(ROOT, "pictures");
const OUT = path.join(ROOT, "slide", "NMATTT_Cloud_Security_Demo.pptx");
const PREVIEW = path.join(ROOT, "slide", "preview");

const W = 1280;
const H = 720;
const blue = "#1F4E79";
const dark = "#17324D";
const light = "#F4F8FC";
const green = "#2E7D32";
const red = "#B3261E";
const gray = "#5F6B7A";

async function writeBlob(filePath, blob) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

async function imageBlob(name) {
  const file = path.join(PICTURES, name);
  const bytes = await fs.readFile(file);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

function addText(slide, text, x, y, w, h, opts = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    position: { left: x, top: y, width: w, height: h },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  shape.text = text;
  shape.text.style = {
    fontSize: opts.size ?? 20,
    bold: opts.bold ?? false,
    color: opts.color ?? dark,
    alignment: opts.align ?? "left",
  };
  return shape;
}

function addBox(slide, text, x, y, w, h, opts = {}) {
  const shape = slide.shapes.add({
    geometry: "roundRect",
    position: { left: x, top: y, width: w, height: h },
    fill: opts.fill ?? "white",
    line: { style: "solid", fill: opts.line ?? "#C8D3E0", width: opts.lineWidth ?? 1 },
    borderRadius: "rounded-lg",
  });
  shape.text = text;
  shape.text.style = {
    fontSize: opts.size ?? 20,
    bold: opts.bold ?? false,
    color: opts.color ?? dark,
    alignment: opts.align ?? "center",
  };
  return shape;
}

function addHeader(slide, title, index) {
  slide.background.fill = "#FFFFFF";
  slide.shapes.add({
    geometry: "rect",
    position: { left: 0, top: 0, width: W, height: 52 },
    fill: blue,
    line: { style: "solid", fill: blue, width: 0 },
  });
  addText(slide, title, 56, 10, 980, 38, { size: 28, bold: true, color: "#FFFFFF" });
  addText(slide, String(index).padStart(2, "0"), 1160, 12, 70, 32, {
    size: 18,
    bold: true,
    color: "#D9EAF7",
    align: "right",
  });
}

async function addImage(slide, name, x, y, w, h, opts = {}) {
  slide.images.add({
    blob: await imageBlob(name),
    contentType: name.endsWith(".jpg") ? "image/jpeg" : "image/png",
    alt: opts.alt ?? name,
    fit: opts.fit ?? "contain",
    position: { left: x, top: y, width: w, height: h },
  });
}

function addBullets(slide, items, x, y, w, h, opts = {}) {
  const text = items.map((item) => `• ${item}`).join("\n");
  return addText(slide, text, x, y, w, h, {
    size: opts.size ?? 22,
    color: opts.color ?? dark,
  });
}

function addArrow(slide, x1, y1, x2, y2) {
  slide.shapes.add({
    geometry: "line",
    position: { left: x1, top: y1, width: x2 - x1, height: y2 - y1 },
    line: { style: "solid", fill: "#2F3A4A", width: 2.5, beginArrowType: "none", endArrowType: "triangle" },
  });
}

function architectureSlide(slide) {
  addBox(slide, "User\nBrowser", 70, 220, 180, 92, { fill: light, bold: true });
  addBox(slide, "Attacker\nPublic URL", 70, 410, 180, 92, { fill: "#FFF2F0", line: red, bold: true });
  addBox(slide, "Flask Web App\n:5000", 430, 250, 230, 112, { fill: "#FFFFFF", bold: true });
  addBox(slide, "PostgreSQL\nCustomer data", 900, 185, 240, 100, { fill: "#FFFFFF", bold: true });
  addBox(slide, "MinIO Storage\n:9000 / :9001", 900, 420, 240, 110, { fill: "#FFF2F0", line: red, bold: true });
  addBox(slide, "Encrypted Secret", 430, 470, 230, 80, { fill: "#F1FAF3", line: green, bold: true });
  addArrow(slide, 250, 266, 430, 300);
  addArrow(slide, 660, 286, 900, 235);
  addArrow(slide, 660, 336, 900, 470);
  addArrow(slide, 250, 456, 900, 475);
  addArrow(slide, 545, 470, 545, 362);
  addText(slide, "Docker network: cloud-lab", 430, 160, 340, 36, { size: 22, bold: true, color: gray });
}

function comparisonTable(slide) {
  const x = 72;
  const y = 145;
  const widths = [230, 430, 430];
  const rowH = 74;
  const headers = ["Hạng mục", "Trước khi khắc phục", "Sau khi khắc phục"];
  let cx = x;
  headers.forEach((h, i) => {
    addBox(slide, h, cx, y, widths[i], 52, { fill: blue, line: blue, color: "#FFFFFF", bold: true, size: 19 });
    cx += widths[i];
  });
  const rows = [
    ["Public Bucket", "Object trong MinIO mở trực tiếp không cần xác thực", "Bucket private, truy cập trực tiếp bị từ chối"],
    ["IAM", "User thường alice truy cập được /admin", "alice bị chặn khỏi trang quản trị"],
    ["Credential", "DB password và MinIO key ở dạng rõ", "Secret được tách riêng và mã hóa"],
    ["Rủi ro", "Có nguy cơ rò rỉ dữ liệu khách hàng và secret", "Giảm rủi ro bằng least privilege và encrypted secret"],
  ];
  rows.forEach((row, r) => {
    cx = x;
    row.forEach((cell, i) => {
      addBox(slide, cell, cx, y + 52 + r * rowH, widths[i], rowH, {
        fill: i === 0 ? "#EEF4FA" : "white",
        line: "#C8D3E0",
        bold: i === 0,
        size: i === 0 ? 18 : 17,
        align: "center",
      });
      cx += widths[i];
    });
  });
}

async function main() {
  await fs.mkdir(PREVIEW, { recursive: true });
  const deck = Presentation.create({ slideSize: { width: W, height: H } });

  let s = deck.slides.add();
  s.background.fill = "#FFFFFF";
  s.shapes.add({ geometry: "rect", position: { left: 0, top: 0, width: W, height: H }, fill: light, line: { style: "solid", fill: light, width: 0 } });
  addText(s, "Điện toán đám mây và\nBảo mật điện toán đám mây", 70, 120, 760, 150, { size: 48, bold: true, color: dark });
  addText(s, "Phân tích rủi ro, lỗ hổng và cơ chế bảo vệ dữ liệu", 74, 294, 780, 40, { size: 24, color: gray });
  addText(s, "Nhập môn An toàn thông tin\nNhóm: Đào Trường Anh, Nguyễn Đồng Minh Anh, Đoàn Đình Bằng", 74, 540, 780, 78, { size: 19, color: dark });
  addBox(s, "Cloud Security Demo\nFlask + PostgreSQL + MinIO", 880, 170, 300, 260, { fill: "#FFFFFF", line: blue, bold: true, size: 26, color: blue });

  s = deck.slides.add(); addHeader(s, "Mục tiêu và bố cục", 2);
  addBullets(s, [
    "Tổng quan điện toán đám mây và mô hình chia sẻ trách nhiệm",
    "Phân tích rủi ro: public bucket, IAM sai, credential leakage",
    "Xây dựng lab demo bằng Docker Compose",
    "So sánh trạng thái vulnerable và fixed",
  ], 80, 135, 760, 260, { size: 26 });
  addBox(s, "Luồng trình bày\n1. Lý thuyết\n2. Rủi ro\n3. Demo\n4. Khắc phục", 875, 145, 280, 280, { fill: light, line: blue, bold: true, color: blue, size: 24 });

  s = deck.slides.add(); addHeader(s, "Kiến trúc hệ thống demo", 3);
  architectureSlide(s);

  s = deck.slides.add(); addHeader(s, "Môi trường thực nghiệm", 4);
  addText(s, "Docker Compose khởi chạy 4 service: web, postgres, minio và minio-init.", 70, 85, 900, 38, { size: 22, color: dark });
  await addImage(s, "02-docker-compose-ps.png", 70, 135, 1030, 430);
  addBox(s, "Bằng chứng môi trường\nđã chạy thành công", 935, 575, 220, 78, { fill: light, line: blue, bold: true, color: blue, size: 20 });

  s = deck.slides.add(); addHeader(s, "Tài sản cần bảo vệ", 5);
  await addImage(s, "05-customers-postgresql.png", 70, 120, 540, 330);
  await addImage(s, "10-minio-console-public-bucket.png", 670, 120, 540, 330);
  addBox(s, "PostgreSQL\nDữ liệu khách hàng", 120, 490, 400, 80, { fill: light, line: blue, bold: true, color: blue });
  addBox(s, "MinIO\nObject storage", 720, 490, 400, 80, { fill: "#FFF2F0", line: red, bold: true, color: red });

  s = deck.slides.add(); addHeader(s, "Phân tích rủi ro theo STRIDE", 6);
  const stride = [
    ["S", "Spoofing", "Chiếm tài khoản hoặc dùng credential lộ"],
    ["T", "Tampering", "Sửa dữ liệu trong bucket/database"],
    ["R", "Repudiation", "Thiếu audit log để truy vết"],
    ["I", "Info Disclosure", "Bucket public, secret plaintext"],
    ["D", "DoS", "Request bất thường gây quá tải"],
    ["E", "Privilege", "User thường có quyền admin"],
  ];
  stride.forEach((row, i) => {
    const y = 112 + i * 78;
    addBox(s, row[0], 80, y, 60, 54, { fill: i % 2 ? light : "#EEF4FA", line: blue, bold: true, color: blue, size: 24 });
    addText(s, row[1], 160, y + 4, 210, 36, { size: 22, bold: true, color: dark });
    addText(s, row[2], 390, y + 4, 720, 40, { size: 20, color: gray });
  });

  s = deck.slides.add(); addHeader(s, "Lỗi 1: Public Storage Bucket", 7);
  await addImage(s, "06-storage-public-bucket.png", 70, 115, 530, 350);
  await addImage(s, "07-public-object-customers-csv.png", 650, 115, 530, 350);
  addBox(s, "Object customers.csv có thể mở trực tiếp qua URL\nkhông cần xác thực", 220, 500, 800, 76, { fill: "#FFF2F0", line: red, bold: true, color: red, size: 22 });

  s = deck.slides.add(); addHeader(s, "Lỗi 2: IAM Misconfiguration", 8);
  await addImage(s, "08-admin-vulnerable-alice.png", 90, 120, 760, 390);
  addBullets(s, [
    "alice là tài khoản người dùng thường",
    "Trong chế độ vulnerable vẫn truy cập được /admin",
    "Nguyên nhân: kiểm tra quyền chưa đúng ở server side",
  ], 890, 150, 310, 260, { size: 21 });

  s = deck.slides.add(); addHeader(s, "Lỗi 3: Credential Leakage", 9);
  await addImage(s, "09-config-risk-plaintext.png", 80, 115, 610, 365);
  await addImage(s, "11-1-before.png", 735, 115, 405, 365);
  addBox(s, "DB password, access key và secret key xuất hiện ở dạng rõ", 160, 520, 900, 64, { fill: "#FFF2F0", line: red, bold: true, color: red, size: 22 });

  s = deck.slides.add(); addHeader(s, "Chuyển sang trạng thái fixed", 10);
  await addImage(s, "11-1-before.png", 95, 120, 455, 360);
  await addImage(s, "11-2-after.png", 730, 120, 455, 360);
  addBox(s, "Before\nAPP_MODE=vulnerable\nSECRET_MODE=plaintext", 125, 505, 390, 92, { fill: "#FFF2F0", line: red, bold: true, color: red, size: 20 });
  addBox(s, "After\nAPP_MODE=fixed\nSECRET_MODE=encrypted", 765, 505, 390, 92, { fill: "#F1FAF3", line: green, bold: true, color: green, size: 20 });

  s = deck.slides.add(); addHeader(s, "Kết quả sau khắc phục", 11);
  await addImage(s, "11-admin-fixed-alice-denied.png", 70, 120, 540, 330);
  await addImage(s, "13-public-object-denied-fixed.png", 670, 120, 540, 330);
  addBox(s, "alice bị chặn khỏi /admin", 120, 490, 400, 75, { fill: "#F1FAF3", line: green, bold: true, color: green });
  addBox(s, "object private, truy cập trực tiếp bị từ chối", 720, 490, 420, 75, { fill: "#F1FAF3", line: green, bold: true, color: green });

  s = deck.slides.add(); addHeader(s, "Secret được mã hóa", 12);
  await addImage(s, "14-config-risk-encrypted.png", 100, 120, 760, 390);
  addBullets(s, [
    "Secret được tách khỏi cấu hình trực tiếp",
    "Ứng dụng chỉ giải mã khi chạy",
    "Giảm tác động nếu source/config bị lộ",
  ], 910, 155, 285, 260, { size: 21 });

  s = deck.slides.add(); addHeader(s, "So sánh trước và sau", 13);
  comparisonTable(s);

  s = deck.slides.add(); addHeader(s, "Kết luận và demo trực tiếp", 14);
  addBullets(s, [
    "Cloud security phụ thuộc mạnh vào cấu hình và phân quyền",
    "Ba lỗi demo đều phổ biến: public bucket, quyền quá mức, secret plaintext",
    "Biện pháp chính: private-by-default, least privilege, encrypted secret, audit log",
  ], 80, 120, 690, 250, { size: 25 });
  addBox(s, "Live demo đề xuất\n1. /storage public object\n2. alice truy cập /admin\n3. chuyển sang fixed\n4. object/admin bị chặn", 830, 130, 310, 300, { fill: light, line: blue, bold: true, color: blue, size: 22 });
  addText(s, "Thông điệp chính: cấu hình nhỏ có thể tạo rủi ro lớn, nhưng kiểm soát đúng giúp giảm đáng kể bề mặt tấn công.", 95, 535, 1030, 54, { size: 24, bold: true, color: dark, align: "center" });

  for (const [i, slide] of deck.slides.items.entries()) {
    const stem = `slide-${String(i + 1).padStart(2, "0")}`;
    await writeBlob(path.join(PREVIEW, `${stem}.png`), await deck.export({ slide, format: "png", scale: 1 }));
    const layout = await slide.export({ format: "layout" });
    await fs.writeFile(path.join(PREVIEW, `${stem}.layout.json`), await layout.text());
  }
  await writeBlob(path.join(PREVIEW, "montage.webp"), await deck.export({ format: "webp", montage: true, scale: 1 }));
  const pptx = await PresentationFile.exportPptx(deck);
  await pptx.save(OUT);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
