---
name: edit-clip
description: Edit video nói trước camera (TikTok, Reels, Shorts) kiểu motion graphics — phụ đề tiếng Việt khớp từng lời, chữ nhấn nền vàng, thẻ đồ họa bật lên bằng spring — rồi mở editor trên trình duyệt để người dùng tự chỉnh và render không tốn token. Dùng khi người dùng đưa một file video và muốn thêm phụ đề, chữ, hiệu ứng, hoặc nói "edit clip này".
---

# Edit clip nói trước camera

Đầu vào: một file video (người nói). Đầu ra: MP4 cùng kích thước, giữ nguyên tiếng, có lớp phủ:
- **Phụ đề** khớp lời (2–4 từ mỗi dòng), dòng quan trọng nhấn **nền vàng chữ đen**.
- **Thẻ đồ họa** (icon + tiêu đề + dòng phụ) bật lên đúng lúc người nói nhắc tới ý đó.

Mọi thứ nằm trong một file `edit.json`. Claude soạn bản đầu, người dùng tự tinh chỉnh trong editor.

`<SKILL>` dưới đây là thư mục của skill này (thư mục chứa file SKILL.md).

## 0. Cài một lần
```
pip install faster-whisper
cd <SKILL> && npm install && npx playwright install chromium
```
Cần `ffmpeg` trong PATH. Kiểm tra trước, thiếu gì thì cài, báo phiên bản.

## 1. Chuyển giọng nói thành chữ
```
python3 <SKILL>/scripts/transcribe.py <video> <thu-muc-du-an> [--model small|medium|large-v3]
```
Ra `words.json` (từng từ có mốc giây) và `edit.json` nháp (phụ đề đã gom dòng, chưa có thẻ).
Model `small` nhanh nhưng hay nghe sai tên riêng; bản cuối hoặc giọng khó nghe thì dùng `large-v3`.

## 2. Soạn edit.json
Đọc `edit.json` và `words.json`, rồi sửa trực tiếp:
1. **Sửa chính tả**: Whisper hay nghe sai tên riêng và từ tiếng Anh (vd. "August 5 5" → "Opus 5.5",
   "leo" → "layer", "trăm lai" → "timeline"). Sửa theo ngữ cảnh, giữ mốc giây. Không chắc thì hỏi.
2. **Chọn dòng nhấn** (`"highlight": true`): câu mở (hook), từ khóa, câu chốt. Khoảng 1/5 số dòng, không nhấn hai dòng liền nhau.
3. **Thêm thẻ** cho mỗi tên công cụ, tính năng hoặc ý liệt kê. Thẻ bật lên đúng lúc người nói nhắc tới,
   thẻ cùng nhóm thì xếp lưới (vd. x 0.3/0.72, y 0.12/0.22), tắt cùng lúc.
4. Hook (3 giây đầu) có thể dùng `"pos": "top"` để làm tiêu đề lớn.

Định dạng:
```json
{
  "style": { "accent": "#FFE14D", "font": "\"Be Vietnam Pro\", Inter, Arial, sans-serif" },
  "captions": [
    { "start": 0.43, "end": 1.17, "text": "Quá đẳng cấp mọi người", "highlight": true, "pos": "bottom" }
  ],
  "cards": [
    { "start": 16.2, "end": 21.3, "icon": "Aa", "title": "Typography", "sub": "đủ kiểu", "x": 0.3, "y": 0.12 }
  ]
}
```
- `pos`: `bottom` (62% chiều cao, trên vùng chữ của TikTok), `middle`, `top`.
- `x`, `y`: tâm thẻ, tính theo tỉ lệ khung (0–1). Tránh mặt người nói và cột nút bên phải (x > 0.85).
- Màu và font thương hiệu: nếu dự án có `brand.md` thì lấy từ đó.

## 3. Render và tự soát
```
node <SKILL>/scripts/render-edit.mjs <video> <edit.json> <out.mp4>
ffmpeg -i <out.mp4> -vf "fps=1,scale=300:-1,tile=6x5" -frames:v 1 <contact.png>
```
Mở contact sheet ra và NHÌN. Sửa nếu thấy chữ cắt mép, thẻ che mặt, dòng nhấn sai chỗ hay chữ lệch lời.
Clip dài thì soát theo đoạn (`-ss`, `-t`).

## 4. Đưa editor cho người dùng
```
node <SKILL>/scripts/editor.mjs <video> <edit.json>     # http://localhost:4321
```
Chạy nền rồi đưa link. Trong editor, người dùng xem video có lớp phủ trực tiếp và làm được các việc sau:
- sửa chữ, mốc giờ, bật/tắt nhấn;
- bấm ⏱ để dời dòng tới thời điểm đang xem;
- thêm hoặc xoá dòng và thẻ;
- Lưu (Ctrl+S), rồi Render MP4 (ra `<edit>-final.mp4`).

Mục đích là để người dùng **tự chỉnh chi tiết, không phải prompt từng lỗi nhỏ**. Chỉ khi họ cần đổi lớn
(thêm loại hiệu ứng mới, đổi phong cách) thì mới sửa `template/overlay.js`.

## Luật
- `overlay.js` là hàm thuần của `t` (không timer, không random), dùng chung cho render và editor.
  Sửa giao diện thì sửa ở đó để hai bên luôn khớp.
- Không thêm hạt lấp lánh, lens flare, neon, tách màu RGB. Chuyển động chỉ dùng spring đã có.
- Chỉ edit video người dùng có quyền sử dụng.
