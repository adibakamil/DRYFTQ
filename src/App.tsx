import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { StoreProvider } from './store/StoreProvider';
import { ToastHost } from './components/ui';
import { AppShell } from './app/AppShell';
import { NotFound } from './components/NotFound';

const LandingPage = lazy(() => import('./features/landing/LandingPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const MachinesPage = lazy(() => import('./pages/MachinesPage'));
const AlertsPage = lazy(() => import('./pages/AlertsPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const MaintenancePage = lazy(() => import('./pages/MaintenancePage'));
const IntegrationsPage = lazy(() => import('./pages/IntegrationsPage'));
const TeamPage = lazy(() => import('./pages/TeamPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <span className="inline-flex items-center gap-3 text-sm font-medium text-gray-500">
        <svg className="h-5 w-5 animate-spin text-brand-action" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
          <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        Loading module…
      </span>
    </div>
  );
}

/**
 * Routes.
 * `/` is the marketing site; the nine console modules keep the exact clean
 * URLs the legacy server exposed, so bookmarks survive the migration.
 */
export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/machines" element={<MachinesPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/maintenance" element={<MaintenancePage />} />
              <Route path="/integrations" element={<IntegrationsPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              {/* Legacy alias: the old server redirected index.html → /dashboard */}
              <Route path="/index.html" element={<DashboardPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <ToastHost />
    </StoreProvider>
  );
}
