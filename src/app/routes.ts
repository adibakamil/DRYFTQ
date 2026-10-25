import type { IconName } from '../components/Icon';

/** A navigable console module. Order defines sidebar order. */
export interface ModuleRoute {
  key: string;
  path: string;
  title: string;
  icon: IconName;
  /** Short label for mobile / breadcrumbs. */
  short?: string;
}

/**
 * The nine plant-operations modules.
 * Paths match the legacy clean URLs (`shared/dryftq-routes.js`) so every
 * bookmark saved against the old site keeps resolving.
 */
export const MODULE_ROUTES: ModuleRoute[] = [
  { key: 'dashboard', path: '/dashboard', title: 'Dashboard', icon: 'grid' },
  { key: 'analytics', path: '/analytics', title: 'Analytics', icon: 'chart' },
  { key: 'machines', path: '/machines', title: 'Machines', icon: 'server' },
  { key: 'alerts', path: '/alerts', title: 'Alerts', icon: 'bell' },
  { key: 'reports', path: '/reports', title: 'Reports', icon: 'file' },
  { key: 'maintenance', path: '/maintenance', title: 'Maintenance', icon: 'wrench' },
  { key: 'integrations', path: '/integrations', title: 'Integrations', icon: 'plug' },
  { key: 'team', path: '/team', title: 'Team Management', icon: 'users', short: 'Team' },
  { key: 'settings', path: '/settings', title: 'Settings & Profile', icon: 'cog', short: 'Settings' },
];

/** Resolve the current pathname to its module (case-insensitive, like the legacy server). */
export function findRoute(pathname: string): ModuleRoute | undefined {
  const clean = pathname.replace(/\/+$/, '') || '/';
  return MODULE_ROUTES.find((r) => r.path.toLowerCase() === clean.toLowerCase());
}

/** Is this pathname inside the console (not the marketing site)? */
export function isConsolePath(pathname: string): boolean {
  return Boolean(findRoute(pathname));
}
