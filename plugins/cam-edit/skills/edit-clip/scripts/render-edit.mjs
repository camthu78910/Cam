// Ghep lop phu (edit.json) len video goc, giu nguyen tieng.
// node render-edit.mjs <video> <edit.json> <out.mp4>
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { spawn, execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const [video, editPath, out] = process.argv.slice(2);
if (!video || !editPath || !out) {
  console.error('Usage: node render-edit.mjs <video> <edit.json> <out.mp4>');
  process.exit(1);
}

// Doc kich thuoc, fps, thoi luong tu video goc
const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0',
  '-show_entries', 'stream=width,height,r_frame_rate:stream_side_data=rotation:format=duration', '-of', 'json', video]));
const s = probe.streams[0];
const [n, d] = s.r_frame_rate.split('/').map(Number);
const rotated = Math.abs(s.side_data_list?.[0]?.rotation ?? 0) === 90; // video quay doc tu dien thoai
const meta = {
  width: rotated ? s.height : s.width, height: rotated ? s.width : s.height,
  fps: n / d, duration: Number(probe.format.duration),
};
const edit = { ...JSON.parse(readFileSync(editPath, 'utf8')), meta };

const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error',
  '-i', video,
  '-f', 'image2pipe', '-framerate', String(meta.fps), '-i', '-',
  '-filter_complex', '[0:v][1:v]overlay=0:0:eof_action=pass:format=auto[v]',
  '-map', '[v]', '-map', '0:a?', '-c:a', 'copy',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
const done = new Promise((ok, fail) => ff.on('close', (c) => (c ? fail(new Error('ffmpeg exit ' + c)) : ok())));

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const tab = await browser.newPage({ viewport: { width: meta.width, height: meta.height } });
await tab.addInitScript((e) => { window.EDIT = e; }, edit);
const here = dirname(fileURLToPath(import.meta.url));
await tab.goto(pathToFileURL(resolve(here, '../template/overlay.html')).href);
await tab.evaluate(() => document.fonts.ready);

const total = Math.ceil(meta.duration * meta.fps);
for (let i = 0; i < total; i++) {
  await tab.evaluate((t) => window.seek(t), i / meta.fps);
  const png = await tab.screenshot({ omitBackground: true });
  if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once('drain', r));
  if (i % 150 === 0) process.stdout.write(`\r${i}/${total} khung`);
}
await browser.close();
ff.stdin.end();
await done;
console.log(`\rOK ${out} (${total} khung, ${meta.width}x${meta.height}@${meta.fps.toFixed(2)})`);
