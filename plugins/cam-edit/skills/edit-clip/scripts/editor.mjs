// Editor tren trinh duyet: xem video + lop phu truc tiep, sua phu de/the, luu edit.json va render, khong ton token.
// node editor.mjs <video> <edit.json> [port=4321]
import { createServer } from 'node:http';
import { createReadStream, readFileSync, writeFileSync, statSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const [video, editPath, port = 4321] = process.argv.slice(2);
if (!video || !editPath) {
  console.error('Usage: node editor.mjs <video> <edit.json> [port]');
  process.exit(1);
}
const here = dirname(fileURLToPath(import.meta.url));
const tpl = resolve(here, '../template');
const out = editPath.replace(/\.json$/, '') + '-final.mp4';
let job = { state: 'idle', log: '' };

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.mp4': 'video/mp4' };
const sendFile = (req, res, file) => {
  const size = statSync(file).size;
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.range || ''); // video can tua (Range)
  const type = TYPES[extname(file)] || 'application/octet-stream';
  if (!m) { res.writeHead(200, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes' }); return createReadStream(file).pipe(res); }
  const start = Number(m[1] || 0), end = m[2] ? Number(m[2]) : size - 1;
  res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1, 'Accept-Ranges': 'bytes' });
  createReadStream(file, { start, end }).pipe(res);
};
const body = (req) => new Promise((ok) => { let s = ''; req.on('data', (d) => (s += d)); req.on('end', () => ok(s)); });

createServer(async (req, res) => {
  const url = req.url.split('?')[0];
  if (url === '/') return sendFile(req, res, resolve(tpl, 'editor.html'));
  if (url === '/overlay.js') return sendFile(req, res, resolve(tpl, 'overlay.js'));
  if (url === '/video') return sendFile(req, res, video);
  if (url === '/result') return sendFile(req, res, out);
  if (url === '/edit.json' && req.method === 'GET') return sendFile(req, res, editPath);
  if (url === '/edit.json' && req.method === 'POST') {
    const text = await body(req);
    try { JSON.parse(text); } catch { res.writeHead(400); return res.end('JSON khong hop le'); }
    writeFileSync(editPath, text);
    return res.end('ok');
  }
  if (url === '/render' && req.method === 'POST') {
    if (job.state === 'running') return res.end(JSON.stringify(job));
    job = { state: 'running', log: '' };
    const p = spawn(process.execPath, [resolve(here, 'render-edit.mjs'), video, editPath, out], { env: process.env });
    p.stdout.on('data', (d) => (job.log = String(d).trim().split('\r').pop()));
    p.stderr.on('data', (d) => (job.log += String(d)));
    p.on('close', (c) => (job.state = c ? 'error' : 'done'));
    return res.end(JSON.stringify(job));
  }
  if (url === '/render') return res.end(JSON.stringify(job));
  res.writeHead(404); res.end();
}).listen(port, '127.0.0.1', () => console.log(`Editor: http://localhost:${port}  (ket qua: ${out})`));
