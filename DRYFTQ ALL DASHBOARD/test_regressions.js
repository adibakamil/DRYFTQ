/**
 * Regression tests for defects found in the engineering audit.
 * Run: node test_regressions.js
 */
const assert = require('assert');

const store = {};
global.localStorage = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => Object.keys(store).forEach((k) => delete store[k])
};
global.window = {
  location: { href: 'http://localhost:3000/team', pathname: '/team', search: '', protocol: 'http:' },
  addEventListener: () => {}, dispatchEvent: () => {}
};
global.CustomEvent = function CustomEvent() {};
const node = () => ({ setAttribute() {}, appendChild() {}, classList: { add() {}, remove() {} }, style: {} });
global.document = { createElement: node, getElementById: () => node(), body: node() };

const Dryftq = require('./shared/dryftq-state.js');
let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log('[PASS] ' + name); };

console.log('--- Regression tests ---');

test('escapeHtml neutralises markup and attribute breakouts', () => {
  assert.strictEqual(
    Dryftq.escapeHtml('<img src=x onerror="a()"> & \'q\''),
    '&lt;img src=x onerror=&quot;a()&quot;&gt; &amp; &#39;q&#39;'
  );
  assert.strictEqual(Dryftq.escapeHtml(null), '');
  assert.strictEqual(Dryftq.escapeHtml(undefined), '');
  assert.strictEqual(Dryftq.escapeHtml(0), '0');
});

test('team ids stay unique after a removal (was TM-<length+1>, which collided)', () => {
  localStorage.clear();
  assert.ok(Dryftq.removeTeamMember('TM-1'));
  const added = Dryftq.inviteTeamMember({ name: 'New Person', email: 'new@example.com' });
  const ids = Dryftq.getState().team.map((m) => m.id);
  assert.strictEqual(new Set(ids).size, ids.length, 'duplicate ids: ' + ids.join(','));
  assert.notStrictEqual(added.id, 'TM-5');
});

test('maintenance ids stay unique', () => {
  localStorage.clear();
  const a = Dryftq.createMaintenanceTask({ task: 'A' });
  const b = Dryftq.createMaintenanceTask({ task: 'B' });
  assert.notStrictEqual(a.id || a, b.id || b);
  const ids = Dryftq.getState().maintenanceTasks.map((t) => t.id);
  assert.strictEqual(new Set(ids).size, ids.length);
});

test('addMachine keeps a legitimate 0 instead of replacing it with the default', () => {
  localStorage.clear();
  const m = Dryftq.addMachine({ id: 'zero-1', temp: 0, vibration: 0, health: 0 });
  assert.strictEqual(m.temp, 0);
  assert.strictEqual(m.vibration, 0);
  assert.strictEqual(m.health, 0);
});

test('addMachine falls back to defaults for blank/invalid numbers', () => {
  localStorage.clear();
  const m = Dryftq.addMachine({ id: 'blank-1', temp: '', vibration: 'abc', health: undefined });
  assert.strictEqual(m.temp, 65);
  assert.strictEqual(m.vibration, 1.2);
  assert.strictEqual(m.health, 90);
});

test('getQueryParams tolerates malformed percent-encoding', () => {
  global.window.location.search = '?a=%E0%A4%A&b=ok&c=x%20y';
  const q = Dryftq.getQueryParams();
  assert.strictEqual(q.b, 'ok');
  assert.strictEqual(q.c, 'x y');
  global.window.location.search = '';
});

console.log('\nALL ' + passed + ' REGRESSION TESTS PASSED');
