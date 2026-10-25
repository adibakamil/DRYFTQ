/**
 * DRYFTQ Centralized Route Configuration
 * Single source of truth for all application routes.
 * Used by both the server (server.js) and client (dryftq-state.js).
 */

const APP_BASE = '/';
const APP_NAME = 'DRYFTQ';

// Central route definitions: clean URL -> physical HTML file path
const ROUTES = {
  '/': { page: 'dashboard', file: 'DRYFTQ DASHBOARD 1/code.html', title: 'Dashboard' },
  '/dashboard': { page: 'dashboard', file: 'DRYFTQ DASHBOARD 1/code.html', title: 'Dashboard' },
  '/analytics': { page: 'analytics', file: 'DRYFTQ DASHBOARD 2 (ANALYTICS)/code.html', title: 'Analytics' },
  '/machines': { page: 'machines', file: 'DRYFTQ DASHBOARD 3(MACHINES)/code.html', title: 'Machines' },
  '/alerts': { page: 'alerts', file: 'DRYFTQ DASHOARD 4(ALERT)/code.html', title: 'Alerts' },
  '/reports': { page: 'reports', file: 'DRYFTQ DASHBOARD 5 (REPORT)/code.html', title: 'Reports' },
  '/maintenance': { page: 'maintenance', file: 'DRYFTQ DASHBOARD 6 (MAINTENANCE)/code.html', title: 'Maintenance' },
  '/integrations': { page: 'integrations', file: 'DRYFTQ DASHBOARD 7(INTEGRATIONS)/code.html', title: 'Integrations' },
  '/team': { page: 'team', file: 'DRYFTQ DASHBOARD 8(TEAM MANAGEMENT)/code.html', title: 'Team Management' },
  '/settings': { page: 'settings', file: 'DRYFTQ DASHBOARD 9(SETTING)/code.html', title: 'Settings & Profile' }
};

// Reverse lookup: page key -> clean URL
const PAGE_TO_URL = {};
Object.entries(ROUTES).forEach(([url, info]) => {
  if (url !== '/' && info.page) {
    PAGE_TO_URL[info.page] = url;
  }
});

// All valid clean routes (excluding root alias)
const CLEAN_ROUTES = Object.keys(ROUTES).filter(u => u !== '/');

// Get route info for a given clean URL (case-insensitive lookup)
function getRouteInfo(pathname) {
  const clean = pathname.replace(/\/+$/, '') || '/';
  // Try exact match first
  if (ROUTES[clean]) return ROUTES[clean];
  // Try case-insensitive match
  const lower = clean.toLowerCase();
  for (const [url, info] of Object.entries(ROUTES)) {
    if (url.toLowerCase() === lower) return { ...info, url };
  }
  return null;
}

// Get all page keys
function getPageKeys() {
  return Object.values(ROUTES).map(r => r.page).filter(Boolean);
}

// Check if a path is a known application route
function isAppRoute(pathname) {
  return getRouteInfo(pathname) !== null;
}

module.exports = {
  ROUTES,
  PAGE_TO_URL,
  CLEAN_ROUTES,
  APP_BASE,
  APP_NAME,
  getRouteInfo,
  getPageKeys,
  isAppRoute
};
