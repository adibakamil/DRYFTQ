import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useActions, usePlantState, useToasts } from '../store/context';
import { EmptyState, AlertStatusBadge, type TabItem } from '../components/ui';
import { Icon } from '../components/Icon';
import { cx } from '../lib/utils';
import type { Alert, AlertSeverity } from '../lib/types';
import { AlertDetailsModal } from '../features/alerts/AlertDetailsModal';
import { WorkOrderModal, type WorkOrderDraft } from '../features/alerts/WorkOrderModal';

/** Status tab selection — `Active` only arrives via `?status=Active` (legacy deep link). */
type StatusFilter = 'All' | 'Active' | 'Acknowledged' | 'Resolved';

const STATUS_TABS: TabItem<StatusFilter>[] = [
  { id: 'All', label: 'All Alerts' },
  { id: 'Acknowledged', label: 'Acknowledged' },
  { id: 'Resolved', label: 'Resolved' },
];

const SEVERITY_ICON_CLASS: Record<AlertSeverity, string> = {
  Critical: 'bg-red-500/15 text-[#FF4D26]',
  Warning: 'bg-amber-500/15 text-amber-400',
  Info: 'bg-blue-500/15 text-blue-400',
};

function parseStatusParam(value: string | null): StatusFilter {
  return value === 'Active' || value === 'Acknowledged' || value === 'Resolved' ? value : 'All';
}

/* ------------------------------------------------------------------ */
/* Alert row                                                           */
/* ------------------------------------------------------------------ */

function AlertRow({ alert, onOpen }: { alert: Alert; onOpen(alert: Alert): void }) {
  return (
    <article
      role="button"
      tabIndex={0}
      data-purpose="alert-item"
      title="Click to view alert details & maintenance decision"
      aria-label={`${alert.title}, ${alert.severity} alert on ${alert.machineName}. Open alert details.`}
      onClick={() => onOpen(alert)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(alert);
        }
      }}
      className="group grid cursor-pointer grid-cols-12 items-center px-4 py-5 transition-colors hover:bg-white/5 focus-visible:bg-white/5"
    >
      <div className="col-span-12 flex items-start gap-4 md:col-span-8">
        <span
          className={cx(
            'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            SEVERITY_ICON_CLASS[alert.severity],
          )}
        >
          <Icon name="warn" className="h-5 w-5" />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="text-sm font-bold text-white transition-colors group-hover:text-[#FF3D0A]">
            {alert.title}
          </span>
          <span className="mt-0.5 text-xs font-semibold text-slate-300">
            {alert.details} · <span className="font-normal text-slate-500">{alert.machineName}</span>
          </span>
          <span className="mt-0.5 text-[11px] text-slate-400">{alert.description}</span>
        </span>
      </div>
      <div className="col-span-6 mt-3 text-left md:col-span-2 md:mt-0">
        <span className="block text-xs font-bold text-white">{alert.time}</span>
        <span className="mt-0.5 block text-[11px] text-slate-400">{alert.date}</span>
      </div>
      <div className="col-span-6 mt-3 flex justify-end md:col-span-2 md:mt-0 md:pr-2">
        <AlertStatusBadge dark dot={false} status={alert.status} className="min-w-[85px] justify-center" />
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function AlertsPage() {
  const state = usePlantState();
  const actions = useActions();
  const { notify } = useToasts();
  const [searchParams] = useSearchParams();

  // Status tab — seeded from `?status=` (legacy deep link, e.g. ?status=Active).
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(() => parseStatusParam(searchParams.get('status')));
  const [serviceFilter, setServiceFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | null>(null);
  const [serviceMenuOpen, setServiceMenuOpen] = useState(false);
  const serviceRef = useRef<HTMLDivElement>(null);

  // Modals.
  const [detailsAlertId, setDetailsAlertId] = useState<string | null>(null);
  const [workOrderAlertId, setWorkOrderAlertId] = useState<string | null>(null);
  const autoOpened = useRef(false);

  // `?alertId=…` opens the details modal exactly once, on mount.
  useEffect(() => {
    if (autoOpened.current) return;
    autoOpened.current = true;
    const alertId = searchParams.get('alertId');
    if (alertId && state.alerts.some((a) => a.id === alertId)) setDetailsAlertId(alertId);
  }, [searchParams, state.alerts]);

  // Close the services menu on outside click (legacy behaviour).
  useEffect(() => {
    if (!serviceMenuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (serviceRef.current && !serviceRef.current.contains(e.target as Node)) setServiceMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [serviceMenuOpen]);

  const counts = useMemo(
    () => ({
      all: state.alerts.length,
      acknowledged: state.alerts.filter((a) => a.status === 'Acknowledged').length,
      resolved: state.alerts.filter((a) => a.status === 'Resolved').length,
    }),
    [state.alerts],
  );

  // "Line 1 (CNC-01, PUMP-01, PRESS-01)" style entries, derived from live machines.
  const serviceOptions = useMemo(() => {
    const lines = new Map<string, string[]>();
    for (const m of state.machines) {
      const ids = lines.get(m.line) ?? [];
      ids.push(m.id);
      lines.set(m.line, ids);
    }
    return [...lines.entries()]
      .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }))
      .map(([line, ids]) => ({ value: line, label: `${line} (${ids.join(', ')})` }));
  }, [state.machines]);

  const filtered = useMemo(
    () =>
      state.alerts.filter((a) => {
        if (statusFilter !== 'All' && a.status !== statusFilter) return false;
        if (serviceFilter !== 'All' && !a.machineName.includes(serviceFilter)) return false;
        if (severityFilter && a.severity !== severityFilter) return false;
        return true;
      }),
    [state.alerts, statusFilter, serviceFilter, severityFilter],
  );

  const tabs: TabItem<StatusFilter>[] = STATUS_TABS.map((t) => ({
    ...t,
    label:
      t.id === 'All'
        ? `All Alerts (${counts.all})`
        : `${t.label} (${t.id === 'Acknowledged' ? counts.acknowledged : counts.resolved})`,
  }));

  const detailsAlert = detailsAlertId ? (state.alerts.find((a) => a.id === detailsAlertId) ?? null) : null;
  const workOrderAlert = workOrderAlertId ? (state.alerts.find((a) => a.id === workOrderAlertId) ?? null) : null;

  const resetFilters = () => {
    setStatusFilter('All');
    setServiceFilter('All');
    setSeverityFilter(null);
    setServiceMenuOpen(false);
  };

  const toggleSeverity = (severity: AlertSeverity) => {
    const next = severityFilter === severity ? null : severity;
    setSeverityFilter(next);
    if (next) notify({ message: `Filtering by severity: ${severity}`, type: 'info' });
  };

  const acknowledge = (alertId: string) => {
    actions.acknowledgeAlert(alertId);
    setDetailsAlertId(null);
  };

  const resolve = (alertId: string) => {
    actions.resolveAlert(alertId);
    setDetailsAlertId(null);
  };

  const openWorkOrder = (alert: Alert) => {
    setWorkOrderAlertId(alert.id);
    setDetailsAlertId(null);
  };

  const createWorkOrder = (draft: WorkOrderDraft) => {
    actions.createMaintenanceTask({
      task: draft.task,
      machine: draft.machine,
      type: 'Corrective',
      priority: draft.priority,
      technician: draft.technician,
      dueDate: draft.dueDate,
      notes: draft.notes,
      linkedAlertId: draft.linkedAlertId,
    });
    setWorkOrderAlertId(null);
    setDetailsAlertId(null);
  };

  const chipClass = (active: boolean, tone: 'red' | 'amber') =>
    cx(
      'rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors',
      tone === 'red'
        ? active
          ? 'border-red-400/60 bg-red-500/25 text-red-200'
          : 'border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20'
        : active
          ? 'border-amber-400/60 bg-amber-500/25 text-amber-100'
          : 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20',
    );

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <header>
        <h2 className="text-lg font-bold text-white">Alerts</h2>
        <p className="mt-0.5 text-sm text-slate-400">
          Real-time alerts, sensor anomalies and resolution workflow
        </p>
      </header>

      {/* Status tabs — legacy pills with live counts (dark `.tab-btn` overrides) */}
      <section
        id="alert-status-tabs"
        data-purpose="tab-navigation"
        role="tablist"
        aria-label="Alert status"
        className="flex flex-wrap items-center gap-2 pt-1"
      >
        {tabs.map((tab) => {
          const active = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              data-active={active}
              onClick={() => setStatusFilter(tab.id)}
              className={cx(
                'tab-btn flex h-[50px] items-center justify-center rounded-lg text-sm',
                active
                  ? 'min-w-[170px] px-7 font-bold'
                  : 'px-6 font-semibold text-slate-300 hover:bg-white/10 hover:text-white',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </section>

      {/* Filter controls */}
      <section data-purpose="filter-controls" className="flex flex-wrap items-center justify-between gap-4">
        <div ref={serviceRef} className="relative inline-block text-left">
          <button
            id="services-filter-btn"
            type="button"
            aria-haspopup="true"
            aria-expanded={serviceMenuOpen}
            aria-label="Filter by plant line or service"
            onClick={() => setServiceMenuOpen((v) => !v)}
            className="inline-flex h-12 w-[280px] items-center justify-between gap-3 rounded-lg border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-[380px]"
          >
            <span id="services-filter-label" className="truncate">
              {serviceFilter === 'All' ? 'All Plant Lines & Services' : serviceFilter}
            </span>
            <Icon name="down" className="h-4 w-4 flex-none text-slate-400" />
          </button>
          {serviceMenuOpen && (
            <div
              id="services-filter-menu"
              className="absolute left-0 z-30 mt-1 w-[280px] rounded-xl border border-[#0d3459] bg-[#07243e] py-1.5 shadow-pop sm:w-[380px]"
            >
              <button
                type="button"
                onClick={() => {
                  setServiceFilter('All');
                  setServiceMenuOpen(false);
                }}
                className={cx(
                  'w-full px-4 py-2 text-left text-xs font-semibold transition-colors',
                  serviceFilter === 'All'
                    ? 'bg-white/10 text-[#FF3D0A]'
                    : 'text-slate-200 hover:bg-white/5 hover:text-white',
                )}
              >
                All Plant Lines &amp; Services
              </button>
              {serviceOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setServiceFilter(opt.value);
                    setServiceMenuOpen(false);
                  }}
                  className={cx(
                    'w-full px-4 py-2 text-left text-xs font-semibold transition-colors',
                    serviceFilter === opt.value
                      ? 'bg-white/10 text-[#FF3D0A]'
                      : 'text-slate-200 hover:bg-white/5 hover:text-white',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-pressed={severityFilter === 'Critical'}
            onClick={() => toggleSeverity('Critical')}
            className={chipClass(severityFilter === 'Critical', 'red')}
          >
            Critical Only
          </button>
          <button
            type="button"
            aria-pressed={severityFilter === 'Warning'}
            onClick={() => toggleSeverity('Warning')}
            className={chipClass(severityFilter === 'Warning', 'amber')}
          >
            Warnings Only
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-semibold text-slate-400 transition-colors hover:text-white"
          >
            Reset Filters
          </button>
        </div>
      </section>

      {/* Alerts list */}
      <section data-purpose="alerts-list" className="console-card overflow-hidden">
        <div className="grid grid-cols-12 items-center border-b border-white/10 px-4 py-2 text-xs font-semibold text-slate-400">
          <div className="col-span-12 flex items-center gap-3 md:col-span-8">
            <span className="ml-0.5 inline-block h-2.5 w-2.5 rounded-full border border-white/20" />
            <span className="text-slate-300">Alert</span>
          </div>
          <div className="col-span-6 text-slate-300 md:col-span-2">Time</div>
          <div className="col-span-6 pr-3 text-right text-slate-300 md:col-span-2">Status</div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            tone="dark"
            icon="warn"
            title="No alerts matching filter criteria"
            action={
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-bold text-[#FF3D0A] hover:underline"
              >
                Reset Filters
              </button>
            }
          />
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((alert) => (
              <AlertRow key={alert.id} alert={alert} onOpen={(a) => setDetailsAlertId(a.id)} />
            ))}
          </div>
        )}
      </section>

      {/* Alert details + maintenance decision */}
      <AlertDetailsModal
        alert={detailsAlert}
        onClose={() => setDetailsAlertId(null)}
        onAcknowledge={acknowledge}
        onResolve={resolve}
        onCreateWorkOrder={openWorkOrder}
      />

      {/* Prefilled work order */}
      <WorkOrderModal
        key={workOrderAlert?.id ?? 'closed'}
        open={workOrderAlert !== null}
        alert={workOrderAlert}
        machines={state.machines}
        onClose={() => setWorkOrderAlertId(null)}
        onCreate={createWorkOrder}
      />
    </div>
  );
}
