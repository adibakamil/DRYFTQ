import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { MODULE_ROUTES, findRoute } from './routes';
import { useStore } from '../store/context';
import { cx } from '../lib/utils';
import { Icon, type IconName } from '../components/Icon';
import { Modal, SearchInput, StatusBadge, AlertStatusBadge, EmptyState } from '../components/ui';
import type { PlantState } from '../lib/types';

/* ------------------------------------------------------------------ */
/* Global search — machines, alerts, tasks, people and integrations.  */
/* ------------------------------------------------------------------ */

interface SearchResult {
  id: string;
  label: string;
  sublabel: string;
  icon: IconName;
  path: string;
}

function searchPlant(state: PlantState, query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hit = (...fields: string[]) => fields.some((f) => String(f ?? '').toLowerCase().includes(q));

  const results: SearchResult[] = [];
  for (const m of state.machines) {
    if (hit(m.id, m.name, m.line, m.type)) {
      results.push({ id: `m:${m.id}`, label: m.id, sublabel: `${m.name} · ${m.line}`, icon: 'server', path: '/machines' });
    }
  }
  for (const a of state.alerts) {
    if (hit(a.id, a.title, a.machineName)) {
      results.push({ id: `a:${a.id}`, label: a.title, sublabel: `${a.id} · ${a.machineName}`, icon: 'bell', path: '/alerts' });
    }
  }
  for (const t of state.maintenanceTasks) {
    if (hit(t.id, t.task, t.machine, t.technician)) {
      results.push({ id: `t:${t.id}`, label: t.task, sublabel: `${t.id} · ${t.machine}`, icon: 'wrench', path: '/maintenance' });
    }
  }
  for (const p of state.team) {
    if (hit(p.name, p.email, p.role)) {
      results.push({ id: `p:${p.id}`, label: p.name, sublabel: `${p.role} · ${p.email}`, icon: 'users', path: '/team' });
    }
  }
  for (const i of state.integrations) {
    if (hit(i.name, i.category, i.endpoint)) {
      results.push({ id: `i:${i.id}`, label: i.name, sublabel: i.category, icon: 'plug', path: '/integrations' });
    }
  }
  return results.slice(0, 8);
}

/* ------------------------------------------------------------------ */
/* Notifications drawer                                               */
/* ------------------------------------------------------------------ */

function NotificationsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, actions } = useStore();
  const active = state.alerts.filter((a) => a.status !== 'Resolved');

  return (
    <Modal open={open} onClose={onClose} size="md" tone="dark" aria-label="System notifications" panelClassName="!bg-[#07243e]">
      <div className="border-b border-[#0d3459] px-1 pb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Plant Feed</span>
        <h2 className="mt-1 text-lg font-bold text-white">Notifications</h2>
        <p className="mt-0.5 text-sm text-slate-400">
          {active.filter((a) => a.status === 'Active').length} active · {state.recentEvents.length} recent events
        </p>
      </div>

      <div className="thin-scroll mt-3 max-h-[55vh] space-y-3 overflow-y-auto pr-1">
        {active.length === 0 && (
          <EmptyState tone="dark" icon="check" title="You're all caught up" message="No open alerts on the plant floor." />
        )}
        {active.map((alert) => (
          <article key={alert.id} className="rounded-xl border border-[#0d3459] bg-[#031B30]/70 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{alert.title}</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {alert.machineName} · {alert.date} {alert.time}
                </p>
              </div>
              <StatusBadge dark value={alert.severity} />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">{alert.description}</p>
            <div className="mt-2.5 flex items-center gap-2">
              <AlertStatusBadge dark dot={false} status={alert.status} />
              <div className="ml-auto flex gap-2">
                {alert.status === 'Active' && (
                  <button
                    type="button"
                    className="btn btn-sm !min-h-[30px] rounded-lg bg-white/10 text-white hover:bg-white/20"
                    onClick={() => actions.acknowledgeAlert(alert.id)}
                  >
                    Acknowledge
                  </button>
                )}
                <Link
                  to="/alerts"
                  onClick={onClose}
                  className="btn btn-sm !min-h-[30px] rounded-lg bg-[#FF3D0A] text-white hover:bg-[#e03405]"
                >
                  Open
                </Link>
              </div>
            </div>
          </article>
        ))}

        <div>
          <h3 className="console-label mb-2 mt-4">Recent events</h3>
          <ol className="space-y-2">
            {state.recentEvents.slice(0, 6).map((e, i) => (
              <li key={`${e.time}-${i}`} className="flex items-start gap-2.5 text-xs">
                <span
                  className={cx(
                    'mt-1 h-1.5 w-1.5 flex-none rounded-full',
                    e.severity === 'critical' ? 'bg-red-400' : e.severity === 'warning' ? 'bg-amber-400' : 'bg-sky-400',
                  )}
                />
                <span className="flex-1 text-slate-300">{e.title}</span>
                <time className="font-mono text-slate-500">{e.time}</time>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Shell                                                              */
/* ------------------------------------------------------------------ */

/**
 * Console layout shared by all nine modules: sidebar navigation, top bar
 * with global search + notifications + operator pill, and the routed page.
 */
export function AppShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { state } = useStore();
  const route = findRoute(pathname);

  const [navOpen, setNavOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const searchId = 'global-search';

  const activeAlerts = useMemo(() => state.alerts.filter((a) => a.status === 'Active'), [state.alerts]);
  const results = useMemo(() => searchPlant(state, query), [state, query]);

  // Close transient surfaces when the operator navigates.
  useEffect(() => {
    setNavOpen(false);
    setQuery('');
  }, [pathname]);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setQuery('');
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  // The console modules render a white palette: `body.console-light` activates
  // the remap layer in index.css that turns the dark console surfaces into
  // light ones. It lives on <body> (not the wrapper div) so dialogs and toasts
  // that portal directly to document.body are themed as well.
  useEffect(() => {
    document.body.classList.add('console-light');
    return () => document.body.classList.remove('console-light');
  }, []);

  const pick = (result: SearchResult) => {
    setQuery('');
    navigate(result.path);
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-[#0d3459] px-5 py-4">
        <Link to="/" className="text-xl font-black tracking-tight text-white" aria-label="DRYFTQ home">
          DRYFTQ
        </Link>
        <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-300">v2.4</span>
      </div>

      <nav aria-label="Console" className="thin-scroll flex-1 overflow-y-auto px-3 py-4">
        <p className="console-label mb-2 px-2">Plant Operations</p>
        <ul className="space-y-1">
          {MODULE_ROUTES.map((item) => (
            <li key={item.key}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cx(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                    isActive
                      ? 'bg-[#FF3D0A] text-white shadow-lg shadow-orange-900/30'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white',
                  )
                }
              >
                <Icon name={item.icon} className="h-[18px] w-[18px]" />
                <span className="flex-1">{item.title}</span>
                {item.key === 'alerts' && activeAlerts.length > 0 && (
                  <span
                    className={cx(
                      'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                      activeAlerts.some((a) => a.severity === 'Critical')
                        ? 'bg-red-500 text-white'
                        : 'bg-amber-400 text-amber-950',
                    )}
                  >
                    {activeAlerts.length}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-[#0d3459] px-5 py-4">
        <p className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" aria-hidden />
          Telemetry: Active
        </p>
        <p className="mt-1 text-[11px] text-slate-500">Line 3 · Shift A</p>
      </div>
    </div>
  );

  return (
    <div className="console-scope min-h-screen bg-brand-console text-slate-200">
      {/* Desktop sidebar (`.console-sidebar` keeps it dark navy — the light
          remap layer in index.css excludes it) */}
      <aside className="console-sidebar fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[#0d3459] bg-[#04223c] lg:block">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {navOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setNavOpen(false)} aria-hidden />
          <div className="console-sidebar absolute inset-y-0 left-0 w-72 border-r border-[#0d3459] bg-[#04223c] animate-fade-in">{sidebar}</div>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-[#0d3459] bg-[#031B30]/95 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 lg:hidden"
              aria-expanded={navOpen}
              aria-label={navOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setNavOpen((v) => !v)}
            >
              <Icon name={navOpen ? 'close' : 'menu'} className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-bold text-white sm:text-lg">{route?.title ?? 'Plant Operations'}</h1>
              <p className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 font-semibold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live
                </span>
                <span className="font-mono">
                  {state.machines.length} assets · {activeAlerts.length} active alerts
                </span>
              </p>
            </div>

            {/* Global search */}
            <div ref={searchRef} className="relative hidden w-64 md:block">
              <SearchInput
                id={searchId}
                aria-label="Search machines, alerts, people"
                placeholder="Search plant…"
                value={query}
                onChange={setQuery}
                onClear={() => setQuery('')}
                className="[&_input]:border-white/10 [&_input]:bg-white/5 [&_input]:text-white [&_input]:placeholder-slate-500"
              />
              {query.trim() && (
                <div className="absolute right-0 top-full z-50 mt-2 w-full min-w-[19rem] overflow-hidden rounded-xl border border-[#0d3459] bg-[#07243e] shadow-pop animate-fade-in">
                  {results.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-slate-400">No matches for “{query}”.</p>
                  ) : (
                    <ul className="max-h-80 overflow-y-auto py-1">
                      {results.map((r) => (
                        <li key={r.id}>
                          <button
                            type="button"
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5"
                            onClick={() => pick(r)}
                          >
                            <Icon name={r.icon} className="h-4 w-4 text-slate-400" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold text-white">{r.label}</span>
                              <span className="block truncate text-xs text-slate-400">{r.sublabel}</span>
                            </span>
                            <Icon name="arrow" className="h-3.5 w-3.5 text-slate-500" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Notifications */}
            <button
              type="button"
              onClick={() => setNotifOpen(true)}
              aria-label={`Notifications, ${activeAlerts.length} active alerts`}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10"
            >
              <Icon name="bell" className="h-5 w-5" />
              {activeAlerts.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF3D0A] px-1 text-[10px] font-bold text-white">
                  {activeAlerts.length}
                </span>
              )}
            </button>

            {/* Operator pill */}
            <Link
              to="/settings"
              className="flex items-center gap-2 rounded-lg border border-[#0d3459] bg-white/5 py-1.5 pl-1.5 pr-3 hover:bg-white/10"
              title="Profile & settings"
            >
              <img
                src={state.user.avatar}
                alt=""
                width={30}
                height={30}
                className="h-[30px] w-[30px] rounded-md object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"%3E%3Crect width="32" height="32" rx="6" fill="%231E242B"/%3E%3Ctext x="16" y="21" font-family="sans-serif" font-size="14" font-weight="700" fill="%23FF5A1F" text-anchor="middle"%3ED%3C/text%3E%3C/svg%3E';
                }}
              />
              <span className="hidden text-left leading-tight sm:block">
                <span className="block text-xs font-bold text-white">{state.user.name}</span>
                <span className="block text-[11px] text-slate-400">{state.user.role}</span>
              </span>
            </Link>
          </div>
        </header>

        {/* Routed module */}
        <main id="main" className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>

        <footer className="border-t border-[#0d3459] px-4 py-5 text-center text-xs text-slate-500 sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} DRYFTQ · Demo build — telemetry is simulated, no data leaves this browser.
          </p>
        </footer>
      </div>

      <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />

      {/* Screen-reader route announcement */}
      <div className="sr-only" aria-live="polite">
        {route ? `${route.title} page` : ''}
      </div>
    </div>
  );
}
