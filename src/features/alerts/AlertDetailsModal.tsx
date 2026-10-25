import { Modal, StatusBadge } from '../../components/ui';
import { Icon } from '../../components/Icon';
import { cx } from '../../lib/utils';
import type { Alert, AlertSeverity } from '../../lib/types';

/** Observed-reading colour follows the alert's own severity. */
const READING_COLOR: Record<AlertSeverity, string> = {
  Critical: 'text-red-400',
  Warning: 'text-amber-400',
  Info: 'text-blue-400',
};

export interface AlertDetailsModalProps {
  alert: Alert | null;
  onClose(): void;
  onAcknowledge(alertId: string): void;
  onResolve(alertId: string): void;
  onCreateWorkOrder(alert: Alert): void;
}

/**
 * Alert details + the Maintenance Decision workflow
 * (ported from the legacy `#alert-details-modal`).
 */
export function AlertDetailsModal({
  alert,
  onClose,
  onAcknowledge,
  onResolve,
  onCreateWorkOrder,
}: AlertDetailsModalProps) {
  return (
    <Modal
      open={alert !== null}
      onClose={onClose}
      size="lg"
      tone="dark"
      panelClassName="!bg-[#07243e]"
      labelledBy="alert-details-title"
    >
      {alert && (
        <>
          {/* Header */}
          <div className="border-b border-[#0d3459] pb-4 pr-10">
            <div className="flex items-center gap-2.5">
              <StatusBadge dark value={alert.severity} />
              <h2 id="alert-details-title" className="text-xl font-bold text-white">
                {alert.title}
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-400">Machine: {alert.machineName}</p>
          </div>

          {/* Telemetry comparison */}
          <div className="mt-5 space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span>Observed Reading:</span>
              <span className={cx('text-base font-extrabold', READING_COLOR[alert.severity])}>{alert.reading}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Operating Threshold:</span>
              <span className="font-bold text-slate-200">{alert.threshold}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Alert Triggered Time:</span>
              <span className="font-medium text-slate-200">
                {alert.time} · {alert.date}
              </span>
            </div>
            <div className="border-t border-white/10 pt-2">
              <p className="text-xs font-medium leading-relaxed text-slate-300">{alert.description}</p>
            </div>
          </div>

          {/* Maintenance decision */}
          <div className="mt-5 space-y-3 rounded-xl border border-[#FF3D0A]/30 bg-[#FF3D0A]/10 p-4">
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-300">
              <span aria-hidden="true">🛠️</span> Maintenance Decision Required
            </h3>
            <p className="text-xs leading-relaxed text-slate-300">
              Does this alarm require dispatching a technician or scheduling a corrective work order?
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="btn btn-sm rounded-lg bg-[#FF3D0A] text-white hover:bg-[#e03405]"
                onClick={() => onCreateWorkOrder(alert)}
              >
                <span>Create Maintenance Work Order</span>
                <Icon name="arrow" className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className="btn btn-sm rounded-lg border border-orange-400/40 bg-white/5 text-white hover:bg-white/10"
                onClick={() => onResolve(alert.id)}
              >
                Resolve Without Maintenance
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#0d3459] pt-3">
            <div>
              {alert.status === 'Active' && (
                <button
                  type="button"
                  className="btn btn-sm rounded-lg bg-white/10 text-white hover:bg-white/20"
                  onClick={() => onAcknowledge(alert.id)}
                >
                  Acknowledge Alert
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn btn-sm rounded-lg bg-white/5 text-slate-300 hover:bg-white/10"
                onClick={onClose}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={() => onResolve(alert.id)}
              >
                Mark as Resolved
              </button>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
