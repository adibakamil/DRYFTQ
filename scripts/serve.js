#!/usr/bin/env node
/**
 * Zero-dependency static server for the *built* DRYFTQ app (dist/).
 *
 *   npm run build            # produce dist/
 *   node scripts/serve.js    # http://localhost:8080
 *   PORT=9000 node scripts/serve.js
 *
 * Unknown paths fall back to dist/index.html so client-side routes
 * (/dashboard, /analytics, …) work on a plain static host — the same
 * behaviour the old `python -m http.server` could not provide.
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT) || 8080;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.csv': 'text/csv; charset=utf-8',
};

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('  dist/index.html not found. Run `npm run build` first.');
  process.exit(1);
}

const send = (res, status, body, type) => {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
  res.end(body);
};

http
  .createServer((req, res) => {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    } catch {
      return send(res, 400, '400 Bad Request', 'text/plain; charset=utf-8');
    }

    let file = path.join(DIST, pathname);
    if (file !== DIST && !file.startsWith(DIST + path.sep)) {
      return send(res, 403, '403 Forbidden', 'text/plain; charset=utf-8');
    }

    let stat = null;
    try {
      stat = fs.statSync(file);
    } catch {
      stat = null;
    }
    if (stat?.isDirectory()) file = path.join(file, 'index.html');
    if (!stat || !fs.existsSync(file)) file = path.join(DIST, 'index.html'); // SPA fallback

    fs.readFile(file, (readErr, body) => {
      if (readErr) return send(res, 404, '404 Not Found', 'text/plain; charset=utf-8');
      send(res, 200, body, TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream');
    });
  })
  .on('error', (e) => {
    console.error(e.code === 'EADDRINUSE' ? `Port ${PORT} is in use. Try: PORT=${PORT + 1} node scripts/serve.js` : e.message);
    process.exit(1);
  })
  .listen(PORT, () => console.log(`DRYFTQ (built app): http://localhost:${PORT}`));
