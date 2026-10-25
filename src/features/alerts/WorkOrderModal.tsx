import { useEffect, useState, type FormEvent } from 'react';
import { Modal, Select, TextArea, TextInput } from '../../components/ui';
import type { Alert, Machine, Priority } from '../../lib/types';

const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];

const TECHNICIANS = [
  { value: 'Priya Sharma', label: 'Priya Sharma (Maintenance)' },
  { value: 'Vikash Singh', label: 'Vikash Singh (Operator)' },
  { value: 'Aditya Kamil', label: 'Aditya Kamil (Admin)' },
] as const;

const SEVERITY_PRIORITY: Record<Alert['severity'], Priority> = {
  Critical: 'High',
  Warning: 'Medium',
  Info: 'Low',
};

/** Label styling that reads on the dark console panel (kit `.label` is light-only). */
const LABEL = 'mb-1 block text-xs font-semibold text-slate-300';
/** `.field` utilities from the components layer are overridden by these utilities. */
const FIELD = 'min-h-[40px] border-white/15 bg-white/5 text-sm text-white placeholder-slate-500';

export interface WorkOrderDraft {
  task: string;
  machine: string;
  priority: Priority;
  technician: string;
  dueDate: string;
  notes: string;
  linkedAlertId: string;
}

export interface WorkOrderModalProps {
  open: boolean;
  /** The alert the order is created from — every field is prefilled from it. */
  alert: Alert | null;
  machines: Machine[];
  onClose(): void;
  onCreate(draft: WorkOrderDraft): void;
}

function draftFrom(alert: Alert, machines: Machine[]): WorkOrderDraft {
  const machine = machines.some((m) => m.id === alert.machineId)
    ? alert.machineId
    : (machines[0]?.id ?? '');
  return {
    task: `Inspection: ${alert.title}`,
    machine,
    priority: SEVERITY_PRIORITY[alert.severity],
    technician: TECHNICIANS[0].value,
    dueDate: 'Tomorrow',
    notes: `Triggered by ${alert.id}: ${alert.details}. ${alert.description}`,
    linkedAlertId: alert.id,
  };
}

/** Prefilled maintenance work-order dialog (legacy `#alert-maint-order-modal`). */
export function WorkOrderModal({ open, alert, machines, onClose, onCreate }: WorkOrderModalProps) {
  const [draft, setDraft] = useState<WorkOrderDraft | null>(() => (alert ? draftFrom(alert, machines) : null));

  // Re-prefill whenever the dialog opens for an alert.
  useEffect(() => {
    if (open && alert) setDraft(draftFrom(alert, machines));
  }, [open, alert, machines]);

  const set = <K extends keyof WorkOrderDraft>(key: K, value: WorkOrderDraft[K]) =>
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!draft) return;
    onCreate(draft);
  };

  if (!draft) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      tone="dark"
      panelClassName="!bg-[#07243e]"
      aria-label="Schedule Work Order"
    >
      <div className="border-b border-[#0d3459] pb-3 pr-10">
        <h3 className="text-lg font-bold text-white">Schedule Work Order</h3>
        <p className="text-xs text-slate-400">
          Linked to Alert: <span className="font-bold text-[#FF3D0A]">{draft.linkedAlertId}</span>
        </p>
      </div>

      <form onSubmit={submit} className="mt-4 space-y-4">
        <div>
          <label className={LABEL} htmlFor="wo-title">
            Task Title <span className="text-[#FF3D0A]">*</span>
          </label>
          <TextInput
            id="wo-title"
            required
            className={FIELD}
            value={draft.task}
            onChange={(e) => set('task', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="wo-machine">
              Machine <span className="text-[#FF3D0A]">*</span>
            </label>
            <Select
              id="wo-machine"
              required
              className={FIELD}
              value={draft.machine}
              onChange={(e) => set('machine', e.target.value)}
            >
              {machines.map((m) => (
                <option key={m.id} value={m.id} className="bg-[#07243e] text-white">
                  {m.id} — {m.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className={LABEL} htmlFor="wo-priority">
              Priority
            </label>
            <Select
              id="wo-priority"
              className={FIELD}
              value={draft.priority}
              onChange={(e) => set('priority', e.target.value as Priority)}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p} className="bg-[#07243e] text-white">
                  {p}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="wo-tech">
              Assigned Technician
            </label>
            <Select
              id="wo-tech"
              className={FIELD}
              value={draft.technician}
              onChange={(e) => set('technician', e.target.value)}
            >
              {TECHNICIANS.map((t) => (
                <option key={t.value} value={t.value} className="bg-[#07243e] text-white">
                  {t.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className={LABEL} htmlFor="wo-due">
              Due Date
            </label>
            <TextInput id="wo-due" className={FIELD} value={draft.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
          </div>
        </div>

        <div>
          <label className={LABEL} htmlFor="wo-notes">
            Actionable Notes / Root Cause
          </label>
          <TextArea
            id="wo-notes"
            rows={2}
            className={`${FIELD} min-h-[72px]`}
            placeholder="Inspect mechanical clearances and sensors..."
            value={draft.notes}
            onChange={(e) => set('notes', e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#0d3459] pt-3">
          <button
            type="button"
            className="btn btn-sm rounded-lg bg-white/5 text-slate-300 hover:bg-white/10"
            onClick={onClose}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-sm rounded-lg bg-[#FF3D0A] text-white hover:bg-[#e03405]">
            Confirm &amp; Schedule
          </button>
        </div>
      </form>
    </Modal>
  );
}
