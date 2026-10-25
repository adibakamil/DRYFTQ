/**
 * DRYFTQ rendering + interaction audit (headless Chrome via CDP).
 * Run with the local server up:  node tests/audit.mjs [baseURL]
 * Produces tests/audit-report.json and screenshots in tests/artifacts/.
 */
import { spawn } from 'node:child_process';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = process.argv[2] || 'http://127.0.0.1:8080/';
const PORT = 9333;
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ART = new URL('./artifacts/', import.meta.url);
const WIDTHS = [
  [1920, 1080], [1440, 900], [1366, 768], [1280, 800], [1024, 768],
  [768, 1024], [430, 932], [390, 844], [360, 800],
];

await mkdir(ART, { recursive: true });
const profile = join(tmpdir(), `dryftq-audit-${Date.now()}`);
const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
  '--no-default-browser-check', `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`, 'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitJson(url, tries = 60) {
  for (let i = 0; i < tries; i++) {
    try { const r = await fetch(url); if (r.ok) return r.json(); } catch {}
    await sleep(250);
  }
  throw new Error('Chrome CDP endpoint did not start');
}
await waitJson(`http://127.0.0.1:${PORT}/json/version`);
const target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(BASE)}`, { method: 'PUT' })).json();

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let seq = 0; const pending = new Map(); const events = [];
const errors = [];
ws.onmessage = (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && pending.has(msg.id)) {
    const { res, rej } = pending.get(msg.id); pending.delete(msg.id);
    msg.error ? rej(new Error(msg.error.message)) : res(msg.result);
  } else if (msg.method) {
    events.push(msg);
    if (msg.method === 'Runtime.exceptionThrown') errors.push('exception: ' + (msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text));
    if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') errors.push('log: ' + msg.params.entry.text);
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') errors.push('console: ' + msg.params.args.map(a => a.value ?? a.description).join(' '));
  }
};
const send = (method, params = {}) => new Promise((res, rej) => {
  const id = ++seq; pending.set(id, { res, rej });
  ws.send(JSON.stringify({ id, method, params }));
});
const evaluate = async (expression, awaitPromise = false) => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise, returnByValue: true, userGesture: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
};

await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable');

const settle = async () => {
  await evaluate('document.fonts.ready.then(() => true)', true);
  await sleep(900);
};

async function loadAt(w, h, opts = {}) {
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 768 });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: opts.reduceMotion ? 'reduce' : 'no-preference' }] });
  errors.length = 0;
  await send('Page.navigate', { url: BASE });
  await sleep(400);
  await settle();
}

/* Scroll the whole page once so IntersectionObserver reveals fire, then return to top. */
async function scrollThrough() {
  await evaluate(`(async () => {
    const prev = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    const step = Math.max(280, innerHeight * 0.75);
    for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
      scrollTo(0, y); await new Promise(r => setTimeout(r, 70));
    }
    scrollTo(0, 0); await new Promise(r => setTimeout(r, 400));
    document.documentElement.style.scrollBehavior = prev;
    return true;
  })()`, true);
  await sleep(400);
}

const METRICS = `(() => {
  const R = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
  const cs = (el, p) => el ? getComputedStyle(el)[p] : null;
  const clippedByScroller = (el) => {
    for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
      const ox = getComputedStyle(n).overflowX;
      if (ox === 'auto' || ox === 'scroll' || ox === 'hidden' || ox === 'clip') return true;
    }
    return false;
  };
  const inViewportBadges = [];
  document.querySelectorAll('body *').forEach((el) => {
    if (el.closest('svg[width="0"], .modal, #mobileMenu') || el.closest('[aria-hidden="true"]')) return;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    if ((r.right > innerWidth + 1.5 || r.left < -1.5) && !clippedByScroller(el)) inViewportBadges.push({ tag: el.tagName.toLowerCase(), cls: String(el.className).slice(0, 70), x: Math.round(r.left), right: Math.round(r.right) });
  });
  const uniq = [...new Map(inViewportBadges.map(b => [b.tag + b.cls, b])).values()].slice(0, 8);
  const header = document.querySelector('header');
  const navLinks = [...document.querySelectorAll('#primaryNav a')].map(a => ({ text: a.textContent.trim(), ...R(a) }));
  const imgs = [...document.images].map(i => ({ src: i.getAttribute('src'), ok: i.complete && i.naturalWidth > 0, nw: i.naturalWidth, nh: i.naturalHeight, ...R(i) }));
  const heroGrid = document.querySelector('.hero-grid');
  const hero = document.getElementById('hero');
  const art = document.querySelector('.hero-art');
  const copy = document.querySelector('.hero-copy');
  const wordmark = document.querySelector('.hero-wordmark');
  const title = document.getElementById('hero-title');
  const lead = hero.querySelector('p.lead');
  const actions = hero.querySelector('.hero-actions');
  return {
    vw: innerWidth, vh: innerHeight,
    docW: document.documentElement.scrollWidth, docH: document.documentElement.scrollHeight,
    overflowX: document.documentElement.scrollWidth > innerWidth,
    horizontalEscapees: uniq,
    headerH: R(header).h, headerPos: cs(header, 'position'),
    navLinks, navHidden: cs(document.querySelector('#primaryNav').parentElement, 'display') === 'none',
    mobileToggleVisible: R(document.getElementById('mobileMenuToggle')).w > 0,
    hero: { h: R(hero).h, gridMinH: cs(heroGrid, 'minHeight'), cols: cs(heroGrid, 'gridTemplateColumns'), art: R(art), copy: R(copy), wordmark: R(wordmark), title: R(title), lead: R(lead), actions: R(actions) },
    copyLeftOfArt: copy && art ? R(art).x < R(copy).x : null,
    stacked: copy && art ? Math.abs(R(copy).y - R(art).y) > 50 : null,
    gaps: {
      wordmarkToTitle: title && wordmark ? R(title).y - (R(wordmark).y + R(wordmark).h) : null,
      titleToLead: lead && title ? R(lead).y - (R(title).y + R(title).h) : null,
      leadToActions: actions && lead ? R(actions).y - (R(lead).y + R(lead).h) : null
    },
    titleFont: cs(title, 'fontSize'), titleText: title.textContent.replace(/\\s+/g, ' ').trim(),
    titleAriaHiddenHash: !!title.querySelector('span[aria-hidden="true"]'),
    wordmarkW: R(wordmark).w,
    imgs,
    buttons: [...document.querySelectorAll('.btn')].map(b => ({ text: b.textContent.trim().slice(0, 24), w: R(b).w, h: R(b).h })),
    reveals: [...document.querySelectorAll('.reveal')].map(el => ({ cls: el.className.slice(0, 60), opacity: cs(el, 'opacity'), visible: el.classList.contains('visible') })),
    h1Count: document.querySelectorAll('h1').length,
    headingOrder: [...document.querySelectorAll('h1,h2,h3')].map(h => h.tagName).join(','),
    labelAssoc: [...document.querySelectorAll('form input, form select')].map(i => ({ id: i.id, ok: !!document.querySelector('label[for="' + i.id + '"]') })),
    aria: {
      modalLabelledbyOk: [...document.querySelectorAll('.modal')].every(m => !!document.getElementById(m.getAttribute('aria-labelledby'))),
      toggleControls: document.getElementById('mobileMenuToggle').getAttribute('aria-controls'),
      toggleExpanded: document.getElementById('mobileMenuToggle').getAttribute('aria-expanded'),
      dupeCurrent: [...document.querySelectorAll('[aria-current="true"]')].length,
      btnsWithoutName: [...document.querySelectorAll('button')].filter(b => !b.textContent.trim() && !b.getAttribute('aria-label')).length
    },
    focusables: [...document.querySelectorAll('a[href],button:not([disabled]),input,select,textarea')].filter(el => el.offsetParent !== null).length,
    bodyScrollLocked: getComputedStyle(document.body).overflow,
    canvas: (() => { const c = document.getElementById('quantumWaveCanvas'); return c ? { w: c.width, h: c.height, cssW: R(c).w } : null; })()
  };
})()`;

const CONTRAST = `(() => {
  const lum = (c) => { const [r, g, b] = c.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * r + .7152 * g + .0722 * b; };
  const parse = (s) => (s.match(/[\\d.]+/g) || []).slice(0, 3).map(Number);
  const bgOf = (el) => { let n = el; while (n) { const c = parse(getComputedStyle(n).backgroundColor); const a = getComputedStyle(n).backgroundColor.match(/rgba?\\([^)]*,\\s*([\\d.]+)\\)/); if (c.length === 3 && (!a || Number(a[1]) > 0.5)) return c; n = n.parentElement; } return [255, 255, 255]; };
  const ratio = (a, b) => { const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x); return (l1 + .05) / (l2 + .05); };
  const pick = (sel, label) => { const el = document.querySelector(sel); if (!el) return null; const st = getComputedStyle(el); const fg = parse(st.color), bg = bgOf(el); return { label, fg: st.color, bg: 'rgb(' + bg.join(', ') + ')', size: st.fontSize, weight: st.fontWeight, ratio: Math.round(ratio(fg, bg) * 100) / 100 }; };
  return [
    pick('.hero-title', 'hero title'), pick('.hero-copy .lead', 'hero lead'),
    pick('.btn-primary', 'primary button'), pick('.btn-outline', 'outline button'),
    pick('#primaryNav a', 'nav link'), pick('.strip-item', 'industry item'),
    pick('#services .lead', 'section lead'), pick('.card p', 'card body'),
    pick('.foot-link', 'footer link'), pick('.step p', 'dark step body'),
    pick('.step-icon', 'step icon'), pick('.icon-badge', 'icon badge'),
    pick('.text-brand-action', 'brand-action text'), pick('#cta-h', 'CTA heading')
  ].filter(Boolean);
})()`;

const report = { base: BASE, generatedAt: new Date().toISOString(), viewports: [], a11y: {}, interactions: {}, reducedMotion: null, consoleErrors: [] };

for (const [w, h] of WIDTHS) {
  await loadAt(w, h);
  await scrollThrough();
  const m = await evaluate(METRICS);
  if (w === 1440) report.contrast = await evaluate(CONTRAST);
  if (w === 390) report.a11y = await evaluate(`(() => ({
    h1Count: ${'document.querySelectorAll("h1").length'},
    labelAssoc: [...document.querySelectorAll('form input, form select')].map(i => ({ id: i.id, ok: !!document.querySelector('label[for="' + i.id + '"]') })),
    modalLabelledbyOk: [...document.querySelectorAll('.modal')].every(m => !!document.getElementById(m.getAttribute('aria-labelledby'))),
    btnsWithoutName: [...document.querySelectorAll('button')].filter(b => !b.textContent.trim() && !b.getAttribute('aria-label')).length,
    imgsWithoutAlt: [...document.querySelectorAll('img')].filter(i => !i.hasAttribute('alt')).length,
    skipLink: !!document.querySelector('a[href="#main"]'),
    mainId: !!document.getElementById('main'),
    toggle: { controls: document.getElementById('mobileMenuToggle').getAttribute('aria-controls'), expanded: document.getElementById('mobileMenuToggle').getAttribute('aria-expanded') }
  }))()`);
  const shot = await send('Page.getLayoutMetrics');
  const fullH = Math.min(Math.ceil(shot.cssContentSize.height), 16000);
  const png = await send('Page.captureScreenshot', { format: 'webp', quality: 82, captureBeyondViewport: true, clip: { x: 0, y: 0, width: w, height: fullH, scale: 1 } });
  await writeFile(new URL(`${w}.webp`, ART), Buffer.from(png.data, 'base64'));
  report.viewports.push({ width: w, height: h, ...m });
  report.consoleErrors.push({ width: w, errors: [...errors] });
  console.log(`✓ ${w}×${h}  overflowX=${m.overflowX}  hero=${m.hero.h}px  cols=${m.hero.cols}`);
}

/* ---------- Interactions (desktop) ---------- */
await loadAt(1440, 900);
const step = async (expr, wait = 350) => { await evaluate(expr); await sleep(wait); };
const desktop = {};
desktop.menuHiddenDesktop = await evaluate(`getComputedStyle(document.getElementById('mobileMenu')).display === 'none'`);
await step(`document.getElementById('navGetStartedBtn').click()`);
desktop.contactModal = await evaluate(`(() => { const m = document.getElementById('contactModal'); return { open: m.classList.contains('is-open'), ariaHidden: m.getAttribute('aria-hidden'), focusInside: m.contains(document.activeElement), bodyOverflow: document.body.style.overflow }; })()`);
await step(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
desktop.contactModalClosedByEscape = await evaluate(`(() => { const m = document.getElementById('contactModal'); return { open: m.classList.contains('is-open'), focusRestored: document.activeElement === document.getElementById('navGetStartedBtn') }; })()`);
await step(`document.getElementById('heroWatchDemoBtn').click()`);
desktop.videoModalOpen = await evaluate(`document.getElementById('videoModal').classList.contains('is-open')`);
await step(`document.querySelector('#videoModal .modal-close').click()`);
desktop.videoModalClosed = await evaluate(`!document.getElementById('videoModal').classList.contains('is-open')`);
await step(`document.getElementById('navLoginBtn').click()`);
desktop.loginModalOpen = await evaluate(`document.getElementById('loginModal').classList.contains('is-open')`);
await step(`(() => { document.getElementById('loginEmail').value='operator@enterprise.com'; document.getElementById('loginPw').value='Secret123!'; document.getElementById('loginForm').requestSubmit(); })()`);
desktop.loginFormStatus = await evaluate(`(() => { const s = document.querySelector('#loginForm [data-status]'); return { visible: !s.classList.contains('hidden'), text: s.textContent }; })()`);
await step(`document.querySelector('#loginModal .modal-close').click()`);
await step(`document.querySelector('[data-tab="machines"]').click()`);
desktop.dashboardTab = await evaluate(`(() => ({ title: document.getElementById('currentViewTitle').textContent, pressed: document.querySelector('[data-tab="machines"]').getAttribute('aria-pressed'), othersOff: [...document.querySelectorAll('.tab-btn')].filter(b => b.getAttribute('aria-pressed') === 'true').length === 1 }))()`);
await step(`document.getElementById('ctaTalkTeamBtn').click()`);
desktop.ctaModalOpen = await evaluate(`document.getElementById('contactModal').classList.contains('is-open')`);
await step(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);

/* Explore Platform is the bridge from the landing page into the dashboard
   platform: it must be a real link into "DRYFTQ ALL DASHBOARD" and, when
   clicked, land the visitor on a dashboard module (never a 404). */
desktop.exploreIsLink = await evaluate(`(() => { const a = document.getElementById('heroExploreBtn'); const raw = a.getAttribute('href') || ''; let decoded = raw; try { decoded = decodeURIComponent(raw); } catch (e) {} return { tag: a.tagName.toLowerCase(), href: decoded, opensDashboardFolder: /DRYFTQ ALL DASHBOARD/i.test(decoded) }; })()`);
await step(`document.getElementById('heroExploreBtn').click()`, 0);
{
  // Landing -> "DRYFTQ ALL DASHBOARD/index.html" -> a real dashboard module.
  // Keep polling until the URL settles on a module (the entry page is a hop,
  // not the destination), or until we run out of patience.
  let last = '';
  let settledOn = null;
  for (let i = 0; i < 40; i++) {
    await sleep(250);
    let u = null;
    try {
      u = await evaluate(`(() => { let u = location.href; try { u = decodeURIComponent(u); } catch (e) {} return /DRYFTQ ALL DASHBOARD/i.test(u) ? u : null; })()`);
    } catch (e) { /* navigation in flight - context may be torn down */ }
    if (u) last = u;
    if (u && /(code\.html|\/dashboard\/?$)/i.test(u)) { settledOn = u; break; }
  }
  desktop.exploreNavigation = { url: last || 'unknown', landedOnDashboard: !!settledOn };
}
report.interactions.desktop = desktop;

/* ---------- Interactions (mobile) ---------- */
await loadAt(390, 844);
const mobile = {};
mobile.toggleVisible = await evaluate(`document.getElementById('mobileMenuToggle').getBoundingClientRect().width > 0`);
await step(`document.getElementById('mobileMenuToggle').click()`);
mobile.menuOpen = await evaluate(`(() => { const m = document.getElementById('mobileMenu'), t = document.getElementById('mobileMenuToggle'); return { visible: getComputedStyle(m).display !== 'none', expanded: t.getAttribute('aria-expanded'), label: t.getAttribute('aria-label'), icon: document.querySelector('#menuIcon use').getAttribute('href') }; })()`);
await step(`document.querySelector('#mobileMenu a[href="#about"]').click()`, 1800);
mobile.menuClosedOnLink = await evaluate(`(() => { const m = document.getElementById('mobileMenu'), t = document.getElementById('mobileMenuToggle'); const r = document.getElementById('about').getBoundingClientRect(); return { hidden: getComputedStyle(m).display === 'none', expanded: t.getAttribute('aria-expanded'), hash: location.hash, aboutTop: Math.round(r.top), aboutVisible: r.top > -10 && r.top < 260 }; })()`);
await step(`scrollTo(0,0)`);
await step(`document.getElementById('heroWatchDemoBtn').click()`);
mobile.videoModal = await evaluate(`(() => { const m = document.getElementById('videoModal'); return { open: m.classList.contains('is-open'), fits: m.querySelector('.modal-panel').getBoundingClientRect().height <= innerHeight }; })()`);
await step(`document.querySelector('#videoModal .modal-close').click()`);
report.interactions.mobile = mobile;

/* ---------- Reduced motion ---------- */
await loadAt(1280, 800, { reduceMotion: true });
await sleep(500);
report.reducedMotion = await evaluate(`(() => {
  const rev = [...document.querySelectorAll('.reveal')];
  const heroIn = [...document.querySelectorAll('.hero-in')];
  return {
    revealsHidden: rev.filter(el => getComputedStyle(el).opacity === '0').length,
    revealsTotal: rev.length,
    heroInHidden: heroIn.filter(el => getComputedStyle(el).opacity === '0').length,
    scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    canvasAnimating: typeof requestAnimationFrame // informational
  };
})()`);

report.consoleErrors = report.consoleErrors.filter(e => e.errors.length);
await writeFile(new URL('audit-report.json', ART), JSON.stringify(report, null, 2));

/* ---------- Summary ---------- */
console.log('\n=== SUMMARY ===');
console.log('Horizontal overflow:', report.viewports.filter(v => v.overflowX).map(v => v.vw + 'px').join(', ') || 'none');
console.log('Horizontal escapees:', report.viewports.flatMap(v => v.horizontalEscapees.map(e => v.vw + 'px ' + e.tag + '.' + e.cls + ' [' + e.x + '→' + e.right + ']')).join(' | ') || 'none');
for (const v of report.viewports) {
  const hidden = v.reveals.filter(r => !r.visible);
  if (hidden.length) console.log(`Hidden reveals @${v.vw}:`, hidden.map(h => h.cls).join(' | '));
}
console.log('Hero heights:', report.viewports.map(v => `${v.vw}:${v.hero.h}`).join(' '));
console.log('Contrast:', report.contrast);
console.log('Interactions:', JSON.stringify({ desktop: report.interactions.desktop, mobile: report.interactions.mobile }, null, 1));
console.log('Reduced motion:', report.reducedMotion);
console.log('Console errors:', JSON.stringify(report.consoleErrors));
console.log('Report: tests/artifacts/audit-report.json');

ws.close();
chrome.kill();
await sleep(400);
try { await rm(profile, { recursive: true, force: true }); } catch {}
process.exit(0);
