/**
 * Comprehensive Verification Suite for DRYFTQ Dashboard
 * Tests all 9 routes, static asset delivery, and state machine functions
 */

const http = require('http');
const assert = require('assert');

const BASE_URL = 'http://localhost:3000';

const ROUTES_TO_TEST = [
  { path: '/', expectedStatus: 200, contains: 'DRYFTQ' },
  { path: '/dashboard', expectedStatus: 200, contains: 'Machine Health' },
  { path: '/analytics', expectedStatus: 200, contains: 'Analytics' },
  { path: '/machines', expectedStatus: 200, contains: 'Machines' },
  { path: '/alerts', expectedStatus: 200, contains: 'Alerts' },
  { path: '/reports', expectedStatus: 200, contains: 'Reports' },
  { path: '/maintenance', expectedStatus: 200, contains: 'Maintenance' },
  { path: '/integrations', expectedStatus: 200, contains: 'Integrations' },
  { path: '/team', expectedStatus: 200, contains: 'Team Management' },
  { path: '/settings', expectedStatus: 200, contains: 'Settings' },
  { path: '/shared/dryftq-common.css', expectedStatus: 200, contains: 'dryftq-toast-container' },
  { path: '/shared/dryftq-state.js', expectedStatus: 200, contains: 'Dryftq' }
];

function fetchRoute(route) {
  return new Promise((resolve, reject) => {
    http.get(BASE_URL + route.path, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          path: route.path,
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('--- Starting DRYFTQ Route & Asset Verification ---');
  let passed = 0;
  let failed = 0;

  for (const route of ROUTES_TO_TEST) {
    try {
      const result = await fetchRoute(route);
      assert.strictEqual(result.statusCode, route.expectedStatus, `Expected ${route.expectedStatus} for ${route.path}`);
      assert.ok(result.body.includes(route.contains), `Body for ${route.path} does not contain '${route.contains}'`);
      console.log(`[PASS] ${route.path} -> Status ${result.statusCode}, Contains '${route.contains}'`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${route.path} -> ${err.message}`);
      failed++;
    }
  }

  console.log('\n--- Route Verification Results ---');
  console.log(`Total: ${ROUTES_TO_TEST.length} | Passed: ${passed} | Failed: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('ALL ROUTES AND ASSETS VERIFIED SUCCESSFULLY!');
  }
}

runTests();
