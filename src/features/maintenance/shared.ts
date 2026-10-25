/**
 * Shared constants, types and pure helpers for the Maintenance module.
 * Pure TypeScript only — no JSX in here.
 */
import type { Machine, MaintenanceStatus, MaintenanceType, Priority } from '../../lib/types';

export type TaskFilter = MaintenanceStatus | 'All';

export const TASK_FILTERS: TaskFilter[] = ['Upcoming', 'In Progress', 'Completed', 'All'];

/**
 * Legacy quirk kept verbatim: the Completed pill renders `completedCount + 27`
 * ("Baseline + completed" in `renderMaintenanceTable`), so archived work
 * orders outside the live list still count toward the badge.
 */
export const COMPLETED_BASELINE = 27;

export const MAINTENANCE_TYPES: MaintenanceType[] = ['Preventive', 'Predictive', 'Corrective'];
export const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];
export const TECHNICIANS = ['Priya Sharma', 'Vikash Singh', 'Aditya Kamil'] as const;

/** Console accent action (platform accent `#FF3D0A`). */
export const ACCENT_BTN = 'btn btn-sm rounded-lg bg-[#FF3D0A] text-white hover:bg-[#e03405]';
/** Secondary action on the dark console. */
export const MUTED_BTN = 'btn btn-sm rounded-lg bg-white/10 text-white hover:bg-white/20';
/** Legacy labels were slate-700 on white — keep them readable on #07243e. */
export const FIELD_DARK = '[&_label]:text-slate-300';
/** `.field` utilities restated for the dark modal surface. */
export const INPUT_DARK = 'min-h-[40px] border-white/15 bg-white/5 text-sm text-white placeholder-slate-500';

/** Draft backing the legacy `#new-maint-modal` form (`#new-task-*` inputs). */
export interface NewTaskDraft {
  task: string;
  machine: string;
  type: MaintenanceType;
  priority: Priority;
  technician: string;
  dueDate: string;
  notes: string;
}

/**
 * Legacy defaults: the machine `<select>` is repopulated from state on every
 * open (first machine selected), type Preventive, priority Medium
 * (`<option selected>`), technician Priya Sharma, due "Tomorrow".
 */
export function defaultDraft(machines: Machine[]): NewTaskDraft {
  return {
    task: '',
    machine: machines[0]?.id ?? '',
    type: 'Preventive',
    priority: 'Medium',
    technician: 'Priya Sharma',
    dueDate: 'Tomorrow',
    notes: '',
  };
}

/** Static KPI strip from the legacy metric cards — fixed values, not derived. */
export const METRIC_CARDS = [
  { label: 'MTBF', value: '120 h', delta: '15.2%', dir: 'up' as const },
  { label: 'MTTR', value: '2.4 h', delta: '3.1%', dir: 'down' as const },
  { label: 'Maintenance Cost', value: '$12.4K', delta: '8.2%', dir: 'down' as const },
  { label: 'Compliance', value: '96.3%', delta: '4.1%', dir: 'up' as const },
];
