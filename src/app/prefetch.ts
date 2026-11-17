/**
 * Route prefetching. Vite already splits every console module into its own
 * chunk; warming the chunk on hover/focus removes the network leg from a click
 * so navigation feels instant. The landing page is part of the entry bundle
 * and needs no prefetch.
 */
const LOADERS: Record<string, () => Promise<unknown>> = {
  '/dashboard': () => import('../pages/DashboardPage'),
  '/analytics': () => import('../pages/AnalyticsPage'),
  '/machines': () => import('../pages/MachinesPage'),
  '/alerts': () => import('../pages/AlertsPage'),
  '/reports': () => import('../pages/ReportsPage'),
  '/maintenance': () => import('../pages/MaintenancePage'),
  '/integrations': () => import('../pages/IntegrationsPage'),
  '/team': () => import('../pages/TeamPage'),
  '/settings': () => import('../pages/SettingsPage'),
};

const warmed = new Set<string>();

export function prefetchRoute(path: string): void {
  const key = path.split(/[?#]/)[0] ?? path;
  const load = LOADERS[key];
  if (!load || warmed.has(key)) return;
  warmed.add(key);
  void load();
}
