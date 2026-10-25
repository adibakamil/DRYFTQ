/**
 * DRYFTQ Plant Operations - Core Application State & Workflow Engine
 * Provides unified data store, cross-page navigation, reactive state synchronization,
 * toast notifications, global search, and real CSV report generation.
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'dryftq_plant_operations_v2';

  // Escape any value before it is interpolated into an HTML template string.
  // State is user-editable (invites, machines, tasks) and persisted, so every
  // innerHTML sink must route text through this.
  function escapeHtml(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Next unused "PREFIX-<n>" id. Using list length collides after a removal.
  function nextId(prefix, list, base) {
    let max = base || 0;
    (list || []).forEach((item) => {
      const m = String(item && item.id).match(/(\d+)$/);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    });
    return prefix + '-' + (max + 1);
  }

  // Number(x) || fallback turns a legitimate 0 into the fallback.
  function numOr(value, fallback) {
    if (value === '' || value === null || value === undefined) return fallback;
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  // Centralized route configuration (single source of truth)
  const ROUTE_CONFIG = {
    dashboard: '/dashboard',
    analytics: '/analytics',
    machines: '/machines',
    alerts: '/alerts',
    reports: '/reports',
    maintenance: '/maintenance',
    integrations: '/integrations',
    team: '/team',
    settings: '/settings'
  };

  // Page folder names (for internal references only, not used for URL generation)
  const PAGE_FOLDERS = {
    dashboard: 'DRYFTQ DASHBOARD 1',
    analytics: 'DRYFTQ DASHBOARD 2 (ANALYTICS)',
    machines: 'DRYFTQ DASHBOARD 3(MACHINES)',
    alerts: 'DRYFTQ DASHOARD 4(ALERT)',
    reports: 'DRYFTQ DASHBOARD 5 (REPORT)',
    maintenance: 'DRYFTQ DASHBOARD 6 (MAINTENANCE)',
    integrations: 'DRYFTQ DASHBOARD 7(INTEGRATIONS)',
    team: 'DRYFTQ DASHBOARD 8(TEAM MANAGEMENT)',
    settings: 'DRYFTQ DASHBOARD 9(SETTING)'
  };

  // ---- Protocol helpers -------------------------------------------------
  // The app runs two ways: served over HTTP (clean routes like /dashboard)
  // or opened straight from disk (file://). Site-absolute asset paths such as
  // "/mine.jpg" are correct for the server but point at the filesystem root
  // under file://, so they have to be rebased onto the module folder.
  function isFileProtocol() {
    try {
      return typeof window !== 'undefined' && !!window.location &&
        window.location.protocol === 'file:';
    } catch (e) {
      return false;
    }
  }

  // Clean server routes ("/dashboard", "/alerts", ...) only exist when the
  // document itself was served on one by server.js. Everywhere else - pages
  // opened from disk (file://) and pages served from this folder by a plain
  // static host (the landing page's `npm run serve`, for instance) - every
  // link has to resolve to a real module folder instead. Folder paths are
  // also valid on the DRYFTQ server itself, so this mode never breaks there.
  function usesFolderUrls() {
    if (isFileProtocol()) return true;
    try {
      if (typeof window === 'undefined' || !window.location) return false;
      const protocol = window.location.protocol;
      if (protocol && protocol !== 'http:' && protocol !== 'https:') return false;

      let pathname = String(window.location.pathname || '');
      try { pathname = decodeURIComponent(pathname); } catch (e) { /* keep raw */ }
      pathname = pathname.replace(/\\/g, '/');

      const clean = pathname.replace(/\/+$/, '') || '/';
      if (clean === '/') return false; // server root IS the dashboard route
      const key = clean.replace(/^\/+/, '').toLowerCase();
      // A known route -> we are on the DRYFTQ server. Anything else -> the page
      // is a real file, so folder-relative links are the only safe choice.
      return !Object.prototype.hasOwnProperty.call(ROUTE_CONFIG, key);
    } catch (e) {
      return false;
    }
  }

  function resolveAssetPath(assetPath) {
    if (!assetPath || typeof assetPath !== 'string') return assetPath;
    if (!usesFolderUrls()) return assetPath;
    if (assetPath.charAt(0) !== '/' || assetPath.charAt(1) === '/') return assetPath;
    // Every module lives exactly one level below the project root.
    return '..' + assetPath;
  }

  // Legacy demo identity, kept so older saved state can be migrated forward.
  const LEGACY_USER_NAME = 'Aditya Kamil';
  const LEGACY_USER_AVATAR_PREFIX = 'https://lh3.googleusercontent.com/';

  // Default Industrial Plant Data Model
  const DEFAULT_STATE = {
    user: {
      name: 'Adiba Kamil',
      role: 'Product Specialist',
      department: 'Plant Operations',
      email: 'adibakamil@dryyftq.com',
      phone: '+91 98765 43210',
      avatar: '/mine.jpg'
    },
    settings: {
      language: 'en',
      timezone: 'asia-kolkata',
      dateFormat: 'dd-mm-yyyy',
      theme: 'light',
      units: 'metric',
      autoRefresh: true,
      refreshInterval: 15
    },
    machines: [
      { id: 'CNC-01', name: 'CNC-01 Milling Center', line: 'Line 1', status: 'Running', load: '78%', temp: 68, vibration: 1.2, power: '2.4 kW', lastMaint: '2 days ago', health: 92, type: 'Milling' },
      { id: 'PRESS-02', name: 'PRESS-02 Stamping', line: 'Line 2', status: 'Running', load: '85%', temp: 72, vibration: 1.8, power: '3.1 kW', lastMaint: '5 days ago', health: 86, type: 'Stamping' },
      { id: 'CNC-02', name: 'CNC-02 High Speed Axis', line: 'Line 2', status: 'Error', load: '92%', temp: 105, vibration: 2.8, power: '2.9 kW', lastMaint: '12 days ago', health: 48, type: 'Milling' },
      { id: 'PUMP-01', name: 'PUMP-01 Hydraulic Core', line: 'Line 1', status: 'Running', load: '64%', temp: 58, vibration: 0.9, power: '1.8 kW', lastMaint: '1 week ago', health: 95, type: 'Hydraulic' },
      { id: 'CONV-01', name: 'CONV-01 Assembly Belt', line: 'Line 3', status: 'Running', load: '71%', temp: 62, vibration: 2.2, power: '1.5 kW', lastMaint: '3 days ago', health: 84, type: 'Conveyor' },
      { id: 'ROBOT-01', name: 'ROBOT-01 6-Axis Arm', line: 'Line 4', status: 'Maintenance', load: '0%', temp: 45, vibration: 0.2, power: '0.5 kW', lastMaint: 'In Progress', health: 65, type: 'Robotics' },
      { id: 'PRESS-01', name: 'PRESS-01 Heavy Duty', line: 'Line 1', status: 'Running', load: '82%', temp: 70, vibration: 1.4, power: '2.8 kW', lastMaint: '4 days ago', health: 88, type: 'Stamping' },
      { id: 'MILL-01', name: 'MILL-01 Precision Lathe', line: 'Line 2', status: 'Running', load: '75%', temp: 65, vibration: 1.3, power: '2.2 kW', lastMaint: '1 week ago', health: 91, type: 'Milling' },
      { id: 'LATHE-02', name: 'LATHE-02 Turret Axis', line: 'Line 3', status: 'Idle', load: '15%', temp: 42, vibration: 0.4, power: '0.8 kW', lastMaint: '2 weeks ago', health: 94, type: 'Turning' },
      { id: 'PACK-01', name: 'PACK-01 Auto Packaging', line: 'Line 4', status: 'Running', load: '88%', temp: 69, vibration: 1.6, power: '2.0 kW', lastMaint: '6 days ago', health: 87, type: 'Packaging' }
    ],
    alerts: [
      { id: 'ALT-101', title: 'High Temperature', machineId: 'CNC-02', machineName: 'Line 2 - CNC-02', description: 'Temperature in Line 2 exceeded the threshold.', details: 'Reached: 105°C | Limit: 90°C', time: '10:25', date: 'Oct 16, 2025', severity: 'Critical', status: 'Active', metric: 'Temperature', reading: '105°C', threshold: '90°C' },
      { id: 'ALT-102', title: 'Abnormal Vibration', machineId: 'CONV-01', machineName: 'Line 3 - CONV-01', description: 'Vibration in Line 3 is above normal threshold.', details: 'Reached: 2.8 mm/s | Limit: 2.0 mm/s', time: '09:45', date: 'Oct 16, 2025', severity: 'Warning', status: 'Active', metric: 'Vibration', reading: '2.8 mm/s', threshold: '2.0 mm/s' },
      { id: 'ALT-103', title: 'Process Deviation', machineId: 'CNC-01', machineName: 'Line 1 - CNC-01', description: 'Quality index is below target in Line 1.', details: 'Deviation in Line 1', time: '08:45', date: 'Oct 16, 2025', severity: 'Warning', status: 'Active', metric: 'Quality', reading: '81%', threshold: '90%' },
      { id: 'ALT-104', title: 'Quality Deviation', machineId: 'PRESS-02', machineName: 'Line 2 - PRESS-02', description: 'Lot Error - Line 2. Quality index is below target.', details: 'Lot Error - Line 2', time: '07:30', date: 'Oct 16, 2025', severity: 'Info', status: 'Acknowledged', metric: 'Quality', reading: '84%', threshold: '90%' },
      { id: 'ALT-105', title: 'Maintenance Required', machineId: 'PUMP-01', machineName: 'Line 1 - PUMP-01', description: 'Scheduled maintenance overdue for motor bearings.', details: 'Service - Motor 1', time: '06:15', date: 'Oct 16, 2025', severity: 'Info', status: 'Resolved', metric: 'Runtime', reading: '2500 hrs', threshold: '2000 hrs' }
    ],
    maintenanceTasks: [
      { id: 'MNT-201', task: 'Oil Change', machine: 'CNC-01', type: 'Preventive', priority: 'High', dueDate: 'Oct 18, 2025', status: 'Upcoming', technician: 'Priya Sharma', notes: 'Replace synthetic lubricant and flush filters.' },
      { id: 'MNT-202', task: 'Vibration Check', machine: 'PRESS-02', type: 'Predictive', priority: 'Medium', dueDate: 'Oct 19, 2025', status: 'Upcoming', technician: 'Vikash Singh', notes: 'Inspect flywheel alignment and dampening pads.' },
      { id: 'MNT-203', task: 'Filter Replacement', machine: 'PUMP-01', type: 'Preventive', priority: 'Medium', dueDate: 'Oct 19, 2025', status: 'Upcoming', technician: 'Priya Sharma', notes: 'Replace intake mesh and pressure sensors.' },
      { id: 'MNT-204', task: 'Belt Inspection', machine: 'CONV-01', type: 'Predictive', priority: 'Low', dueDate: 'Oct 18, 2025', status: 'Upcoming', technician: 'Vikash Singh', notes: 'Check tension and drive rollers.' },
      { id: 'MNT-205', task: 'Calibration', machine: 'ROBOT-01', type: 'Corrective', priority: 'High', dueDate: 'Oct 20, 2025', status: 'In Progress', technician: 'Aditya Kamil', notes: 'Calibrate 6-axis servo offsets after torque fault.' }
    ],
    team: [
      { id: 'TM-1', name: 'Aditya Kamil', role: 'Admin', department: 'Plant Operations', status: 'Active', lastActive: '2 min ago', email: 'adibakamil@dryyftq.com', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMWPntWuCH7F8XDwAMFEDIesVS6Qva6Fw3qR0q1vpyQ_B_ZnEhbmi4OIMoh1PXj6TJ1yFPWPlZYq7rQB_YxUlgLN1-1oT5VeKqSFqlzKdeEdHS-PVqdTfjdSmAjt0jPwZkVUlHVVq8T-Pd3DeDtpSLUJO1xt5Uf_Jjo2uBObirsD31SVAnKGU2iR-blzQYNAVm9V89nGKbOZcXMt01N-3RYJBy1BdNaTs9POZKeaUcBsC3oNaC9LHdZA' },
      { id: 'TM-2', name: 'Vikash Singh', role: 'Operator', department: 'Production', status: 'Active', lastActive: '1 hour ago', email: 'vikash.s@dryyftq.com', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBW1MpG5ZQMP6OMsmrdQ9HNvlefngHPsUUewGAFl8Z9smIjLYBPdfWIEwf7ncQNtrnNBj12c59gBR5CAkKs_HE3RUktmQOLaqYzbPATCQFB6mae7xL0AsfyKH1DusQsjAHH7NnwyQs88H_m2d5saij-NVnI4GU7IHahO2qDGd0nlLyz5KPX0CNHMtoJBu1iYr8sMRsEXkUps4lNiV0KIDKRqRbrd4EFvIqY33iBTw2JZDjNNr4-wE9uOg' },
      { id: 'TM-3', name: 'Rekha Verma', role: 'Analyst', department: 'Analytics', status: 'Active', lastActive: '30 min ago', email: 'rekha.v@dryyftq.com', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqXqiHoO7E4VBqx9lpAsSpx-fVBPsU8RVVeVupHg5LNct3K8SFHRHkICrxiayxX0hyemLO-k3otTRcPvXgxAo4eWl8AmYN2vgXUTMVR9yYF4qEYWUKvZbtUfpEEDy7bmzNHiT4mhkO3bP0skNGhqhyjva9J8gIu7AtQ9aoRXT50-As0R_-z-xSeSj-hLEGecm3mrUu2MhELOE4xmonbqrhfn_rMRqNgEzEvvc8jkMwoECH7JgbToQvYQ' },
      { id: 'TM-4', name: 'Priya Sharma', role: 'Maintenance', department: 'Maintenance', status: 'Active', lastActive: '15 min ago', email: 'priya.s@dryyftq.com', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUVq_yIfcZLoVz4bZuQ3kllqGFx2B21gNWqtD7qogmvPQCI-S-HMtpw-F7FQ6dVgcwGnVTdoH6lUnoFlcAtWHDGwfrkUBi2hxx5E-DDfkIRkt5OW_bbrRi4wUxNffLAgQKTkeejcxYYcyxw1mYhJfu5Q8ROhczKV0C7SDvkCWsqTMfQzqJOu08xCgQswAu-vGz1Lk6dTus4UDqLHjGoOPMW3cuXOzV59di8tHZ6kESxTFs4ipZlVDytA' },
      { id: 'TM-5', name: 'Amit Patel', role: 'Viewer', department: 'Management', status: 'Inactive', lastActive: '2 days ago', email: 'amit.p@dryyftq.com', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzA5UQe3XNnVn-3JcHdFFMvz7H1-Y3WpMntrx_FpSxMJiZU-mEfW-kYrXKuNLLWrfVtbkLvFuKWNqlXouZmwXVnOlJBfNHLkPa66eXTuE00rCiPHPIzt9s_HweRT4301AxDrLz2_o2wCaAq1E6W8j-cbJ2u-1ssXLQFM-voju4ZYBsDofkYNsKOPGnImvcsQdDnpQ-R7ZEstTK77eoCbNZJhxt8qD-NpjXzr-uiiUdjlD0NxBqbfDvLA' }
    ],
    integrations: [
      { id: 'aws', name: 'AWS 3', category: 'Cloud IoT', status: 'Connected', lastSync: '2 min ago', endpoint: 'https://iot.us-east-1.amazonaws.com', syncInterval: '60s', apiKey: 'AKIA****************' },
      { id: 'azure', name: 'Azure IoT', category: 'Cloud IoT', status: 'Connected', lastSync: '2 min ago', endpoint: 'dryftq-hub.azure-devices.net', syncInterval: '30s', apiKey: 'SharedAccessKey=****' },
      { id: 'influx', name: 'InfluxDB', category: 'Time-Series DB', status: 'Connected', lastSync: '1 min ago', endpoint: 'https://influx.internal.dryftq.io:8086', syncInterval: '15s', apiKey: 'token_d9f829f0****' },
      { id: 'slack', name: 'Slack', category: 'Alert Notifications', status: 'Connected', lastSync: '2 min ago', endpoint: 'https://hooks.slack.com/services/DRYFTQ/B0123/alerts', syncInterval: 'Real-time', apiKey: 'xoxb-dryftq-bot****' },
      { id: 'datadog', name: 'Datadog', category: 'APM & Telemetry', status: 'Disconnected', lastSync: 'Never', endpoint: 'https://api.datadoghq.com', syncInterval: '60s', apiKey: '' },
      { id: 'grafana', name: 'Grafana', category: 'Visualization', status: 'Disconnected', lastSync: 'Never', endpoint: 'https://grafana.internal.dryftq.io', syncInterval: '30s', apiKey: '' },
      { id: 'gcp', name: 'Google Cloud', category: 'Cloud IoT', status: 'Disconnected', lastSync: 'Never', endpoint: 'https://cloudiot.googleapis.com', syncInterval: '60s', apiKey: '' },
      { id: 'teams', name: 'Microsoft Teams', category: 'Alert Notifications', status: 'Disconnected', lastSync: 'Never', endpoint: 'https://dryftq.webhook.office.com', syncInterval: 'Real-time', apiKey: '' }
    ],
    recentEvents: [
      { time: '10:30', title: 'Vibration detected on Line 2', severity: 'critical', machineId: 'CNC-02' },
      { time: '09:15', title: 'Temperature threshold exceeded', severity: 'warning', machineId: 'PRESS-02' },
      { time: '08:45', title: 'Process back to normal', severity: 'info', machineId: 'CNC-01' }
    ]
  };

  // State Management
  const Dryftq = {
    // Page metadata (titles and icons for sidebar rendering)
    PAGES: {
      dashboard: { folder: 'DRYFTQ DASHBOARD 1', title: 'Dashboard', icon: 'grid', url: '/dashboard' },
      analytics: { folder: 'DRYFTQ DASHBOARD 2 (ANALYTICS)', title: 'Analytics', icon: 'chart', url: '/analytics' },
      machines: { folder: 'DRYFTQ DASHBOARD 3(MACHINES)', title: 'Machines', icon: 'server', url: '/machines' },
      alerts: { folder: 'DRYFTQ DASHOARD 4(ALERT)', title: 'Alerts', icon: 'bell', url: '/alerts' },
      reports: { folder: 'DRYFTQ DASHBOARD 5 (REPORT)', title: 'Reports', icon: 'file', url: '/reports' },
      maintenance: { folder: 'DRYFTQ DASHBOARD 6 (MAINTENANCE)', title: 'Maintenance', icon: 'wrench', url: '/maintenance' },
      integrations: { folder: 'DRYFTQ DASHBOARD 7(INTEGRATIONS)', title: 'Integrations', icon: 'plug', url: '/integrations' },
      team: { folder: 'DRYFTQ DASHBOARD 8(TEAM MANAGEMENT)', title: 'Team Management', icon: 'users', url: '/team' },
      settings: { folder: 'DRYFTQ DASHBOARD 9(SETTING)', title: 'Settings & Profile', icon: 'cog', url: '/settings' }
    },

    escapeHtml: escapeHtml,

    getState: function () {
      let state = null;
      try {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            state = Object.assign({}, DEFAULT_STATE, parsed);
          }
        }
      } catch (e) {
        console.warn('Dryftq: Error reading localStorage:', e);
      }
      if (!state) state = JSON.parse(JSON.stringify(DEFAULT_STATE));

      // Work on our own copy of `user` so migration can never mutate
      // DEFAULT_STATE or the payload we just parsed.
      state.user = Object.assign({}, DEFAULT_STATE.user, state.user || {});

      // Migrate the originally seeded identity forward. A name or avatar the
      // operator has deliberately changed is left alone.
      if (!state.user.name || state.user.name === LEGACY_USER_NAME) {
        state.user.name = DEFAULT_STATE.user.name;
      }
      if (!state.user.avatar ||
          state.user.avatar === DEFAULT_STATE.user.avatar ||
          state.user.avatar.indexOf(LEGACY_USER_AVATAR_PREFIX) === 0 ||
          state.user.avatar.indexOf('../') === 0) {
        state.user.avatar = DEFAULT_STATE.user.avatar;
      }

      // Rebase for the active routing mode (file:// and static hosts need
      // ../mine.jpg so the asset resolves out of the module folder).
      state.user.avatar = resolveAssetPath(state.user.avatar);
      return state;
    },

    saveState: function (state) {
      // Never persist the file:// rebasing - storage always holds the
      // canonical site-absolute path ("/mine.jpg").
      if (state && state.user && typeof state.user.avatar === 'string' &&
          state.user.avatar.indexOf('../') === 0) {
        state = Object.assign({}, state, {
          user: Object.assign({}, state.user, { avatar: state.user.avatar.slice(2) })
        });
      }
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }
        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
          window.dispatchEvent(new CustomEvent('dryftq:state-change', { detail: state }));
        }
      } catch (e) {
        console.error('Dryftq: Error writing localStorage:', e);
      }
    },

    // True when pages are opened straight from disk (double-click / file://).
    // Clean server routes ("/dashboard") do not exist on the filesystem, so in
    // that mode every link has to be translated back to a real folder path.
    // See usesFolderUrls() for the full rule (file:// OR a host without routes).
    isFileProtocol: function () {
      try {
        return typeof window !== 'undefined' && !!window.location &&
          window.location.protocol === 'file:';
      } catch (e) {
        return false;
      }
    },

    // Translate a clean route ("/alerts?tab=x") into a relative filesystem
    // path that resolves from wherever the current document lives.
    toFileUrl: function (cleanUrl) {
      const [rawPath, query] = String(cleanUrl).split('?');
      const key = (rawPath.replace(/^\/+/, '') || 'dashboard').toLowerCase();
      const folder = PAGE_FOLDERS[key];
      if (!folder) return cleanUrl;

      let current = '';
      try {
        current = decodeURIComponent((window.location && window.location.pathname) || '')
          .replace(/\\/g, '/');
      } catch (e) { /* ignore */ }

      // Inside a module folder -> step up one level. At project root -> stay.
      const insideModule = Object.keys(PAGE_FOLDERS).some((k) => {
        const f = PAGE_FOLDERS[k];
        return current.indexOf('/' + f + '/') !== -1 || current.endsWith('/' + f);
      });
      const prefix = insideModule ? '../' : './';
      return prefix + folder + '/code.html' + (query ? '?' + query : '');
    },

    // Navigation helper: computes the correct URL for any of the 9 page modules
    getPageUrl: function (targetKey, params = {}) {
      const pageInfo = this.PAGES[targetKey];
      if (!pageInfo) return '#';

      let url = pageInfo.url || ROUTE_CONFIG[targetKey] || '#';

      const queryParts = [];
      for (const key of Object.keys(params)) {
        if (params[key] !== undefined && params[key] !== null) {
          queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
        }
      }
      if (queryParts.length > 0) {
        url += '?' + queryParts.join('&');
      }

      // Served on a clean route -> clean route. Opened from disk, or served
      // from this folder by a host without routes -> real module folder.
      if (usesFolderUrls()) return this.toFileUrl(url);
      return url;
    },

    // Rebase a site-absolute asset path ("/mine.jpg") for the active
    // protocol. Over HTTP it is returned untouched; under file:// it becomes
    // "../mine.jpg" so it resolves out of the module folder.
    resolveAsset: function (assetPath) {
      return resolveAssetPath(assetPath);
    },

    // Rewrites every absolute href ("/dashboard", "/team", ...) in the current
    // document so it resolves in the active routing mode. Called after the sidebar
    // is painted so static markup and JS-rendered markup stay in sync.
    syncLinksToProtocol: function () {
      if (!usesFolderUrls()) return;
      if (typeof document === 'undefined' || !document.querySelectorAll) return;

      let links = [];
      try { links = document.querySelectorAll('a[href]'); } catch (e) { return; }
      links.forEach((link) => {
        const href = link.getAttribute('href');
        if (!href || href.charAt(0) !== '/' || href.charAt(1) === '/') return;
        link.setAttribute('href', this.toFileUrl(href));
      });

      // Same rebasing for site-absolute images (profile picture, logo, ...).
      let imgs = [];
      try { imgs = document.querySelectorAll('img[src]'); } catch (e) { return; }
      imgs.forEach((img) => {
        const src = img.getAttribute('src');
        if (!src || src.charAt(0) !== '/' || src.charAt(1) === '/') return;
        img.setAttribute('src', '..' + src);
      });
    },

    navigateTo: function (targetKey, params = {}) {
      const url = this.getPageUrl(targetKey, params);
      window.location.href = url;
    },

    getQueryParams: function () {
      const params = {};
      try {
        new URLSearchParams(window.location.search).forEach((v, k) => { params[k] = v; });
      } catch (e) { /* malformed query string: behave as if there is none */ }
      return params;
    },

    getActiveAlertCount: function () {
      const state = this.getState();
      return (state.alerts || []).filter(a => a.status === 'Active').length;
    },

    // Toast Engine
    toast: function (message, type = 'success', title = '') {
      if (typeof document === 'undefined' || !document.getElementById) return;
      let container = document.getElementById('dryftq-toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'dryftq-toast-container';
        container.setAttribute('role', 'status');
        container.setAttribute('aria-live', 'polite');
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = `dryftq-toast dryftq-toast-${type}`;

      let iconSvg = '';
      if (type === 'success') {
        iconSvg = '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
        if (!title) title = 'Success';
      } else if (type === 'error') {
        iconSvg = '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
        if (!title) title = 'Error';
      } else if (type === 'warning') {
        iconSvg = '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
        if (!title) title = 'Attention';
      } else {
        iconSvg = '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
        if (!title) title = 'Information';
      }

      toast.innerHTML = `
        <div class="toast-icon w-8 h-8 rounded-full flex items-center justify-center shrink-0">
          ${iconSvg}
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="text-xs font-bold uppercase tracking-wider text-white">${escapeHtml(title)}</h4>
          <p class="text-xs text-slate-300 mt-0.5 leading-snug break-words">${escapeHtml(message)}</p>
        </div>
        <button type="button" aria-label="Dismiss notification" class="dryftq-toast-close text-slate-400 hover:text-white p-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round"></path></svg>
        </button>
      `;

      const closeBtn = typeof toast.querySelector === 'function' ? toast.querySelector('.dryftq-toast-close') : null;
      if (closeBtn) closeBtn.addEventListener('click', () => toast.remove());
      container.appendChild(toast);
      (typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame : setTimeout)(() => toast.classList.add('show'), 10);

      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => { if (toast && typeof toast.remove === 'function') toast.remove(); }, 300);
      }, 4000);
    },

    // Alias for pages that call Dryftq.showToast(msg, type)
    showToast: function (message, type, title) {
      return this.toast(message, type, title);
    },

    // Alert Actions
    acknowledgeAlert: function (alertId) {
      const state = this.getState();
      const alert = state.alerts.find(a => a.id === alertId);
      if (alert) {
        alert.status = 'Acknowledged';
        state.recentEvents.unshift({
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: `Alert ${alert.id} (${alert.title}) acknowledged`,
          severity: 'info',
          machineId: alert.machineId
        });
        this.saveState(state);
        this.toast(`Alert ${alert.id} has been acknowledged.`, 'info', 'Alert Acknowledged');
        return true;
      }
      return false;
    },

    resolveAlert: function (alertId) {
      const state = this.getState();
      const alert = state.alerts.find(a => a.id === alertId);
      if (alert) {
        alert.status = 'Resolved';
        state.recentEvents.unshift({
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: `Alert ${alert.id} (${alert.title}) resolved`,
          severity: 'info',
          machineId: alert.machineId
        });
        // If related machine had error, restore to running if no other critical alerts
        const hasOtherCritical = state.alerts.some(a => a.machineId === alert.machineId && a.status === 'Active' && a.severity === 'Critical');
        if (!hasOtherCritical) {
          const mach = state.machines.find(m => m.id === alert.machineId);
          if (mach && mach.status === 'Error') {
            mach.status = 'Running';
            mach.temp = 68;
            mach.vibration = 1.3;
          }
        }
        this.saveState(state);
        this.toast(`Alert ${alert.id} marked as resolved.`, 'success', 'Alert Resolved');
        return true;
      }
      return false;
    },

    // Maintenance Workflow
    createMaintenanceTask: function (taskData) {
      const state = this.getState();
      const newId = nextId('MNT', state.maintenanceTasks, 200);
      const newTask = {
        id: newId,
        task: taskData.task || 'General Maintenance',
        machine: taskData.machine || 'CNC-01',
        type: taskData.type || 'Preventive',
        priority: taskData.priority || 'Medium',
        dueDate: taskData.dueDate || 'Tomorrow',
        status: 'Upcoming',
        technician: taskData.technician || 'Priya Sharma',
        notes: taskData.notes || '',
        linkedAlertId: taskData.linkedAlertId || null
      };

      state.maintenanceTasks.unshift(newTask);

      // If linked alert exists, acknowledge it
      if (taskData.linkedAlertId) {
        const al = state.alerts.find(a => a.id === taskData.linkedAlertId);
        if (al && al.status === 'Active') {
          al.status = 'Acknowledged';
        }
      }

      state.recentEvents.unshift({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: `Maintenance task created for ${newTask.machine} (${newTask.task})`,
        severity: 'info',
        machineId: newTask.machine
      });

      this.saveState(state);
      this.toast(`Task ${newId} created and assigned to ${newTask.technician}.`, 'success', 'Maintenance Scheduled');
      return newTask;
    },

    updateMaintenanceStatus: function (taskId, newStatus) {
      const state = this.getState();
      const task = state.maintenanceTasks.find(t => t.id === taskId);
      if (task) {
        task.status = newStatus;
        if (newStatus === 'Completed') {
          // If machine was in maintenance, set back to running
          const mach = state.machines.find(m => m.id === task.machine);
          if (mach && mach.status === 'Maintenance') {
            mach.status = 'Running';
            mach.lastMaint = 'Today';
            mach.health = Math.min(100, (mach.health || 80) + 15);
          }
        }
        state.recentEvents.unshift({
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: `Task ${task.id} (${task.task}) updated to ${newStatus}`,
          severity: 'info',
          machineId: task.machine
        });
        this.saveState(state);
        this.toast(`Task ${task.id} status changed to ${newStatus}.`, 'success', 'Status Updated');
        return true;
      }
      return false;
    },

    // Machine Management
    addMachine: function (machineData) {
      const state = this.getState();
      if (!machineData.id) {
        this.toast('Machine ID is required.', 'error', 'Validation Error');
        return false;
      }
      if (state.machines.some(m => m.id.toLowerCase() === machineData.id.toLowerCase())) {
        this.toast(`Machine with ID ${machineData.id} already exists.`, 'error', 'Duplicate Machine ID');
        return false;
      }
      const newMachine = {
        id: machineData.id.toUpperCase(),
        name: machineData.name || `${machineData.id} Industrial Unit`,
        line: machineData.line || 'Line 1',
        status: machineData.status || 'Running',
        load: machineData.load || '75%',
        temp: numOr(machineData.temp, 65),
        vibration: numOr(machineData.vibration, 1.2),
        power: machineData.power || '2.0 kW',
        lastMaint: 'Just added',
        health: numOr(machineData.health, 90),
        type: machineData.type || 'General'
      };
      state.machines.push(newMachine);
      this.saveState(state);
      this.toast(`Machine ${newMachine.id} added successfully.`, 'success', 'Machine Registered');
      return newMachine;
    },

    updateMachine: function (machineId, updateData) {
      const state = this.getState();
      const machine = state.machines.find(m => m.id === machineId);
      if (machine) {
        Object.assign(machine, updateData);
        this.saveState(state);
        return true;
      }
      return false;
    },

    // Team Management
    inviteTeamMember: function (memberData) {
      const state = this.getState();
      if (!memberData.name || !memberData.email) {
        this.toast('Name and email are required.', 'error', 'Validation Error');
        return false;
      }
      const newMember = {
        id: nextId('TM', state.team, 0),
        name: memberData.name,
        role: memberData.role || 'Operator',
        department: memberData.department || 'Production',
        status: 'Active',
        lastActive: 'Just now',
        email: memberData.email,
        phone: memberData.phone || '+91 98765 00000',
        avatar: memberData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
      };
      state.team.push(newMember);
      this.saveState(state);
      this.toast(`${newMember.email} was added as ${newMember.role}. No email is sent in this demo build.`, 'success', 'Member Added');
      return newMember;
    },

    removeTeamMember: function (memberId) {
      const state = this.getState();
      const idx = state.team.findIndex(m => m.id === memberId);
      if (idx !== -1) {
        const removed = state.team.splice(idx, 1)[0];
        this.saveState(state);
        this.toast(`${removed.name} has been removed from the team.`, 'info', 'Member Removed');
        return true;
      }
      return false;
    },

    updateTeamMemberRole: function (memberId, newRole) {
      const state = this.getState();
      const member = state.team.find(m => m.id === memberId);
      if (member) {
        member.role = newRole;
        this.saveState(state);
        this.toast(`${member.name}'s role updated to ${newRole}.`, 'success', 'Role Updated');
        return true;
      }
      return false;
    },

    addTeamMember: function (memberData) {
      return this.inviteTeamMember(memberData);
    },

    updateTeamMember: function (memberId, updateData) {
      if (updateData && updateData.role) {
        return this.updateTeamMemberRole(memberId, updateData.role);
      }
      const state = this.getState();
      const member = state.team.find(m => m.id === memberId);
      if (member) {
        Object.assign(member, updateData);
        this.saveState(state);
        return true;
      }
      return false;
    },

    // Settings & Profile Management
    updateSettings: function (newSettings) {
      const state = this.getState();
      state.settings = Object.assign({}, state.settings || {}, newSettings);
      this.saveState(state);
      this.toast('Preferences saved successfully.', 'success', 'Settings Saved');
      return state.settings;
    },

    updateUser: function (userData) {
      const state = this.getState();
      state.user = Object.assign({}, state.user || {}, userData);
      this.saveState(state);
      this.toast('Profile updated successfully.', 'success', 'Profile Updated');
      return state.user;
    },

    // Integration Configuration
    toggleIntegration: function (integrationId, isConnected) {
      const state = this.getState();
      const item = state.integrations.find(i => i.id === integrationId);
      if (item) {
        if (typeof isConnected === 'undefined') {
          isConnected = item.status !== 'Connected';
        }
        item.status = isConnected ? 'Connected' : 'Disconnected';
        item.lastSync = isConnected ? 'Just now' : 'Never';
        this.saveState(state);
        this.toast(`${item.name} is now ${item.status}.`, isConnected ? 'success' : 'info', 'Integration Updated');
        return true;
      }
      return false;
    },

    saveIntegrationConfig: function (integrationId, config) {
      const state = this.getState();
      const item = state.integrations.find(i => i.id === integrationId);
      if (item) {
        item.endpoint = config.endpoint || item.endpoint;
        item.apiKey = config.apiKey || item.apiKey;
        item.syncInterval = config.syncInterval || item.syncInterval;
        item.status = 'Connected';
        item.lastSync = 'Just now';
        this.saveState(state);
        this.toast(`${item.name} configuration saved and verified.`, 'success', 'Connected');
        return true;
      }
      return false;
    },

    // Real CSV Report Downloader
    downloadReportCSV: function (reportType, options = {}) {
      const state = this.getState();
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      let filename = `DRYFTQ_${reportType.replace(/\s+/g, '_')}_${dateStr}.csv`;
      let headers = [];
      let rows = [];

      switch (reportType.toLowerCase()) {
        case 'production':
        case 'production report':
          headers = ['Date', 'Shift', 'Line', 'Target Units', 'Actual Units', 'Defect Rate (%)', 'Efficiency (%)', 'Status'];
          rows = [
            [dateStr, 'Morning (06:00-14:00)', 'Line 1', '1200', '1180', '1.2%', '98.3%', 'Optimal'],
            [dateStr, 'Morning (06:00-14:00)', 'Line 2', '1000', '940', '2.8%', '94.0%', 'Attention'],
            [dateStr, 'Morning (06:00-14:00)', 'Line 3', '850', '852', '0.9%', '100.2%', 'Optimal'],
            [dateStr, 'Evening (14:00-22:00)', 'Line 1', '1200', '1195', '1.1%', '99.5%', 'Optimal'],
            [dateStr, 'Evening (14:00-22:00)', 'Line 2', '1000', '910', '3.4%', '91.0%', 'Warning'],
            [dateStr, 'Evening (14:00-22:00)', 'Line 3', '850', '848', '1.0%', '99.7%', 'Optimal']
          ];
          break;

        case 'energy':
        case 'energy report':
          headers = ['Timestamp', 'Machine ID', 'Line', 'Active Power (kW)', 'Reactive Power (kVAR)', 'Energy (kWh)', 'Cost ($)', 'Status'];
          state.machines.forEach(m => {
            const kw = parseFloat(m.power) || 2.0;
            rows.push([`${dateStr} 10:00`, m.id, m.line, kw.toFixed(1), (kw * 0.2).toFixed(2), (kw * 8.5).toFixed(1), `$${(kw * 8.5 * 0.12).toFixed(2)}`, 'Normal']);
          });
          break;

        case 'quality':
        case 'quality report':
          headers = ['Batch ID', 'Line', 'Machine', 'Sample Size', 'Passed Units', 'Failed Units', 'Yield Rate (%)', 'Primary Defect'];
          rows = [
            ['BATCH-9021', 'Line 1', 'CNC-01', '500', '495', '5', '99.0%', 'Surface Roughness'],
            ['BATCH-9022', 'Line 2', 'PRESS-02', '600', '582', '18', '97.0%', 'Dimensional Tolerance'],
            ['BATCH-9023', 'Line 2', 'CNC-02', '450', '420', '30', '93.3%', 'Thermal Distortion'],
            ['BATCH-9024', 'Line 3', 'CONV-01', '800', '796', '4', '99.5%', 'Packaging Seal']
          ];
          break;

        case 'performance':
        case 'performance report':
          headers = ['Machine ID', 'Line', 'Availability (%)', 'Performance (%)', 'Quality (%)', 'Overall OEE (%)', 'Downtime (min)'];
          state.machines.forEach(m => {
            const avail = (m.status === 'Running' ? 95 : (m.status === 'Idle' ? 70 : 40));
            const perf = (parseFloat(m.load) || 80);
            const qual = 98.5;
            const oee = ((avail * perf * qual) / 10000).toFixed(1);
            rows.push([m.id, m.line, `${avail}%`, `${perf}%`, `${qual}%`, `${oee}%`, m.status === 'Running' ? 12 : 145]);
          });
          break;

        case 'downtime':
        case 'downtime report':
          headers = ['Incident ID', 'Date & Time', 'Machine ID', 'Category', 'Duration (mins)', 'Root Cause', 'Technician'];
          rows = [
            ['INC-401', `${dateStr} 08:30`, 'CNC-02', 'Overheating', '45', 'Coolant pump flow restriction', 'Priya Sharma'],
            ['INC-402', `${dateStr} 09:15`, 'CONV-01', 'Mechanical Jam', '25', 'Drive belt misalignment', 'Vikash Singh'],
            ['INC-403', `${dateStr} 11:00`, 'PRESS-02', 'Tool Change', '15', 'Scheduled die swap', 'Vikash Singh']
          ];
          break;

        case 'maintenance':
        case 'maintenance report':
          headers = ['Task ID', 'Task Name', 'Machine ID', 'Type', 'Priority', 'Due Date', 'Status', 'Technician', 'Notes'];
          state.maintenanceTasks.forEach(t => {
            rows.push([t.id, t.task, t.machine, t.type, t.priority, t.dueDate, t.status, t.technician, `"${t.notes}"`]);
          });
          break;

        default:
          headers = ['Timestamp', 'Record ID', 'Module', 'Description', 'Severity / Status'];
          rows = [
            [now.toISOString(), 'GEN-01', 'DRYFTQ Plant', 'Custom Export Data', 'Generated']
          ];
          break;
      }

      // Convert to CSV string
      const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      this.toast(`Exported ${filename} successfully.`, 'success', 'Report Exported');
    },

    // Global Search Setup
    setupGlobalSearch: function (inputSelector) {
      const input = document.querySelector(inputSelector);
      if (!input) return;

      const parent = input.parentElement;
      if (!parent) return;

      let dropdown = parent.querySelector('.dryftq-search-results');
      if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.className = 'dryftq-search-results p-2 space-y-1';
        parent.style.position = 'relative';
        parent.appendChild(dropdown);
      }

      input.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (!query) {
          dropdown.classList.remove('active');
          dropdown.innerHTML = '';
          return;
        }

        const state = this.getState();
        const results = [];

        // Search machines
        state.machines.forEach(m => {
          if (m.id.toLowerCase().includes(query) || m.name.toLowerCase().includes(query) || m.line.toLowerCase().includes(query)) {
            results.push({
              category: 'Machine',
              title: `${m.id} - ${m.name}`,
              subtitle: `Line: ${m.line} | Status: ${m.status} | Load: ${m.load}`,
              url: this.getPageUrl('machines', { machine: m.id })
            });
          }
        });

        // Search alerts
        state.alerts.forEach(a => {
          if (a.title.toLowerCase().includes(query) || a.description.toLowerCase().includes(query) || a.machineId.toLowerCase().includes(query)) {
            results.push({
              category: 'Alert',
              title: `${a.severity}: ${a.title}`,
              subtitle: `${a.machineName} | Status: ${a.status} | ${a.reading}`,
              url: this.getPageUrl('alerts', { alertId: a.id })
            });
          }
        });

        // Search maintenance
        state.maintenanceTasks.forEach(t => {
          if (t.task.toLowerCase().includes(query) || t.machine.toLowerCase().includes(query) || t.technician.toLowerCase().includes(query)) {
            results.push({
              category: 'Maintenance',
              title: `${t.task} (${t.machine})`,
              subtitle: `Due: ${t.dueDate} | Assigned to: ${t.technician} | ${t.status}`,
              url: this.getPageUrl('maintenance', { taskId: t.id })
            });
          }
        });

        // Search team
        state.team.forEach(u => {
          if (u.name.toLowerCase().includes(query) || u.department.toLowerCase().includes(query) || u.role.toLowerCase().includes(query)) {
            results.push({
              category: 'Team Member',
              title: u.name,
              subtitle: `${u.role} · ${u.department}`,
              url: this.getPageUrl('team', { search: u.name })
            });
          }
        });

        if (results.length === 0) {
          dropdown.innerHTML = '<div class="p-3 text-xs text-slate-400 text-center">No matching records found</div>';
        } else {
          dropdown.innerHTML = results.slice(0, 6).map(r => `
            <a href="${escapeHtml(r.url)}" class="block p-2.5 rounded-lg hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-800">${escapeHtml(r.title)}</span>
                <span class="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">${escapeHtml(r.category)}</span>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5 truncate">${escapeHtml(r.subtitle)}</p>
            </a>
          `).join('');
        }
        dropdown.classList.add('active');
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!parent.contains(e.target)) {
          dropdown.classList.remove('active');
        }
      });
    },

    // Complete Dynamic Sidebar Generator
    renderSidebar: function (activePageKey) {
      if (typeof document === 'undefined' || !document.getElementById) return;
      const container = document.getElementById('dryftq-sidebar-container');
      if (!container) return;

      const activeAlerts = this.getActiveAlertCount();
      const pages = [
        { key: 'dashboard', name: 'Dashboard', icon: '<path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke-linecap="round" stroke-linejoin="round"/>' },
        { key: 'analytics', name: 'Analytics', icon: '<path d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round"/>' },
        { key: 'machines', name: 'Machines', icon: '<rect height="6" rx="1.5" width="6" x="4" y="4"/><rect height="6" rx="1.5" width="6" x="14" y="4"/><rect height="6" rx="1.5" width="6" x="4" y="14"/><rect height="6" rx="1.5" width="6" x="14" y="14"/>' },
        { key: 'alerts', name: 'Alerts', icon: '<path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke-linecap="round" stroke-linejoin="round"/>', hasBadge: true },
        { key: 'reports', name: 'Reports', icon: '<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-linecap="round" stroke-linejoin="round"/>' },
        { key: 'maintenance', name: 'Maintenance', icon: '<path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>' },
        { key: 'integrations', name: 'Integrations', icon: '<path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" stroke-linecap="round" stroke-linejoin="round"/>' },
        { key: 'team', name: 'Team Management', icon: '<path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" stroke-linecap="round" stroke-linejoin="round"/>' },
        { key: 'settings', name: 'Settings', icon: '<path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" stroke-linecap="round" stroke-linejoin="round"/>' }
      ];

      const navHtml = pages.map(p => {
        const isActive = p.key === activePageKey;
        const activeClass = isActive
          ? 'bg-[#FF3D0A] text-white font-bold shadow-md shadow-orange-900/30'
          : 'text-slate-300 hover:text-white hover:bg-[#0c2e4f] font-medium';
        const url = this.getPageUrl(p.key);

        let badgeHtml = '';
        if (p.hasBadge && activeAlerts > 0) {
          badgeHtml = `<span class="w-5 h-5 rounded-full ${isActive ? 'bg-white text-[#FF3D0A]' : 'bg-[#FF3D0A] text-white'} text-xs font-bold flex items-center justify-center shrink-0">${activeAlerts}</span>`;
        }

        return `
          <a href="${url}" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] transition-all group ${activeClass}">
            <div class="flex items-center gap-3.5">
              <svg class="w-5 h-5 stroke-[1.8] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                ${p.icon}
              </svg>
              <span>${p.name}</span>
            </div>
            ${badgeHtml}
          </a>
        `;
      }).join('');

      container.innerHTML = `
        <div class="flex flex-col flex-1 overflow-y-auto dryftq-scrollbar">
          <div class="flex items-center justify-between px-7 pt-7 pb-5">
            <span class="text-2xl font-black tracking-wider text-white">DRYFTQ</span>
            <span class="text-[11px] font-bold px-2 py-0.5 rounded bg-[#0c2e4f] text-orange-400">v2.0</span>
          </div>
          <div class="h-[1px] bg-[#0c2e4f] mx-6 mb-3"></div>
          <nav class="px-5 space-y-1.5" data-purpose="sidebar-nav">
            ${navHtml}
          </nav>
        </div>

        <div class="px-6 pb-6 pt-4 space-y-4 border-t border-[#0c2e4f]/80">
          <div class="flex items-start gap-3">
            <span class="relative flex h-3.5 w-3.5 mt-1 shrink-0">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-brandDark ring-2 ring-emerald-500/50"></span>
            </span>
            <p class="text-xs leading-snug text-slate-300 font-normal">
              AI-powered telemetry streaming & anomaly intelligence.
            </p>
          </div>
          <div class="flex items-center gap-2.5 text-xs text-emerald-400 font-semibold">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>All Systems Operational</span>
          </div>
        </div>
      `;

      // Keep every href valid for the active protocol (HTTP vs file://)
      this.syncLinksToProtocol();
    },

    // Unified Sidebar & Header Setup
    setupNavigation: function (activePageKey) {
      const activeAlerts = this.getActiveAlertCount();

      // Fix and bind all sidebar navigation links
      const navLinks = document.querySelectorAll('aside nav a, aside [data-purpose="sidebar-navigation"] a');
      navLinks.forEach(link => {
        const text = link.textContent.trim().toLowerCase();
        let targetKey = null;

        if (text.includes('dashboard')) targetKey = 'dashboard';
        else if (text.includes('analytic')) targetKey = 'analytics';
        else if (text.includes('machine')) targetKey = 'machines';
        else if (text.includes('alert')) targetKey = 'alerts';
        else if (text.includes('report')) targetKey = 'reports';
        else if (text.includes('maint')) targetKey = 'maintenance';
        else if (text.includes('integrat')) targetKey = 'integrations';
        else if (text.includes('team')) targetKey = 'team';
        else if (text.includes('setting')) targetKey = 'settings';

        if (targetKey) {
          link.href = this.getPageUrl(targetKey);

          // Update alert badge count if this is the Alerts link
          if (targetKey === 'alerts') {
            const badge = link.querySelector('span.rounded-full, span.bg-\\[\\#ff4d15\\], span.bg-\\[\\#ff511c\\], span.bg-\\[\\#f04e1e\\], span.bg-\\[\\#FF4A1C\\], span.bg-\\[\\#FF4D26\\]');
            if (badge) {
              badge.textContent = activeAlerts;
              badge.style.display = activeAlerts > 0 ? 'inline-flex' : 'none';
            }
          }

          // Active indicator check
          if (targetKey === activePageKey) {
            link.classList.remove('text-slate-300', 'text-slate-400', 'hover:bg-white/5', 'hover:bg-[#0d223f]', 'hover:bg-white/5');
            link.classList.add('bg-[#ff4d15]', 'text-white', 'font-semibold', 'shadow-md');
          }
        }
      });

      // Setup bell notification buttons to toggle a quick notifications modal/dropdown
      const bellButtons = document.querySelectorAll('button[aria-label="Notifications"], button[aria-label="System Alerts"], button[aria-label="Alerts"]');
      bellButtons.forEach(btn => {
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openNotificationsDrawer();
        });
      });

      // User Profile Quick Actions
      const userProfilePills = document.querySelectorAll('[data-purpose="user-profile"], header .flex.items-center.gap-3, header .flex.items-center.gap-4');
      userProfilePills.forEach(pill => {
        const nameEl = pill.querySelector('h4, span, div.font-bold');
        if (nameEl && (nameEl.textContent.includes('Aditya') || nameEl.textContent.includes('Adiba'))) {
          pill.style.cursor = 'pointer';
          pill.title = 'Click to open Settings & Profile';
          pill.addEventListener('click', () => {
            this.navigateTo('settings');
          });
        }
      });

      // Global search auto-attach
      this.setupGlobalSearch('input[placeholder*="Search"]');

      // Keep every href valid for the active protocol (HTTP vs file://)
      this.syncLinksToProtocol();
    },

    openNotificationsDrawer: function () {
      const state = this.getState();
      let modal = document.getElementById('dryftq-notifications-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'dryftq-notifications-modal';
        modal.className = 'dryftq-modal-backdrop';
        modal.innerHTML = `
          <div class="dryftq-modal-content w-full max-w-lg p-6 bg-white rounded-2xl shadow-2xl">
            <div class="flex items-center justify-between pb-4 border-b border-slate-100">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-orange-100 text-brandOrange flex items-center justify-center font-bold">
                  🔔
                </div>
                <div>
                  <h3 class="text-base font-bold text-slate-900">Notifications & System Events</h3>
                  <p class="text-xs text-slate-500">Real-time alerts and maintenance feed</p>
                </div>
              </div>
              <button type="button" aria-label="Close notifications" class="dryftq-notifications-close text-slate-400 hover:text-slate-700 p-1 rounded-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round"></path></svg>
              </button>
            </div>
            <div class="py-4 space-y-3 max-h-[60vh] overflow-y-auto" id="dryftq-notifications-list">
            </div>
            <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <a href="${this.getPageUrl('alerts')}" class="font-bold text-[#ff4d15] hover:underline">View All Alerts &rarr;</a>
              <a href="${this.getPageUrl('maintenance')}" class="font-semibold text-slate-600 hover:underline">View Maintenance &rarr;</a>
            </div>
          </div>
        `;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-label', 'Notifications and system events');
        document.body.appendChild(modal);
        const closeNotifications = () => modal.classList.remove('open');
        modal.addEventListener('click', (e) => {
          if (e.target === modal || e.target.closest('.dryftq-notifications-close')) closeNotifications();
        });
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && modal.classList.contains('open')) closeNotifications();
        });
      }

      const listContainer = modal.querySelector('#dryftq-notifications-list');
      const activeAlerts = state.alerts.filter(a => a.status === 'Active');
      
      let html = '';
      if (activeAlerts.length > 0) {
        html += '<h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Active Alerts</h4>';
        activeAlerts.forEach(al => {
          html += `
            <div class="p-3 rounded-xl bg-red-50 border border-red-100 flex items-center justify-between">
              <div class="space-y-0.5">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-red-500"></span>
                  <h5 class="text-xs font-bold text-slate-900">${escapeHtml(al.title)} (${escapeHtml(al.severity)})</h5>
                </div>
                <p class="text-[11px] text-slate-600 pl-4">${escapeHtml(al.details)} · ${escapeHtml(al.machineName)}</p>
              </div>
              <a href="${this.getPageUrl('alerts', { alertId: al.id })}" class="px-2.5 py-1 text-xs font-semibold bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 shadow-xs">Review</a>
            </div>
          `;
        });
      }

      html += '<h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mt-4 mb-1">Recent Activity</h4>';
      state.recentEvents.slice(0, 5).forEach(ev => {
        html += `
          <div class="flex items-center justify-between py-2 border-b border-slate-50 last:border-0 text-xs">
            <div class="flex items-center gap-2 text-slate-700">
              <span class="font-bold text-slate-900 text-[11px]">${escapeHtml(ev.time)}</span>
              <span>${escapeHtml(ev.title)}</span>
            </div>
            <span class="text-[10px] font-medium text-slate-400">${escapeHtml(ev.machineId || 'System')}</span>
          </div>
        `;
      });

      listContainer.innerHTML = html;
      modal.classList.add('open');
    }
  };

  // Listen for storage changes across browser tabs
  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('dryftq:state-change', { detail: Dryftq.getState() }));
      }
    });
  }

  window.Dryftq = Dryftq;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Dryftq;
  }
})(typeof window !== 'undefined' ? window : global);
