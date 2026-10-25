/**
 * DRYFTQ Full-Stack End-to-End Verifier
 * --------------------------------------
 * Boots the real server, then for every route:
 *   1. Fetches the page and asserts HTTP 200
 *   2. Resolves every local href/src against the live URL and asserts 200
 *   3. Extracts every inline <script> and asserts it parses as valid JS
 *   4. Loads shared/dryftq-state.js in a sandboxed VM and asserts it
 *      initialises without throwing and exposes the expected API
 *   5. Asserts an unknown URL returns a branded 404 (not a redirect)
 *
 * Zero dependencies. Run:  node verify_all.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { spawn } = require('child_process');

const BASE_DIR = __dirname;
const PORT = process.env.PORT || 3000;
const ORIGIN = 'http://127.0.0.1:' + PORT;

const ROUTES = [
  { url: '/dashboard', label: 'Dashboard' },
  { url: '/analytics', label: 'Analytics' },
  { url: '/machines', label: 'Machines' },
  { url: '/alerts', label: 'Alerts' },
  { url: '/reports', label: 'Reports' },
  { url: '/maintenance', label: 'Maintenance' },
  { url: '/integrations', label: 'Integrations' },
  { url: '/team', label: 'Team Management' },
  { url: '/settings', label: 'Settings & Profile' }
];

const results = { pass: 0, fail: 0, rows: [] };

function record(ok, label, detail) {
  if (ok) results.pass++;
  else results.fail++;
  results.rows.push({ ok, label, detail: detail || '' });
  console.log(`[${ok ? 'PASS' : 'FAIL'}] ${label}${detail ? ' -- ' + detail : ''}`);
}

function get(urlPath) {
  return new Promise((resolve, reject) => {
    const req = http.get(ORIGIN + urlPath, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(new Error('timeout')); });
  });
}

// Pull every href="/src" out of an HTML document.
// Script and style bodies are stripped first: template literals inside them
// (href="${member.avatar}") are runtime values, not real references.
function extractRefs(html) {
  const stripped = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  const refs = [];
  const re = /(?:href|src)\s*=\s*["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(stripped)) !== null) refs.push(m[1]);
  return refs;
}

function isLocalRef(ref) {
  if (!ref) return false;
  if (ref.startsWith('#')) return false;
  if (/^(https?:)?\/\//i.test(ref)) return false;
  if (/^(mailto|tel|javascript|data|blob):/i.test(ref)) return false;
  return true;
}

// Extract inline script bodies (no src attribute)
function extractInlineScripts(html) {
  const out = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const attrs = m[1] || '';
    if (/\bsrc\s*=/i.test(attrs)) continue;
    const body = m[2];
    if (body && body.trim()) out.push(body);
  }
  return out;
}

function syntaxCheck(code, label) {
  try {
    new vm.Script(code, { filename: label });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// Build a minimal but realistic browser sandbox so the shared engine can boot
function buildSandbox(opts) {
  const o = opts || {};
  const storage = {};
  const listeners = {};
  // Optional pre-seeded localStorage, used to exercise state migration.
  if (o.seed) Object.keys(o.seed).forEach((k) => { storage[k] = o.seed[k]; });
  const loc = {
    href: o.href || ORIGIN + '/dashboard',
    pathname: o.pathname || '/dashboard',
    protocol: o.protocol || 'http:',
    search: o.search || ''
  };

  const classListStub = () => {
    const set = new Set();
    return {
      add: (...c) => c.forEach((x) => set.add(x)),
      remove: (...c) => c.forEach((x) => set.delete(x)),
      toggle: (c, f) => (f ? set.add(c) : set.delete(c)),
      contains: (c) => set.has(c),
      _set: set
    };
  };

  const makeEl = (tag) => ({
    tagName: (tag || 'div').toUpperCase(),
    style: {},
    dataset: {},
    children: [],
    classList: classListStub(),
    className: '',
    innerHTML: '',
    textContent: '',
    value: '',
    href: '',
    title: '',
    className_: '',
    appendChild(c) { this.children.push(c); return c; },
    removeChild(c) { return c; },
    remove() {},
    setAttribute() {},
    getAttribute() { return null; },
    removeAttribute() {},
    addEventListener(type, fn) { (listeners[type] = listeners[type] || []).push(fn); },
    removeEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    closest() { return null; },
    focus() {},
    click() {},
    submit() {},
    scrollIntoView() {},
    matches() { return false; }
  });

  const document = {
    body: makeEl('body'),
    documentElement: makeEl('html'),
    title: 'DRYFTQ',
    readyState: 'complete',
    createElement: makeEl,
    createTextNode: (t) => ({ nodeType: 3, textContent: t }),
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener(type, fn) { (listeners[type] = listeners[type] || []).push(fn); },
    removeEventListener() {},
    write() {},
    location: loc
  };

  const localStorage = {
    getItem: (k) => (Object.prototype.hasOwnProperty.call(storage, k) ? storage[k] : null),
    setItem: (k, v) => { storage[k] = String(v); },
    removeItem: (k) => { delete storage[k]; },
    clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); }
  };

  const windowObj = {
    document,
    localStorage,
    location: document.location,
    navigator: { userAgent: 'verify_all' },
    console,
    setTimeout: (fn) => 0,
    clearTimeout: () => {},
    setInterval: () => 0,
    clearInterval: () => {},
    addEventListener(type, fn) { (listeners[type] = listeners[type] || []).push(fn); },
    removeEventListener() {},
    requestAnimationFrame: (fn) => 0,
    matchMedia: () => ({ matches: false, addListener() {}, addEventListener() {} }),
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    fetch: () => Promise.reject(new Error('offline')),
    URL,
    URLSearchParams
  };
  windowObj.window = windowObj;
  windowObj.self = windowObj;
  document.defaultView = windowObj;

  return { windowObj, document, localStorage, storage };
}

function runStateEngine(opts) {
  const src = fs.readFileSync(path.join(BASE_DIR, 'shared', 'dryftq-state.js'), 'utf8');
  const { windowObj, storage } = buildSandbox(opts);
  const sandbox = Object.assign(Object.create(null), {
    window: windowObj,
    document: windowObj.document,
    localStorage: windowObj.localStorage,
    console,
    setTimeout: windowObj.setTimeout,
    clearTimeout: windowObj.clearTimeout,
    setInterval: windowObj.setInterval,
    clearInterval: windowObj.clearInterval,
    navigator: windowObj.navigator,
    location: windowObj.location,
    URL,
    URLSearchParams
  });
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  try {
    new vm.Script(src, { filename: 'dryftq-state.js' }).runInContext(sandbox);
  } catch (e) {
    return { ok: false, error: e.message };
  }
  const api = windowObj.Dryftq;
  if (!api) return { ok: false, error: 'window.Dryftq was not defined after evaluating dryftq-state.js' };
  const required = ['PAGES', 'getPageUrl', 'navigateTo', 'setupNavigation', 'renderSidebar', 'getState', 'saveState'];
  const missing = required.filter((k) => api[k] === undefined);
  if (missing.length) return { ok: false, error: 'Dryftq missing: ' + missing.join(', ') };
  return { ok: true, api, sandbox, windowObj, storage };
}

async function ensureServer() {
  try {
    const r = await get('/dashboard');
    if (r.status === 200) return { spawned: false, proc: null };
  } catch (e) { /* not up yet */ }

  console.log('Server not running - booting it for this verification pass...\n');
  const proc = spawn(process.execPath, ['server.js'], {
    cwd: BASE_DIR,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  proc.stdout.on('data', () => {});
  proc.stderr.on('data', () => {});

  // Wait for the listener to accept connections
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 250));
    try {
      const r = await get('/dashboard');
      if (r.status === 200) return { spawned: true, proc };
    } catch (e) { /* keep waiting */ }
  }
  proc.kill();
  return { spawned: true, proc: null, failed: true };
}

async function main() {
  console.log('=== DRYFTQ Full-Stack End-to-End Verification ===\n');

  // ---------- Phase 1: make sure a server is answering ----------
  const boot = await ensureServer();
  const alive = !boot.failed;
  record(alive, 'Server reachable on ' + ORIGIN, alive ? '' : 'start with: node server.js');
  if (!alive) {
    summary();
    process.exit(1);
  }
  const stopServer = () => { if (boot.proc) { try { boot.proc.kill(); } catch (e) { /* ignore */ } } };

  // ---------- Phase 2: shared engine boots cleanly ----------
  const engine = runStateEngine();
  record(engine.ok, 'shared/dryftq-state.js boots without throwing', engine.ok ? 'Dryftq API exposed' : engine.error);

  if (engine.ok) {
    // Every one of the 9 page keys must resolve to a real URL
    const keys = Object.keys(engine.api.PAGES);
    record(keys.length === 9, 'Dryftq.PAGES declares all 9 modules', `found ${keys.length}`);
    const bad = keys.filter((k) => {
      const u = engine.api.getPageUrl(k);
      return typeof u !== 'string' || !u.startsWith('/') || u === '#';
    });
    record(bad.length === 0, 'getPageUrl() returns a clean absolute path for every module',
      bad.length ? 'bad: ' + bad.join(', ') : keys.map((k) => engine.api.getPageUrl(k)).join(' '));

    // ---- file:// regression: pages opened straight from disk ----
    const fileEngine = runStateEngine({
      protocol: 'file:',
      pathname: '/C:/Users/adiba/Desktop/DRYFTQ ALL DASHBOARD/DRYFTQ DASHBOARD 1/code.html'
    });
    if (fileEngine.ok) {
      const a = fileEngine.api.getPageUrl('analytics');
      record(a === '../DRYFTQ DASHBOARD 2 (ANALYTICS)/code.html',
        'file:// inside a module folder resolves ../<folder>/code.html', a);

      const al = fileEngine.api.getPageUrl('alerts', { tab: 'critical' });
      record(al === '../DRYFTQ DASHOARD 4(ALERT)/code.html?tab=critical',
        'file:// keeps query strings intact', al);

      const fromRoot = runStateEngine({ protocol: 'file:', pathname: '/C:/x/DRYFTQ ALL DASHBOARD/index.html' });
      if (fromRoot.ok) {
        const d = fromRoot.api.getPageUrl('dashboard');
        record(d === './DRYFTQ DASHBOARD 1/code.html',
          'file:// at project root resolves ./<folder>/code.html', d);
      } else {
        record(false, 'file:// at project root resolves ./<folder>/code.html', fromRoot.error);
      }
    } else {
      record(false, 'file:// mode boots the shared engine', fileEngine.error);
    }
  }

  // ---------- Phase 3: routes, assets, inline JS per page ----------
  const seenAssets = new Map();

  for (const route of ROUTES) {
    let page;
    try {
      page = await get(route.url);
    } catch (e) {
      record(false, `${route.url} responds`, e.message);
      continue;
    }
    record(page.status === 200, `${route.label} (${route.url}) returns 200`, 'status ' + page.status);
    if (page.status !== 200) continue;

    const html = page.body;
    record(/<html/i.test(html) && /<\/html>/i.test(html), `${route.label}: complete HTML document`);

    // Navigation may be authored statically (7 pages) or painted by
    // Dryftq.renderSidebar() into #dryftq-sidebar-container (Team, Settings).
    const hasStaticNav = /<nav[\s\S]*?<\/nav>/i.test(html);
    const hasSidebarHost = /id=["']dryftq-sidebar-container["']/.test(html);
    record(hasStaticNav || hasSidebarHost,
      `${route.label}: contains navigation markup`,
      hasStaticNav ? 'static <nav>' : hasSidebarHost ? 'JS-hosted container' : 'none found');

    // Resolve every local reference against the live URL
    const refs = [...new Set(extractRefs(html).filter(isLocalRef))];
    const broken = [];
    for (const ref of refs) {
      let resolved;
      try {
        resolved = new URL(ref, ORIGIN + route.url).pathname;
      } catch (e) {
        broken.push(ref + ' (unresolvable)');
        continue;
      }
      if (seenAssets.has(resolved)) {
        if (seenAssets.get(resolved) !== 200) broken.push(ref + ' -> ' + resolved);
        continue;
      }
      let st;
      try {
        const a = await get(resolved);
        st = a.status;
      } catch (e) {
        st = 0;
      }
      seenAssets.set(resolved, st);
      if (st !== 200) broken.push(`${ref} -> ${resolved} (${st})`);
    }
    record(broken.length === 0, `${route.label}: all ${refs.length} local href/src resolve`,
      broken.slice(0, 6).join('; '));

    // Inline scripts must parse
    const scripts = extractInlineScripts(html);
    const scriptErrors = [];
    scripts.forEach((code, i) => {
      const r = syntaxCheck(code, `${route.url}#inline-${i + 1}`);
      if (!r.ok) scriptErrors.push(`script #${i + 1}: ${r.error}`);
    });
    record(scriptErrors.length === 0,
      `${route.label}: ${scripts.length} inline script(s) parse cleanly`,
      scriptErrors.slice(0, 4).join('; '));

    // The page must boot the shared engine with the correct page key
    const key = route.url.slice(1);
    const boots =
      new RegExp(`setupNavigation\\(\\s*['"]${key}['"]`).test(html) ||
      new RegExp(`renderSidebar\\(\\s*['"]${key}['"]`).test(html) ||
      new RegExp(`init(?:Team|Settings)Page`).test(html);
    record(boots, `${route.label}: initialises its own page key ('${key}')`);
  }

  // ---------- Phase 4: root + index ----------
  try {
    const root = await get('/');
    record(root.status === 200 && /DRYFTQ/i.test(root.body), 'Root (/) serves the Dashboard 200');
  } catch (e) {
    record(false, 'Root (/) serves the Dashboard 200', e.message);
  }

  // ---------- Phase 5: 404 contract ----------
  let nf;
  try {
    nf = await get('/this-route-does-not-exist');
  } catch (e) {
    nf = null;
  }
  if (nf) {
    record(nf.status === 404, 'Unknown URL returns real 404 status (not a redirect)',
      'status ' + nf.status + (nf.headers.location ? ' -> location ' + nf.headers.location : ''));
    record(/404/.test(nf.body) && /Return to Dashboard/i.test(nf.body),
      '404 page is branded with a working Return to Dashboard control');
    record(/DRYFTQ/i.test(nf.body), '404 page carries DRYFTQ branding');
  } else {
    record(false, 'Unknown URL returns real 404 status', 'no response');
  }

  // Case-variant deep links must still resolve
  for (const variant of ['/Dashboard', '/Analytics', '/SETTINGS']) {
    try {
      const r = await get(variant);
      record(r.status === 200, `Case-insensitive route ${variant} resolves 200`, 'status ' + r.status);
    } catch (e) {
      record(false, `Case-insensitive route ${variant} resolves 200`, e.message);
    }
  }

  // ---------- Phase 6: profile identity (name + picture) ----------
  const STORE_KEY = 'dryftq_plant_operations_v2';

  try {
    const img = await get('/mine.jpg');
    const ct = String(img.headers['content-type'] || '');
    record(img.status === 200 && /^image\/jpeg/.test(ct),
      '/mine.jpg is served as an image', `status ${img.status}, content-type ${ct}`);
  } catch (e) {
    record(false, '/mine.jpg is served as an image', e.message);
  }

  try {
    const sp = await get('/settings');
    record(/src="\/mine\.jpg"/.test(sp.body),
      'Settings profile picture points at /mine.jpg',
      /src="\/mine\.jpg"/.test(sp.body) ? '' : 'no /mine.jpg img src found');
    record(!/lh3\.googleusercontent\.com/.test(sp.body),
      'Settings no longer references the stock Google avatar');
  } catch (e) {
    record(false, 'Settings profile picture points at /mine.jpg', e.message);
  }

  if (engine.ok) {
    const st = engine.api.getState();
    record(!!st.user && st.user.name === 'Adiba Kamil',
      'Fresh state reports name "Adiba Kamil"', st.user && st.user.name);
    record(!!st.user && st.user.avatar === '/mine.jpg',
      'Fresh state reports avatar /mine.jpg', st.user && st.user.avatar);
  }

  // State saved by earlier versions still holds the old identity - it has to
  // migrate forward on read, otherwise the change never appears.
  const LEGACY_AVATAR = 'https://lh3.googleusercontent.com/aida-public/LEGACYSEED';
  const migrated = runStateEngine({
    seed: { [STORE_KEY]: JSON.stringify({ user: { name: 'Aditya Kamil', avatar: LEGACY_AVATAR } }) }
  });
  if (migrated.ok) {
    const st = migrated.api.getState();
    record(st.user.name === 'Adiba Kamil',
      'Legacy saved name migrates to "Adiba Kamil"', st.user.name);
    record(st.user.avatar === '/mine.jpg',
      'Legacy saved avatar migrates to /mine.jpg', st.user.avatar);
  } else {
    record(false, 'Legacy saved name migrates to "Adiba Kamil"', migrated.error);
  }

  // The migration must never clobber a profile the operator edited.
  const custom = runStateEngine({
    seed: { [STORE_KEY]: JSON.stringify({ user: { name: 'Priya Sharma', avatar: '/custom.jpg' } }) }
  });
  if (custom.ok) {
    const st = custom.api.getState();
    record(st.user.name === 'Priya Sharma', 'Custom operator name is preserved', st.user.name);
    record(st.user.avatar === '/custom.jpg', 'Custom operator picture is preserved', st.user.avatar);
  } else {
    record(false, 'Custom operator name is preserved', custom.error);
  }

  // file:// must rebase the picture, and must not persist that rebase.
  const fileMode = runStateEngine({
    protocol: 'file:',
    pathname: '/C:/x/DRYFTQ ALL DASHBOARD/DRYFTQ DASHBOARD 9(SETTING)/code.html'
  });
  if (fileMode.ok) {
    const st = fileMode.api.getState();
    record(st.user.avatar === '../mine.jpg',
      'file:// rebases profile picture to ../mine.jpg', st.user.avatar);

    fileMode.api.saveState(st);
    let stored = null;
    try { stored = JSON.parse(fileMode.storage[STORE_KEY]); } catch (e) { /* ignore */ }
    record(!!stored && !!stored.user && stored.user.avatar === '/mine.jpg',
      'saveState stores canonical /mine.jpg (never the ../ rebase)',
      stored && stored.user ? stored.user.avatar : 'nothing stored');
  } else {
    record(false, 'file:// rebases profile picture to ../mine.jpg', fileMode.error);
  }

  summary();
  stopServer();
  process.exit(results.fail > 0 ? 1 : 0);
}

function summary() {
  console.log('\n======================================================');
  console.log(`TOTAL: ${results.pass + results.fail} | PASSED: ${results.pass} | FAILED: ${results.fail}`);
  console.log('======================================================');
  if (results.fail > 0) {
    console.log('\nFailures:');
    results.rows.filter((r) => !r.ok).forEach((r) => console.log(`  - ${r.label} :: ${r.detail}`));
  }
}

main().catch((e) => {
  console.error('Verifier crashed:', e);
  process.exit(1);
});
