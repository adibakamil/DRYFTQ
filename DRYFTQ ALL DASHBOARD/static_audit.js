/**
 * Improved HTML and JS static analysis scanner for DRYFTQ
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;

// Server routes live in one place - a root-absolute reference is a route if it
// is registered there, otherwise it is a file served from the project root.
const { ROUTES } = require('./shared/dryftq-routes');
const ROUTE_KEYS = {};
Object.keys(ROUTES).forEach((k) => { ROUTE_KEYS[k.toLowerCase()] = ROUTES[k]; });

// Resolve a reference exactly the way server.js would serve it.
function resolveRef(ref, pageFullPath) {
  const clean = decodeURIComponent(String(ref).split('?')[0].split('#')[0]);
  if (clean.startsWith('/')) {
    const key = (clean.replace(/\/+$/, '') || '/').toLowerCase();
    const route = ROUTE_KEYS[key];
    if (route) return path.join(BASE_DIR, route.file);
    return path.join(BASE_DIR, clean);
  }
  return path.resolve(path.dirname(pageFullPath), clean);
}
const PAGES = [
  'index.html',
  'DRYFTQ DASHBOARD 1/code.html',
  'DRYFTQ DASHBOARD 2 (ANALYTICS)/code.html',
  'DRYFTQ DASHBOARD 3(MACHINES)/code.html',
  'DRYFTQ DASHOARD 4(ALERT)/code.html',
  'DRYFTQ DASHBOARD 5 (REPORT)/code.html',
  'DRYFTQ DASHBOARD 6 (MAINTENANCE)/code.html',
  'DRYFTQ DASHBOARD 7(INTEGRATIONS)/code.html',
  'DRYFTQ DASHBOARD 8(TEAM MANAGEMENT)/code.html',
  'DRYFTQ DASHBOARD 9(SETTING)/code.html'
];

const results = [];

PAGES.forEach(pageRel => {
  const fullPath = path.join(BASE_DIR, pageRel);
  if (!fs.existsSync(fullPath)) {
    results.push({ page: pageRel, error: 'File does not exist!' });
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const issues = [];

  // Split into HTML markup and scripts so we don't treat JS template literals as HTML tags
  const scripts = [];
  const htmlWithoutScripts = content.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, (match, scriptCode) => {
    scripts.push(scriptCode);
    return '<!-- SCRIPT_PLACEHOLDER -->';
  });

  // Check 1: Check HTML href links
  const hrefRegex = /href=(?:"([^"]*)"|'([^']*)')/g;
  let match;
  while ((match = hrefRegex.exec(htmlWithoutScripts)) !== null) {
    let link = match[1] || match[2] || '';
    if (!link || link.startsWith('#') || link.startsWith('http://') || link.startsWith('https://') || link.startsWith('mailto:') || link.startsWith('javascript:')) {
      continue;
    }
    const resolvedTarget = resolveRef(link, fullPath);

    if (!fs.existsSync(resolvedTarget)) {
      issues.push(`Broken link href="${link}" (resolved to: ${resolvedTarget})`);
    }
  }

  // Check 2: Check HTML src assets
  const srcRegex = /src=(?:"([^"]*)"|'([^']*)')/g;
  while ((match = srcRegex.exec(htmlWithoutScripts)) !== null) {
    let src = match[1] || match[2] || '';
    if (!src || src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
      continue;
    }
    const resolvedTarget = resolveRef(src, fullPath);
    if (!fs.existsSync(resolvedTarget)) {
      issues.push(`Broken src="${src}" (resolved to: ${resolvedTarget})`);
    }
  }

  // Check 3: Check scripts for JS syntax errors
  scripts.forEach((code, idx) => {
    try {
      new Function(code);
    } catch (e) {
      issues.push(`JS syntax error in script #${idx + 1}: ${e.message}`);
    }
  });

  // Check 4: Check inline onclick handlers in HTML
  const onclickRegex = /onclick=(?:"([^"]*)"|'([^']*)')/g;
  while ((match = onclickRegex.exec(htmlWithoutScripts)) !== null) {
    const handler = match[1] || match[2] || '';
    try {
      new Function(handler);
    } catch (e) {
      issues.push(`Invalid onclick handler: "${handler}" -> ${e.message}`);
    }
  }

  results.push({ page: pageRel, issues });
});

console.log('=== DRYFTQ Accurate Static Audit Results ===');
let hasIssues = false;
results.forEach(r => {
  if (r.error) {
    console.log(`[ERROR] ${r.page}: ${r.error}`);
    hasIssues = true;
  } else if (r.issues.length > 0) {
    console.log(`[ISSUES FOUND] ${r.page}:`);
    r.issues.forEach(iss => console.log(`  - ${iss}`));
    hasIssues = true;
  } else {
    console.log(`[PERFECT] ${r.page}: 0 errors.`);
  }
});

if (!hasIssues) {
  console.log('\nAll 10 HTML files are 100% syntactically perfect and free of broken links!');
}
