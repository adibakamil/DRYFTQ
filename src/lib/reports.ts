import type { PlantState } from './types';
import { downloadCsv, numOr } from './utils';

/**
 * CSV report generation — a faithful port of the legacy
 * `Dryftq.downloadReportCSV()`, split into a pure builder and a thin
 * download wrapper so pages (and tests) can use either.
 */

export interface BuiltReport {
  filename: string;
  headers: string[];
  rows: string[][];
}

/** `DRYFTQ_<Type>_YYYY-MM-DD.csv` */
export function reportFilename(reportType: string): string {
  const dateStr = new Date().toISOString().split('T')[0] ?? '';
  return `DRYFTQ_${reportType.replace(/\s+/g, '_')}_${dateStr}.csv`;
}

/** Pure: assemble headers + rows for any report type (unknown → generic export). */
export function buildReport(reportType: string, state: PlantState): BuiltReport {
  const dateStr = new Date().toISOString().split('T')[0] ?? '';
  const filename = reportFilename(reportType);
  const key = reportType.toLowerCase();

  switch (key) {
    case 'production':
    case 'production report': {
      return {
        filename,
        headers: ['Date', 'Shift', 'Line', 'Target Units', 'Actual Units', 'Defect Rate (%)', 'Efficiency (%)', 'Status'],
        rows: [
          [dateStr, 'Morning (06:00-14:00)', 'Line 1', '1200', '1180', '1.2%', '98.3%', 'Optimal'],
          [dateStr, 'Morning (06:00-14:00)', 'Line 2', '1000', '940', '2.8%', '94.0%', 'Attention'],
          [dateStr, 'Morning (06:00-14:00)', 'Line 3', '850', '852', '0.9%', '100.2%', 'Optimal'],
          [dateStr, 'Evening (14:00-22:00)', 'Line 1', '1200', '1195', '1.1%', '99.5%', 'Optimal'],
          [dateStr, 'Evening (14:00-22:00)', 'Line 2', '1000', '910', '3.4%', '91.0%', 'Warning'],
          [dateStr, 'Evening (14:00-22:00)', 'Line 3', '850', '848', '1.0%', '99.7%', 'Optimal'],
        ],
      };
    }

    case 'energy':
    case 'energy report':
      return {
        filename,
        headers: ['Timestamp', 'Machine ID', 'Line', 'Active Power (kW)', 'Reactive Power (kVAR)', 'Energy (kWh)', 'Cost ($)', 'Status'],
        rows: state.machines.map((m) => {
          const kw = numOr(parseFloat(m.power), 2.0);
          return [
            `${dateStr} 10:00`,
            m.id,
            m.line,
            kw.toFixed(1),
            (kw * 0.2).toFixed(2),
            (kw * 8.5).toFixed(1),
            `$${(kw * 8.5 * 0.12).toFixed(2)}`,
            'Normal',
          ];
        }),
      };

    case 'quality':
    case 'quality report':
      return {
        filename,
        headers: ['Batch ID', 'Line', 'Machine', 'Sample Size', 'Passed Units', 'Failed Units', 'Yield Rate (%)', 'Primary Defect'],
        rows: [
          ['BATCH-9021', 'Line 1', 'CNC-01', '500', '495', '5', '99.0%', 'Surface Roughness'],
          ['BATCH-9022', 'Line 2', 'PRESS-02', '600', '582', '18', '97.0%', 'Dimensional Tolerance'],
          ['BATCH-9023', 'Line 2', 'CNC-02', '450', '420', '30', '93.3%', 'Thermal Distortion'],
          ['BATCH-9024', 'Line 3', 'CONV-01', '800', '796', '4', '99.5%', 'Packaging Seal'],
        ],
      };

    case 'performance':
    case 'performance report':
      return {
        filename,
        headers: ['Machine ID', 'Line', 'Availability (%)', 'Performance (%)', 'Quality (%)', 'Overall OEE (%)', 'Downtime (min)'],
        rows: state.machines.map((m) => {
          const avail = m.status === 'Running' ? 95 : m.status === 'Idle' ? 70 : 40;
          const perf = numOr(parseFloat(m.load), 80);
          const qual = 98.5;
          const oee = ((avail * perf * qual) / 10000).toFixed(1);
          return [m.id, m.line, `${avail}%`, `${perf}%`, `${qual}%`, `${oee}%`, String(m.status === 'Running' ? 12 : 145)];
        }),
      };

    case 'downtime':
    case 'downtime report':
      return {
        filename,
        headers: ['Incident ID', 'Date & Time', 'Machine ID', 'Category', 'Duration (mins)', 'Root Cause', 'Technician'],
        rows: [
          ['INC-401', `${dateStr} 08:30`, 'CNC-02', 'Overheating', '45', 'Coolant pump flow restriction', 'Priya Sharma'],
          ['INC-402', `${dateStr} 09:15`, 'CONV-01', 'Mechanical Jam', '25', 'Drive belt misalignment', 'Vikash Singh'],
          ['INC-403', `${dateStr} 11:00`, 'PRESS-02', 'Tool Change', '15', 'Scheduled die swap', 'Vikash Singh'],
        ],
      };

    case 'maintenance':
    case 'maintenance report':
      return {
        filename,
        headers: ['Task ID', 'Task Name', 'Machine ID', 'Type', 'Priority', 'Due Date', 'Status', 'Technician', 'Notes'],
        rows: state.maintenanceTasks.map((t) => [t.id, t.task, t.machine, t.type, t.priority, t.dueDate, t.status, t.technician, t.notes]),
      };

    default:
      return {
        filename,
        headers: ['Timestamp', 'Record ID', 'Module', 'Description', 'Severity / Status'],
        rows: [[new Date().toISOString(), 'GEN-01', 'DRYFTQ Plant', 'Custom Export Data', 'Generated']],
      };
  }
}

/**
 * Build + download a report. Returns the filename so the caller can toast
 * `Exported <filename> successfully.` (legacy wording lives in the page).
 */
export function downloadReport(reportType: string, state: PlantState): string {
  const report = buildReport(reportType, state);
  downloadCsv(report.filename, report.headers, report.rows);
  return report.filename;
}
