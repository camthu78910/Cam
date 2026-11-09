# Brief mẫu (sửa phần trong [ngoặc] rồi dán vào Claude Code)

```
Làm một clip motion graphics 8 giây trong projects/[ten-clip], xuất cả 16:9 và 9:16, 30 fps.

MỤC ĐÍCH: Giới thiệu [tên sản phẩm/kênh] cho người xem [mô tả đối tượng]. Người xem phải nhớ được một ý: "[câu chốt]".

ASSET THẬT (bắt buộc dùng, không tự vẽ thay thế):
- Logo: assets/logo.svg (giữ nguyên tỉ lệ, không đổi màu)
- Màu thương hiệu: nền [#1a1a1a], nhấn [#fa520f], chữ [#ffffff]
- Font: [Inter] cho chữ, [JetBrains Mono] cho số
- Ảnh: assets/screen-1.png, assets/screen-2.png (ảnh chụp màn hình thật)
- Nhạc: [assets/nhac.mp3, BPM ...] hoặc [không nhạc]

PHONG CÁCH: Keynote nền tối, lưới Thụy Sĩ, tối đa 2 cỡ chữ mỗi cảnh, nhiều khoảng trống. Mọi chuyển động dùng spring (có độ nhún đo được), không dùng ease mặc định.

CẤM: Hạt bay lấp lánh, lens flare, viền neon phát sáng, tách màu RGB, nhún nảy quá tay, chữ in hoa toàn bộ trên nền chuyển màu, nền gradient tím hồng.

QUY TRÌNH: Ra storyboard theo mốc giây và bảng lưới nhịp trước, chờ mình duyệt rồi mới viết code. Sau khi render, tự chấm 8 tiêu chí, sửa tới khi mọi tiêu chí từ 8/10 rồi mới đưa mình xem.
```

Nếu đã cài plugin Motion Studio, thêm ở đầu: `Dùng skill motion-studio, engine=code.`
