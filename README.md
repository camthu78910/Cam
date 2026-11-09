# Cam Motion — xưởng phim motion graphics bằng Claude Code

Brief → asset thật → lưới nhịp (duyệt) → Claude viết `scene.html` → Playwright chụp từng khung → FFmpeg ra MP4 → tự chấm tới 8/10 → xuất 16:9 + 9:16.
Luật chi tiết cho Claude nằm ở `CLAUDE.md`. Dựa theo [bài hướng dẫn của Cường Mê AI](https://cuongmeai.com/tai-lieu/xuong-phim-motion-graphics-claude-code).

## Cài một lần
Mac: `brew install node ffmpeg` · Windows: `winget install OpenJS.NodeJS.LTS` và `winget install Gyan.FFmpeg`

```
npm install
npx playwright install chromium
```

Tùy chọn, plugin Motion Studio (gõ trong Claude Code trên máy bạn):
```
/plugin marketplace add flaviorg/motion-studio
/plugin install motion-studio@motion-studio
```

## Làm một clip
1. Thả logo, ảnh, font, nhạc vào `assets/`.
2. Mở `claude` trong thư mục repo, dán brief từ `prompts/brief.md`.
3. Duyệt storyboard + lưới nhịp, nhắn "Đã duyệt, bắt đầu viết code."
4. Nếu Claude đưa file mà chưa có bảng điểm, dán `prompts/tu-cham.md`.
5. Góp ý theo mốc giây.

## Render tay
```
node scripts/render-mini.mjs projects/mau/scene.html out/mau-16x9.mp4 --contact
node scripts/render-mini.mjs projects/mau/scene.html out/mau-9x16.mp4 --size 1080x1920 --contact
node scripts/render-mini.mjs projects/mau/scene.html out/mau.mp4 --audio assets/nhac.mp3
```
Đã có sẵn Chrome (không muốn tải)? Đặt `CHROME_PATH=/duong/dan/chrome`.
