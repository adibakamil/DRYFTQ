/**
 * Shared constants, types and pure helpers for the Machines module.
 * Pure TypeScript only — no JSX in here.
 */
import type { Machine, MachineStatus } from '../../lib/types';
import { hasValue, numOr } from '../../lib/utils';

export type StatusFilter = 'All' | MachineStatus;
export type SortField = 'id' | 'status' | 'load' | 'temp' | 'vibration';
export type SortDir = 'asc' | 'desc';

export const STATUS_FILTERS: StatusFilter[] = ['All', 'Running', 'Idle', 'Error', 'Maintenance'];

/** Console accent action (legacy `#FF4A1C`, platform accent `#FF3D0A`). */
export const ACCENT_BTN = 'btn btn-sm rounded-lg bg-[#FF3D0A] text-white hover:bg-[#e03405]';
/** Secondary action on the dark console. */
export const MUTED_BTN = 'btn btn-sm rounded-lg bg-white/10 text-white hover:bg-white/20';
/** Legacy labels were slate-700 on white — keep them readable on #07243e. */
export const FIELD_DARK = '[&_label]:text-slate-300';

/** Draft backing the legacy `#add-machine-form` inputs. */
export interface MachineDraft {
  id: string;
  line: string;
  name: string;
  status: MachineStatus;
  load: string;
  temp: string;
  vibration: string;
  power: string;
}

/** Same defaults the legacy form carried (`#new-mach-*` inputs). */
export const DEFAULT_DRAFT: MachineDraft = {
  id: '',
  line: 'Line 1',
  name: '',
  status: 'Running',
  load: '70',
  temp: '65',
  vibration: '1.2',
  power: '2.5 kW',
};

/** `-` only for null/empty — a real `0` reading must never read as missing. */
export function metricText(value: unknown, unit: string, fallback = '-'): string {
  return hasValue(value) ? `${String(value)}${unit}` : fallback;
}

/**
 * Load/temp/vibration readings as sort keys. `load` carries a unit suffix
 * (`'78%'`), so parse the leading number first — plain `Number('78%')` is
 * NaN and would collapse every row to the `numOr` fallback.
 */
function sortNumber(value: unknown): number {
  return numOr(parseFloat(String(value)), 0);
}

/** Asc/desc toggle comparator — numeric fields coerced via `numOr` (0 wins). */
export function compareMachines(a: Machine, b: Machine, field: SortField, dir: SortDir): number {
  let delta: number;
  if (field === 'load') delta = sortNumber(a.load) - sortNumber(b.load);
  else if (field === 'temp') delta = sortNumber(a.temp) - sortNumber(b.temp);
  else if (field === 'vibration') delta = sortNumber(a.vibration) - sortNumber(b.vibration);
  else if (field === 'status') delta = a.status < b.status ? -1 : a.status > b.status ? 1 : 0;
  else delta = a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  return dir === 'asc' ? delta : -delta;
}
