/**
 * DRYFTQ Plant Operations Platform - Local Development & Production Server
 * Zero-dependency Node.js HTTP Server with route aliasing and static asset serving
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const BASE_DIR = __dirname;

// Centralized route configuration (single source of truth)
const { ROUTES, PAGE_TO_URL, CLEAN_ROUTES, getRouteInfo, isAppRoute } = require('./shared/dryftq-routes');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.csv': 'text/csv; charset=utf-8'
};

// Branded 404 page HTML
const NOT_FOUND_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <title>404 - Page Not Found | DRYFTQ</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #031B30; color: #FFFFFF; }
  </style>
</head>
<body class="min-h-screen flex items-center justify-center p-6">
  <div class="max-w-md w-full text-center">
    <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FF3D0A] shadow-lg shadow-orange-500/30 mb-6">
      <span class="text-3xl font-black tracking-wider text-white">D</span>
    </div>
    <h1 class="text-3xl font-extrabold tracking-tight text-white mb-2">DRYFTQ Industrial OS</h1>
    <p class="text-slate-400 text-sm mb-8">AI-Powered Industrial Telemetry & Plant Operations</p>

    <div class="bg-[#07243E] border border-[#0d3459] rounded-2xl p-8 text-left shadow-2xl">
      <div class="flex items-start gap-3 mb-6">
        <div class="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M60 12a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            <path d="M12 22v-6M12 6v6M12 6v6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
        </div>
        <div>
          <h2 class="text-xl font-bold text-white">404 - Page Not Found</h2>
          <p class="text-slate-400 text-sm mt-1">The page you requested does not exist.</p>
        </div>
      </div>

      <div class="pt-4 border-t border-[#0d3459]">
        <button id="returnToDashboard" class="w-full inline-flex items-center justify-center gap-2 bg-[#FF3D0A] hover:bg-[#e03405] text-white px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-orange-500/20 transition-all cursor-pointer">
          <span>Return to Dashboard</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        </button>
      </div>

      <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        ${CLEAN_ROUTES.filter(r => r !== '/').map(r => `
          <a href="${r}" class="flex items-center gap-2 p-3 rounded-xl bg-[#031B30]/60 hover:bg-[#FF3D0A]/10 hover:text-white transition-all border border-white/5 text-sm">
            <span class="text-base">\u25B8</span>
            <span class="font-medium text-slate-200 group-hover:text-white">${getRouteInfo(r).title}</span>
          </a>
        `).join('')}
      </div>
    </div>
  </div>

  <script>
    document.getElementById('returnToDashboard').addEventListener('click', () => {
      window.location.replace('/dashboard');
    });
  </script>
</body>
</html>
`;

const server = http.createServer((req, res) => {
  // WHATWG URL (replaces the deprecated url.parse())
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('400 Bad Request');
    return;
  }

  // Normalize trailing slashes
  const cleanRoute = pathname.replace(/\/+$/, '') || '/';

  // index.html is the landing page's entry point into the platform. Forward it
  // to the primary dashboard so visitors keep the clean route (the page itself
  // falls back to real module folders when it is opened on a plain static host).
  if (cleanRoute.toLowerCase() === '/index.html') {
    res.writeHead(302, {
      Location: '/dashboard',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    res.end();
    return;
  }

  // Case-insensitive route lookup
  const routeInfo = getRouteInfo(cleanRoute);

  if (routeInfo) {
    pathname = routeInfo.file;
  }

  let filePath = path.join(BASE_DIR, pathname);

  // Prevent directory traversal
  if (!filePath.startsWith(BASE_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      // Serve branded 404 for unknown URLs
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(NOT_FOUND_HTML);
      return;
    }

    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'code.html');
      if (!fs.existsSync(filePath)) {
        filePath = path.join(filePath, '..', 'index.html');
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Server Error');
        return;
      }

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });
      res.end(content);
    });
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('\n  [DRYFTQ] Port ' + PORT + ' is already in use.');
    console.error('  Another DRYFTQ server is probably still running.');
    console.error('  Stop it, or start this one on a free port:');
    console.error('      set PORT=3001 && node server.js\n');
  } else {
    console.error('\n  [DRYFTQ] Server failed to start:', err.message, '\n');
  }
  process.exit(1);
});

server.listen(PORT, () => {
  const pad = (s, n) => String(s).padEnd(n, ' ');
  console.log('=========================================================');
  console.log('   DRYFTQ Industrial OS - All 9 Modules Running');
  console.log('   Server listening at: http://localhost:' + PORT);
  console.log('=========================================================');
  console.log('   Routes:');
  CLEAN_ROUTES.forEach((r) => {
    const info = getRouteInfo(r);
    console.log('   * ' + pad(info.title, 18) + ' http://localhost:' + PORT + r);
  });
  console.log('=========================================================');
  console.log('   Press Ctrl+C to stop the server.');
  console.log('=========================================================');
});
