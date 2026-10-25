import { Link } from 'react-router-dom';
import { usePlantState } from '../../store/context';
import type { Alert, Machine } from '../../lib/types';
import { numOr } from '../../lib/utils';
import { Modal } from '../../components/ui';
import { StatusPill } from './StatusPill';
import { ACCENT_BTN, MUTED_BTN, metricText } from './shared';

/**
 * Machine details drawer (legacy `#machine-details-modal`): identity header,
 * telemetry tiles, this machine's active alerts and its contextual actions.
 */
export function MachineDetailsModal({ machine, onClose }: { machine: Machine | null; onClose: () => void }) {
  const state = usePlantState();
  // `const` so the id stays narrowed inside the filter callback.
  const machineId = machine?.id;
  const related: Alert[] = machineId
    ? state.alerts.filter((a) => a.machineId === machineId && a.status === 'Active')
    : [];

  return (
    <Modal
      open={machine !== null}
      onClose={onClose}
      size="lg"
      tone="dark"
      panelClassName="!bg-[#07243e]"
      labelledBy="machine-details-heading"
    >
      {machine && (
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4 border-b border-[#0d3459] pb-4 pr-10">
            <div>
              <div className="flex items-center gap-3">
                <h2 id="machine-details-heading" className="text-2xl font-black tracking-tight text-white">
                  {machine.id}
                </h2>
                <StatusPill status={machine.status} />
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {machine.line} · {machine.name} · Health: {numOr(machine.health, 88)}%
              </p>
            </div>
          </div>

          {/* Telemetry cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-[#0d3459] bg-white/5 p-3.5">
              <span className="block text-[11px] font-semibold text-slate-400">Current Load</span>
              <span className="text-lg font-bold text-white">{metricText(machine.load, '', '70%')}</span>
            </div>
            <div className="rounded-xl border border-[#0d3459] bg-white/5 p-3.5">
              <span className="block text-[11px] font-semibold text-slate-400">Temperature</span>
              <span className="text-lg font-bold text-white">{metricText(machine.temp, '°C', 'Normal')}</span>
            </div>
            <div className="rounded-xl border border-[#0d3459] bg-white/5 p-3.5">
              <span className="block text-[11px] font-semibold text-slate-400">Vibration</span>
              <span className="text-lg font-bold text-white">{metricText(machine.vibration, ' mm/s', 'Normal')}</span>
            </div>
            <div className="rounded-xl border border-[#0d3459] bg-white/5 p-3.5">
              <span className="block text-[11px] font-semibold text-slate-400">Active Power</span>
              <span className="text-lg font-bold text-white">{metricText(machine.power, '', '1.8 kW')}</span>
            </div>
          </div>

          {/* Related alerts */}
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Related Sensor Alerts</h3>
            <div className="space-y-2">
              {related.length === 0 ? (
                <p className="py-1 text-xs italic text-slate-400">
                  No active alarms currently registered on this machine.
                </p>
              ) : (
                related.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3"
                  >
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-red-300">
                        {alert.title} ({alert.severity})
                      </h4>
                      <p className="mt-0.5 text-[11px] text-red-400">{alert.details}</p>
                    </div>
                    <Link
                      to={`/alerts?alertId=${encodeURIComponent(alert.id)}`}
                      className="inline-flex flex-none items-center rounded-lg border border-red-400/40 bg-white/10 px-3 py-1 text-xs font-bold text-red-200 transition-colors hover:bg-white/20"
                    >
                      Review →
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Contextual actions */}
          <div className="flex items-center justify-end gap-3 border-t border-[#0d3459] pt-4">
            <Link to={`/analytics?machine=${encodeURIComponent(machine.id)}`} className={MUTED_BTN}>
              View Machine Analytics
            </Link>
            <Link to={`/maintenance?newForMachine=${encodeURIComponent(machine.id)}`} className={ACCENT_BTN}>
              Schedule Maintenance
            </Link>
          </div>
        </div>
      )}
    </Modal>
  );
}
