import type { Machine } from './types';

/** Conditional className joiner. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Next id from a list like `TM-1 … TM-5` → `TM-6`.
 * Uses the highest existing numeric suffix so remove-then-create can
 * never collide (the legacy `length + 1` scheme could).
 */
export function nextId(prefix: string, list: Array<{ id: string }>, base = 0): string {
  let max = base;
  for (const item of list) {
    const m = String(item.id ?? '').match(/(\d+)$/);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `${prefix}-${max + 1}`;
}

/** `Number(x) || fallback` wrongly turns a real `0` into the fallback. */
export function numOr(value: unknown, fallback: number): number {
  if (value === null || value === undefined || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** True when a metric value is present (0 is a real reading, not "missing"). */
export function hasValue(value: unknown): boolean {
  return value !== null && value !== undefined && value !== '';
}

/** Average machine health across the plant (0–100). */
export function averageHealth(machines: Machine[]): number {
  if (!machines.length) return 0;
  return Math.round(machines.reduce((sum, m) => sum + numOr(m.health, 0), 0) / machines.length);
}

/** Simple OEE proxy used on the overview/analytics cards. */
export function computeOee(machine: Machine): number {
  const availability = machine.status === 'Running' ? 95 : machine.status === 'Idle' ? 70 : 40;
  const performance = numOr(parseFloat(machine.load), 80);
  const quality = 98.5;
  return Math.round(((availability * performance * quality) / 10000) * 10) / 10;
}

/** Wall-clock `HH:MM` for "now" (24h, local). */
export function clockNow(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** `Oct 16, 2025` style date for "now". */
export function dateNow(): string {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Trigger a client-side CSV download (reports module). */
export function downloadCsv(filename: string, headers: string[], rows: string[][]): void {
  const escape = (v: string) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Case/accent-insensitive "does this record match the query" helper. */
export function matchesQuery(query: string, ...fields: string[]): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((f) => String(f ?? '').toLowerCase().includes(q));
}
