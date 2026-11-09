# Xưởng phim motion graphics

Repo này dựng video motion graphics 2D bằng code: Claude viết trang HTML/Canvas có `window.seek(t)`,
Playwright chụp từng khung, FFmpeg khâu thành MP4, Claude tự chấm tới khi đạt 8/10.
Nguồn quy trình: https://cuongmeai.com/tai-lieu/xuong-phim-motion-graphics-claude-code

## Cấu trúc
- `projects/<ten-clip>/scene.html` — một cảnh, theo hợp đồng bên dưới. `projects/mau/` là ví dụ.
- `assets/` — logo, ảnh, font, nhạc THẬT của người dùng. Bắt buộc dùng, không tự vẽ thay thế.
- `kit/spring.js` — hàm `spring(t, {stiffness, damping})` và `lerp`. Nạp bằng `<script src="../../kit/spring.js">`.
- `scripts/render-mini.mjs` — render: `node scripts/render-mini.mjs <scene.html> out/<ten>.mp4 [--size 1080x1920] [--audio assets/nhac.mp3] [--contact]`.
- `prompts/` — brief mẫu và prompt vòng tự chấm.
- `out/` — kết quả render (không commit).
- `brand.md` — tạo sau clip đầu tiên được duyệt; clip sau phải đọc và tuân theo.

Nếu đã cài plugin Motion Studio (`/plugin marketplace add flaviorg/motion-studio` rồi
`/plugin install motion-studio@motion-studio`), ưu tiên skill `motion-studio` (engine=code) cho
lấy asset từ website, âm thanh Web Audio và xuất nhiều tỉ lệ. Các luật dưới đây vẫn áp dụng.

## Hợp đồng cảnh
- Trang khai báo `window.MOTION = { width, height, fps, duration }` và `window.seek(t)` vẽ đúng trạng thái ở giây `t`.
- Đọc kích thước từ `?w=&h=` để một nguồn xuất được 16:9 (1920x1080) và 9:16 (1080x1920).
- **Quy tắc vàng: mỗi khung chỉ phụ thuộc vào t.** Cấm `setTimeout`, `requestAnimationFrame`,
  CSS transition/animation, `Math.random()` không seed, mô phỏng vật lý từng bước.
- Dùng font cài sẵn hoặc file font trong `assets/`, không tải từ mạng.

## Quy trình (luôn theo thứ tự)
1. **Brief**: mục đích, câu chốt người xem phải nhớ, nhịp, âm thanh, tỉ lệ khung. Thiếu thì hỏi ngắn.
2. **Asset thật**: liệt kê file trong `assets/`, mã màu, font. Không có thì hỏi, không bịa.
3. **Storyboard + lưới nhịp**: bảng theo mốc giây trên lưới BPM (mặc định 120 BPM = 0,5 s/nhịp):
   thời điểm, cảnh, chữ, tiếng. Mỗi ô một ý. Câu chốt ở giây 5–7 (clip 8 s). Logo xuất hiện ≥ 2 lần.
   **DỪNG, chờ người dùng duyệt rồi mới viết code.**
4. **Viết code** cảnh theo hợp đồng.
5. **Render** bản nháp (có thể `--size 960x540` cho nhanh), luôn kèm `--contact`.
6. **Tự chấm** theo `prompts/tu-cham.md` cho tới khi mọi tiêu chí ≥ 8/10 (tối đa 5 vòng, không tự hạ chuẩn).
7. **Render cuối** 16:9 và 9:16, ghép nhạc gốc bằng FFmpeg ở bước cuối (`--audio`), không thu âm từ trình duyệt.
8. **Brand kit**: sau khi duyệt, lưu/cập nhật `brand.md` (màu, font, logo, phong cách, spring đã dùng).

## Luật thẩm mỹ
- **Cấm**: hạt bay lấp lánh, lens flare, viền neon phát sáng, tách màu RGB, nhún nảy quá tay,
  chữ in hoa toàn bộ trên nền chuyển màu, nền gradient tím hồng.
- Gọi tên một phong cách cụ thể (mặc định: keynote nền tối, lưới Thụy Sĩ). Tối đa 2 cỡ chữ mỗi cảnh.
  Dàn chữ ở cỡ thật, không vẽ nhỏ rồi phóng to.
- Mọi chuyển động dùng `spring`, không dùng ease mặc định. Damping 18–22, độ lố ≤ 6% quãng đường,
  không nhún quá hai nhịp. Phần tử cùng cảnh vào lệch nhau 60–90 ms.
- Đổi file nhạc hoặc BPM thì phải canh lại lưới nhịp.

## Góp ý của người dùng
Góp ý theo mốc giây ("giây 3,5 chữ vào sớm nửa nhịp") → sửa đúng ô trên lưới nhịp rồi render lại.
