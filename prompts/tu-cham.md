# Vòng tự xem lại và chấm điểm (dán sau khi Claude render lần đầu)

```
Trước khi đưa mình xem, hãy tự kiểm tra theo đúng vòng sau và lặp ít nhất 3 vòng:

1. Xuất contact sheet mỗi giây một khung (và một tấm mỗi nửa giây cho 2 giây có chuyển động mạnh nhất). Mở ảnh lên và NHÌN, đừng đoán từ code.
2. Liệt kê theo mốc giây mọi lỗi thấy được: Chữ đè nhau hoặc bị cắt mép, khung trống hoặc quá trống, font dự phòng, logo méo, phần tử lệch lưới, chuyển động vào cùng lúc, nhún quá tay, cắt cảnh lệch nhịp.
3. Chấm 8 tiêu chí (thương hiệu, thứ bậc và độ đọc, nhịp và đồng bộ, chất lượng chuyển động, bố cục, độ mới, thông điệp, hoàn thiện kỹ thuật) từ 1 tới 10, ghi lý do một dòng cho mỗi điểm dưới 8.
4. Sửa 3 tiêu chí thấp nhất, render lại, quay về bước 1.

Chỉ dừng khi mọi tiêu chí từ 8/10. Khi dừng, gửi mình: Bảng điểm vòng cuối, danh sách đã sửa qua từng vòng, contact sheet cuối và file MP4. Nếu sau 5 vòng vẫn có tiêu chí dưới 8, dừng lại và nói rõ vì sao chứ đừng tự hạ chuẩn.
```

## Lệnh hỗ trợ
- Contact sheet mỗi giây: `ffmpeg -i out/x.mp4 -vf "fps=1,scale=360:-1,tile=5x3" out/contact.png`
- Mỗi nửa giây: `ffmpeg -i out/x.mp4 -vf "fps=2,scale=360:-1,tile=6x5" out/contact-05.png`
- Ghép nhạc vào video đã render (không nén lại hình): `ffmpeg -i out/x.mp4 -i assets/nhac.mp3 -c:v copy -c:a aac -b:a 192k -shortest out/final.mp4`
