// Render mot trang canh theo hop dong window.seek(t) + window.MOTION thanh MP4.
// node scripts/render-mini.mjs <scene.html> <out.mp4> [--size 1080x1920] [--audio nhac.mp3] [--contact]
import { chromium } from 'playwright';
import { mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); return i < 0 ? undefined : args[i + 1] ?? true; };
const [scene, out] = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.match(/^--(size|audio)$/));
if (!scene || !out) {
  console.error('Usage: node scripts/render-mini.mjs <scene.html> <out.mp4> [--size WxH] [--audio file] [--contact]');
  process.exit(1);
}

const url = pathToFileURL(resolve(scene));
const size = flag('--size');
if (size) { const [w, h] = size.split('x'); url.searchParams.set('w', w); url.searchParams.set('h', h); }

const frames = resolve(dirname(resolve(out)), 'frames');
rmSync(frames, { recursive: true, force: true });
mkdirSync(frames, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH }); // CHROME_PATH: tuy chon, khi da co san Chrome
const tab = await browser.newPage();
await tab.goto(url.href);
await tab.evaluate(() => document.fonts.ready); // cho font nap xong moi chup
const M = await tab.evaluate(() => window.MOTION);
if (!M || (await tab.evaluate(() => typeof window.seek)) !== 'function') throw new Error('Trang thieu window.MOTION / window.seek');
await tab.setViewportSize({ width: M.width, height: M.height });

const total = Math.round(M.fps * M.duration);
for (let i = 0; i < total; i++) {
  await tab.evaluate((t) => window.seek(t), i / M.fps);
  await tab.screenshot({ path: `${frames}/${String(i).padStart(5, '0')}.png` });
}
await browser.close();

const ff = (...a) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...a], { stdio: 'inherit' });
const audio = flag('--audio');
ff('-framerate', String(M.fps), '-i', `${frames}/%05d.png`,
  ...(audio ? ['-i', audio, '-c:a', 'aac', '-b:a', '192k', '-shortest'] : []),
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-movflags', '+faststart', out);

// Contact sheet: moi giay mot khung, de Claude tu nhin va cham diem
if (flag('--contact')) {
  const cols = 5, rows = Math.ceil(M.duration / cols);
  ff('-i', out, '-vf', `fps=1,scale=360:-1,tile=${cols}x${rows}`, '-frames:v', '1', out.replace(/\.mp4$/, '-contact.png'));
}
console.log(`OK ${out} (${total} khung, ${M.width}x${M.height}@${M.fps})`);
