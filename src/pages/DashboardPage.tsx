import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/context';
import { Icon } from '../components/Icon';
import { computeOee, cx } from '../lib/utils';
import PerformanceOverview from '../features/dashboard/PerformanceOverview';
import QuantumDriftCore from '../features/dashboard/QuantumDriftCore';
import type { RecentEvent } from '../lib/types';

/* ------------------------------------------------------------------ */
/* KPI card                                                            */
/* ------------------------------------------------------------------ */

interface KpiCardProps {
  label: string;
  /** Legacy `title` tooltip, kept verbatim. */
  hint: string;
  onGo: () => void;
  children: ReactNode;
}

function KpiCard({ label, hint, onGo, children }: KpiCardProps) {
  return (
    <button
      type="button"
      title={hint}
      onClick={onGo}
      className="console-card-solid group flex flex-col justify-between rounded-2xl p-5 text-left transition-all hover:border-white/20 hover:bg-white/[0.07]"
    >
      <span className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 transition-colors group-hover:text-slate-200">{label}</span>
        <span className="text-xs text-slate-500 transition-colors group-hover:text-slate-300">&rarr;</span>
      </span>
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Bottom widgets                                                      */
/* ------------------------------------------------------------------ */

function severityDiamond(severity: RecentEvent['severity']): string {
  if (severity === 'critical') return 'bg-red-500';
  if (severity === 'warning') return 'bg-amber-500';
  return 'bg-blue-500';
}

/** Urgent alert banner + recent events log — ported from the legacy bottom grid. */
function BottomWidgets() {
  const { state } = useStore();
  const navigate = useNavigate();

  const activeAlerts = useMemo(() => state.alerts.filter((a) => a.status === 'Active'), [state.alerts]);
  const topAlert = activeAlerts[0];
  const recentEvents = useMemo(() => state.recentEvents.slice(0, 3), [state.recentEvents]);

  const openAlerts = () => navigate(topAlert ? `/alerts?alertId=${topAlert.id}` : '/alerts');

  return (
    <section className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2" data-purpose="bottom-widgets">
      {/* Urgent Alert Card Banner */}
      <button
        id="urgent-alert-banner"
        type="button"
        onClick={openAlerts}
        title="Click to view alert details"
        className="flex cursor-pointer items-center justify-between rounded-3xl bg-gradient-to-r from-[#ff4d15] to-[#f94105] p-5 text-left text-white shadow-md shadow-orange-500/20 transition-all hover:shadow-lg sm:p-6"
      >
        <span className="flex items-center gap-4 sm:gap-5">
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-sm sm:h-14 sm:w-14">
            <span className="text-xl font-black text-white sm:text-2xl">A</span>
          </span>
          <span className="space-y-1">
            <span id="urgent-alert-title" className="block text-base font-extrabold tracking-tight sm:text-lg">
              {topAlert ? topAlert.title : 'All Systems Normal'}
            </span>
            <span id="urgent-alert-desc" className="block text-xs font-medium text-orange-100 sm:text-sm">
              {topAlert ? `${topAlert.description} (${topAlert.machineName})` : 'No critical anomalies detected across lines'}
            </span>
            <span id="urgent-alert-rec" className="block text-xs font-normal text-orange-200/90 sm:text-sm">
              {topAlert ? `Reading: ${topAlert.reading} (Threshold: ${topAlert.threshold})` : 'Continuous AI monitoring engaged.'}
            </span>
          </span>
        </span>
        {/* Action Navigation Affordance */}
        <span aria-label="View Anomaly Details" className="p-2 text-white transition-colors">
          <svg className="h-6 w-6 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {/* Recent Events Log Panel */}
      <div className="console-card-solid flex flex-col justify-between rounded-3xl p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Recent Events</h3>
          <button
            type="button"
            onClick={() => navigate('/alerts')}
            className="text-xs font-semibold text-slate-400 transition-colors hover:text-white"
          >
            View all
          </button>
        </div>
        {/* Events List Container */}
        <div id="recent-events-list" className="space-y-3">
          {recentEvents.map((ev, i) => (
            <button
              key={`${ev.time}-${i}`}
              type="button"
              onClick={() => navigate('/alerts')}
              className="flex w-full cursor-pointer items-center rounded-lg p-1 text-left text-xs text-slate-300 transition-colors hover:bg-white/5 sm:text-sm"
            >
              <span className={cx('mr-3 h-2.5 w-2.5 flex-shrink-0 rotate-45', severityDiamond(ev.severity))} />
              <span className="w-14 flex-shrink-0 font-bold text-white">{ev.time}</span>
              <span className="truncate text-slate-400">{ev.title}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

/**
 * Dashboard / overview module — page banner, KPI row, performance chart
 * with vibration sub-metrics, and the urgent-alert / recent-events grid.
 * Ported from the legacy `DRYFTQ DASHBOARD 1/code.html`.
 */
export default function DashboardPage() {
  const { state, notify } = useStore();
  const navigate = useNavigate();

  const [refreshing, setRefreshing] = useState(false);
  const refreshTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (refreshTimer.current !== null) window.clearTimeout(refreshTimer.current);
    },
    [],
  );

  // Live KPI roll-ups driving the status cards.
  const runningCount = state.machines.filter((m) => m.status === 'Running').length;
  const runningRatio = state.machines.length ? runningCount / state.machines.length : 1;
  const machineHealthOk = runningRatio >= 0.7;

  const activeAlertCount = state.alerts.filter((a) => a.status === 'Active').length;
  const anomalyStable = activeAlertCount <= 3;

  const plantOee = state.machines.length
    ? Math.round((state.machines.reduce((sum, m) => sum + computeOee(m), 0) / state.machines.length) * 10) / 10
    : 0;
  // Demo plant baseline sits near 55% — flag efficiency only below 50%.
  const efficiencyOk = plantOee >= 50;

  const triggerTelemetryRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    refreshTimer.current = window.setTimeout(() => {
      setRefreshing(false);
      notify({
        message: 'Telemetry refreshed successfully from all machine sensors.',
        type: 'success',
        title: 'Streams Synchronized',
      });
    }, 700);
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      {/* Page Header */}
      <section className="space-y-1" data-purpose="page-title-banner">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Process Overview</h2>
            <p className="text-xs font-medium text-slate-400 sm:text-sm">Live Edge Telemetry &middot; Plant 4</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Live Telemetry Streaming
            </span>
            <button
              id="refresh-telemetry-btn"
              type="button"
              aria-label="Activity"
              title="Refresh Live Plant Telemetry"
              onClick={triggerTelemetryRefresh}
              className="p-2 text-slate-400 transition-colors hover:text-white"
            >
              <Icon name="bolt" className={refreshing ? 'h-5 w-5 animate-spin' : 'h-5 w-5'} />
            </button>
            <Link
              to="/"
              title="Open the DRYFTQ landing page"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#FF3D0A] px-3.5 py-2.5 text-xs font-bold text-white shadow-sm shadow-orange-500/25 transition-colors hover:bg-[#e03405] sm:w-auto"
            >
              <Icon name="grid" className="h-4 w-4" />
              Landing Page
              <Icon name="arrow" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* QUANTUM-DRIFT™ CORE — the updated hero telemetry card */}
      <QuantumDriftCore />

      {/* KPI Cards Grid — 3 status cards, then 2 summary cards (matches the app layout) */}
      <section className="space-y-4 sm:space-y-5" data-purpose="kpi-metrics-row">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
          {/* Card 1: Machine Health */}
          <KpiCard
            label="Machine Health"
            hint={`Click to view all machines — ${runningCount}/${state.machines.length} running`}
            onGo={() => navigate('/machines')}
          >
            <span className="mt-3 flex items-center gap-2">
              <span className={cx('h-2 w-2 rounded-full', machineHealthOk ? 'bg-emerald-400' : 'bg-amber-400')} />
              <span className="text-lg font-extrabold tracking-tight text-white">{machineHealthOk ? 'Healthy' : 'Attention'}</span>
            </span>
          </KpiCard>

          {/* Card 2: Anomaly Detection */}
          <KpiCard
            label="Anomaly Detection"
            hint={`Click to review active anomalies — ${activeAlertCount} active`}
            onGo={() => navigate('/alerts?status=Active')}
          >
            <span className="mt-3 flex items-center gap-2">
              <span className="h-0 w-0 border-b-[6px] border-l-[4px] border-r-[4px] border-b-emerald-400 border-l-transparent border-r-transparent" />
              <span className="text-lg font-extrabold tracking-tight text-white">{activeAlertCount > 0 ? 'Active' : 'Clear'}</span>
            </span>
          </KpiCard>

          {/* Card 3: Process Stability */}
          <KpiCard
            label="Process Stability"
            hint="Click to view analytics quality & stability"
            onGo={() => navigate('/analytics?tab=Quality')}
          >
            <span className="mt-3 flex items-center gap-2">
              <span className="flex h-2 w-2 items-center justify-center rounded-full border-2 border-emerald-400">
                <span className="h-1 w-1 rounded-full bg-emerald-400" />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-white">Stable</span>
            </span>
          </KpiCard>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          {/* Card 4: Anomaly Stability */}
          <KpiCard
            label="Anomaly Stability"
            hint={`Click to review anomaly trends — ${activeAlertCount} active alert${activeAlertCount === 1 ? '' : 's'}`}
            onGo={() => navigate('/alerts')}
          >
            <span className="mt-3 flex items-center gap-2">
              <span className={cx('h-2 w-2 rounded-full', anomalyStable ? 'bg-emerald-400' : 'bg-amber-400')} />
              <span className="text-lg font-extrabold tracking-tight text-white">{anomalyStable ? 'Stable' : 'Review'}</span>
            </span>
          </KpiCard>

          {/* Card 5: Overall Efficiency */}
          <KpiCard
            label="Overall Efficiency"
            hint={`Click to view OEE analytics — plant OEE ${plantOee}%`}
            onGo={() => navigate('/analytics?tab=OEE')}
          >
            <span className="mt-3 flex items-center gap-2">
              <span className={cx('h-2 w-2 rounded-full', efficiencyOk ? 'bg-emerald-400' : 'bg-amber-400')} />
              <span className="text-lg font-extrabold tracking-tight text-white">{efficiencyOk ? 'Stable' : 'Attention'}</span>
            </span>
          </KpiCard>
        </div>
      </section>

      {/* Performance Overview (chart + vibration sub-metrics) */}
      <PerformanceOverview />

      {/* Bottom Grid Widgets */}
      <BottomWidgets />
    </div>
  );
}
