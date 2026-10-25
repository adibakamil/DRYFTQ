import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToasts } from '../store/context';
import { cx } from '../lib/utils';
import {
  DATE_RANGES,
  METRIC_TABS,
  TAB_DATASETS,
  isMetricTab,
  type DateRange,
  type MetricTab,
} from '../features/analytics/data';
import DowntimeCard from '../features/analytics/DowntimeCard';
import OeeTrendCard from '../features/analytics/OeeTrendCard';
import PerformanceByAreaCard from '../features/analytics/PerformanceByAreaCard';
import EnergyConsumptionCard from '../features/analytics/EnergyConsumptionCard';

/**
 * Analytics module — metric perspectives, KPI cards, downtime donut, OEE
 * trend, performance-by-area bars and energy sparkline. Static demo data is
 * ported verbatim from the legacy `DRYFTQ DASHBOARD 2 (ANALYTICS)/code.html`;
 * the only plant state read is for the energy CSV export.
 */
export default function AnalyticsPage() {
  const { notify } = useToasts();
  const [searchParams, setSearchParams] = useSearchParams();

  // Deep-linked perspective — legacy only accepted keys in `tabDatasets`.
  const [tab, setTab] = useState<MetricTab>(() => {
    const param = searchParams.get('tab');
    return isMetricTab(param) ? param : 'Overview';
  });
  const [range, setRange] = useState<DateRange>('Last 7 Days');
  const [rangeMenuOpen, setRangeMenuOpen] = useState(false);
  const rangeRef = useRef<HTMLDivElement>(null);

  const machineId = searchParams.get('machine');

  // Legacy `switchTab()` also toasted on load when `?tab=` matched.
  const initialToastShown = useRef(false);
  useEffect(() => {
    if (initialToastShown.current) return;
    initialToastShown.current = true;
    const param = searchParams.get('tab');
    if (isMetricTab(param)) {
      notify({ message: `Analytics switched to ${param} perspective.`, type: 'info', title: 'Perspective Updated' });
    }
  }, [searchParams, notify]);

  // Close the date-range menu on outside click (legacy document listener).
  useEffect(() => {
    if (!rangeMenuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (rangeRef.current && !rangeRef.current.contains(event.target as Node)) setRangeMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [rangeMenuOpen]);

  // Legacy `switchTab()`.
  const switchTab = (next: MetricTab) => {
    setTab(next);
    notify({ message: `Analytics switched to ${next} perspective.`, type: 'info', title: 'Perspective Updated' });
  };

  // Legacy `setAnalyticsRange()`.
  const setAnalyticsRange = (next: DateRange) => {
    setRange(next);
    setRangeMenuOpen(false);
    notify({ message: `Time frame updated to ${next}.`, type: 'info', title: 'Date Range Filter' });
  };

  // Legacy `clearMachineFilter()`: drop the query (replace) + reset to Overview.
  const clearMachineFilter = () => {
    setSearchParams({}, { replace: true });
    switchTab('Overview');
  };

  const dataset = useMemo(() => TAB_DATASETS[tab], [tab]);
  const kpis = useMemo(
    () => [
      { label: 'OEE', value: dataset.oee, delta: dataset.oeeD },
      { label: 'Availability', value: dataset.avail, delta: dataset.availD },
      { label: 'Performance', value: dataset.perf, delta: dataset.perfD },
      { label: 'Quality', value: dataset.qual, delta: dataset.qualD },
    ],
    [dataset],
  );

  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      {/* Page Header */}
      <header className="space-y-1">
        <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Analytics</h2>
        <p className="text-xs font-medium text-slate-400 sm:text-sm">Deep insights for better decisions</p>
      </header>

      {/* Machine Filter Context Banner (appears when navigated with ?machine=…) */}
      {machineId && (
        <div
          id="machine-filter-banner"
          className="flex items-center justify-between rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-2.5 text-xs font-medium text-orange-200"
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-orange-400">Focused Analysis:</span>
            <span id="machine-filter-text">Machine {machineId}</span>
          </div>
          <button
            type="button"
            onClick={clearMachineFilter}
            className="rounded-lg border border-orange-500/40 bg-white/5 px-2.5 py-1 font-bold text-orange-300 transition-colors hover:bg-white/10"
          >
            Show Plant-Wide
          </button>
        </div>
      )}

      {/* Filter Tabs and Date Range Picker */}
      <section className="flex flex-wrap items-center justify-between gap-4 pt-1" data-purpose="dashboard-filters">
        <div id="analytics-metric-tabs" role="tablist" aria-label="Analytics perspective" className="flex flex-wrap items-center gap-2">
          {METRIC_TABS.map((name) => {
            const active = tab === name;
            return (
              <button
                key={name}
                type="button"
                role="tab"
                aria-selected={active}
                data-active={active}
                onClick={() => switchTab(name)}
                className={cx(
                  'tab-btn rounded-xl px-5 py-2 text-sm',
                  active ? 'font-bold' : 'font-semibold text-slate-300 hover:bg-white/10 hover:text-white',
                )}
              >
                {name}
              </button>
            );
          })}
        </div>

        {/* Date Range Filter Dropdown */}
        <div ref={rangeRef} id="analytics-date-container" className="relative inline-block text-left">
          <button
            id="analytics-date-btn"
            type="button"
            aria-haspopup="true"
            aria-expanded={rangeMenuOpen}
            onClick={() => setRangeMenuOpen((open) => !open)}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <span id="analytics-date-label">{range}</span>
            <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
          {rangeMenuOpen && (
            <div
              id="analytics-date-menu"
              className="absolute right-0 z-40 mt-1.5 w-44 rounded-xl border border-[#0d3459] bg-[#07243e] py-1.5 shadow-pop animate-fade-in"
            >
              {DATE_RANGES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setAnalyticsRange(option)}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Key Performance Indicator (KPI) Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" data-purpose="kpi-metrics-row">
        {kpis.map((kpi) => (
          <article key={kpi.label} className="console-card flex flex-col justify-between rounded-2xl p-5">
            <span className="text-sm font-semibold text-slate-400">{kpi.label}</span>
            <span className="mt-2 block text-3xl font-extrabold tracking-tight text-white">{kpi.value}</span>
            <span className="mt-2 flex items-center gap-1 text-sm font-semibold text-emerald-400">
              <svg className="h-4 w-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 10l7-7m0 0l7 7m-7-7v18" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{kpi.delta}</span>
            </span>
          </article>
        ))}
      </section>

      {/* Middle Charts Row (Downtime & OEE Trend) */}
      <section className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2" data-purpose="charts-row-1">
        <DowntimeCard />
        <OeeTrendCard />
      </section>

      {/* Bottom Metrics Row (Performance by Area & Energy) */}
      <section className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2" data-purpose="charts-row-2">
        <PerformanceByAreaCard />
        <EnergyConsumptionCard />
      </section>
    </div>
  );
}
