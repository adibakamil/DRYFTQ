import { describe, expect, it } from 'vitest';
import { buildReport, reportFilename } from './reports';
import { DEFAULT_STATE } from '../store/defaultState';
import { cloneDefaultState } from '../store/defaultState';

const state = () => cloneDefaultState();

describe('buildReport', () => {
  it('names files like the legacy exporter', () => {
    const name = reportFilename('Energy Report');
    expect(name).toMatch(/^DRYFTQ_Energy_Report_\d{4}-\d{2}-\d{2}\.csv$/);
  });

  it('production report has 6 shift rows and the legacy headers', () => {
    const r = buildReport('Production Report', state());
    expect(r.headers[0]).toBe('Date');
    expect(r.headers).toHaveLength(8);
    expect(r.rows).toHaveLength(6);
    expect(r.rows[0]?.[7]).toBe('Optimal');
  });

  it('energy report is derived from the live machine list', () => {
    const s = state();
    s.machines.push({ ...s.machines[0]!, id: 'NEW-01' });
    const r = buildReport('Energy Report', s);
    expect(r.rows).toHaveLength(s.machines.length);
    expect(r.rows.at(-1)?.[1]).toBe('NEW-01');
    // kw * 8.5 * 0.12 cost for 2.4 kW ≈ $2.42
    expect(r.rows[0]?.[6]).toMatch(/^\$\d/);
  });

  it('performance report computes OEE per machine from availability × performance × quality', () => {
    const r = buildReport('Performance', state());
    const running = r.rows.find((row) => row[0] === 'PUMP-01')!; // Running, load 64%
    expect(running[2]).toBe('95%');
    expect(running[3]).toBe('64%');
    expect(running[4]).toBe('98.5%');
    expect(running[6]).toBe('12'); // running machines: 12 min downtime

    const errored = r.rows.find((row) => row[0] === 'CNC-02')!;
    expect(errored[2]).toBe('40%');
    expect(errored[6]).toBe('145');
  });

  it('maintenance report exports every task with its notes', () => {
    const r = buildReport('Maintenance Report', state());
    expect(r.rows).toHaveLength(DEFAULT_STATE.maintenanceTasks.length);
    expect(r.headers.at(-1)).toBe('Notes');
    expect(r.rows[0]?.at(-1)).toBe(DEFAULT_STATE.maintenanceTasks[0]?.notes);
  });

  it('unknown types fall back to the generic export', () => {
    const r = buildReport('Whatever', state());
    expect(r.headers).toEqual(['Timestamp', 'Record ID', 'Module', 'Description', 'Severity / Status']);
    expect(r.rows).toHaveLength(1);
    expect(r.rows[0]?.[1]).toBe('GEN-01');
  });

  it('every row matches its header width (CSV integrity)', () => {
    for (const type of ['production', 'energy', 'quality', 'performance', 'downtime', 'maintenance', 'custom']) {
      const r = buildReport(type, state());
      for (const row of r.rows) expect(row).toHaveLength(r.headers.length);
    }
  });
});
