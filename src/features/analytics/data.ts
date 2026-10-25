/**
 * Static demo datasets for the Analytics module — ported verbatim from the
 * legacy `DRYFTQ DASHBOARD 2 (ANALYTICS)/code.html` script (`tabDatasets`,
 * donut `stroke-dasharray` geometry, trend points, sparkline values).
 */

/* ------------------------------------------------------------------ */
/* Metric tabs                                                         */
/* ------------------------------------------------------------------ */

export const METRIC_TABS = ['Overview', 'Time', 'OEE', 'Quality', 'Energy'] as const;
export type MetricTab = (typeof METRIC_TABS)[number];

/** Legacy `?tab=` acceptance: only keys present in `tabDatasets`. */
export function isMetricTab(value: string | null): value is MetricTab {
  return value !== null && (METRIC_TABS as readonly string[]).includes(value);
}

export interface TabDataset {
  oee: string;
  oeeD: string;
  avail: string;
  availD: string;
  perf: string;
  perfD: string;
  qual: string;
  qualD: string;
}

/** Exact per-perspective KPI numbers from the legacy `tabDatasets` map. */
export const TAB_DATASETS: Record<MetricTab, TabDataset> = {
  Overview: { oee: '85.6%', oeeD: '3.2%', avail: '92.3%', availD: '1.8%', perf: '88.3%', perfD: '2.6%', qual: '98.7%', qualD: '0.6%' },
  Time: { oee: '84.1%', oeeD: '1.4%', avail: '90.5%', availD: '0.9%', perf: '89.0%', perfD: '2.1%', qual: '98.2%', qualD: '0.4%' },
  OEE: { oee: '88.2%', oeeD: '4.8%', avail: '93.7%', availD: '2.4%', perf: '91.2%', perfD: '3.1%', qual: '99.1%', qualD: '0.8%' },
  Quality: { oee: '86.0%', oeeD: '2.1%', avail: '91.8%', availD: '1.2%', perf: '87.4%', perfD: '1.5%', qual: '99.4%', qualD: '1.2%' },
  Energy: { oee: '83.9%', oeeD: '1.0%', avail: '93.0%', availD: '1.9%', perf: '86.1%', perfD: '1.1%', qual: '98.0%', qualD: '0.3%' },
};

/* ------------------------------------------------------------------ */
/* Date range dropdown                                                 */
/* ------------------------------------------------------------------ */

export const DATE_RANGES = ['Last 24 Hours', 'Last 7 Days', 'Last 30 Days', 'This Month'] as const;
export type DateRange = (typeof DATE_RANGES)[number];

/* ------------------------------------------------------------------ */
/* Downtime Analysis donut                                             */
/* ------------------------------------------------------------------ */

export interface DowntimeSlice {
  id: string;
  /** Centre label shown on hover (legacy `highlightDonut` first argument). */
  category: string;
  /** Centre value shown on hover (legacy `highlightDonut` second argument). */
  value: string;
  /** Legend row label (may differ from the category, e.g. "Scheduled Maintenance"). */
  legendLabel: string;
  percent: string;
  color: string;
  /** Verbatim legacy geometry (r=68 → circumference 427.26). */
  dasharray: string;
  dashoffset: string;
}

export const DOWNTIME_SLICES: DowntimeSlice[] = [
  { id: 'fail', category: 'Equipment Failure', legendLabel: 'Equipment Failure', value: '1.17h (45%)', percent: '45%', color: '#ef4444', dasharray: '192.26 427.26', dashoffset: '0' },
  { id: 'wait', category: 'Waiting', legendLabel: 'Waiting', value: '0.39h (15%)', percent: '15%', color: '#2563eb', dasharray: '64.09 427.26', dashoffset: '-192.26' },
  { id: 'mat', category: 'Material Shortage', legendLabel: 'Material Shortage', value: '0.31h (12%)', percent: '12%', color: '#10b981', dasharray: '51.27 427.26', dashoffset: '-256.35' },
  { id: 'maint', category: 'Scheduled Maint', legendLabel: 'Scheduled Maintenance', value: '0.26h (10%)', percent: '10%', color: '#06b6d4', dasharray: '42.73 427.26', dashoffset: '-307.62' },
  { id: 'pwr', category: 'Power Outage', legendLabel: 'Power Outage', value: '0.26h (10%)', percent: '10%', color: '#f59e0b', dasharray: '42.73 427.26', dashoffset: '-350.35' },
  { id: 'other', category: 'Other Causes', legendLabel: 'Other', value: '0.21h (8%)', percent: '8%', color: '#60a5fa', dasharray: '34.18 427.26', dashoffset: '-393.08' },
];

/* ------------------------------------------------------------------ */
/* OEE Trend chart (viewBox 0 0 500 180)                               */
/* ------------------------------------------------------------------ */

export interface TrendPoint {
  cx: number;
  cy: number;
  day: string;
  /** Legacy tooltip copy, e.g. `Mon: 76.5%`. */
  tip: string;
}

export const OEE_TREND_LINE = '55,142 125,125 195,110 265,85 335,95 405,65 480,40';

export const OEE_TREND_POINTS: TrendPoint[] = [
  { cx: 55, cy: 142, day: 'Mon', tip: 'Mon: 76.5%' },
  { cx: 125, cy: 125, day: 'Tue', tip: 'Tue: 79.2%' },
  { cx: 195, cy: 110, day: 'Wed', tip: 'Wed: 82.0%' },
  { cx: 265, cy: 85, day: 'Thu', tip: 'Thu: 85.8%' },
  { cx: 335, cy: 95, day: 'Fri', tip: 'Fri: 84.1%' },
  { cx: 405, cy: 65, day: 'Sat', tip: 'Sat: 88.6%' },
  { cx: 480, cy: 40, day: 'Sun', tip: 'Sun: 91.4%' },
];

/* ------------------------------------------------------------------ */
/* Performance by Area                                                 */
/* ------------------------------------------------------------------ */

export interface AreaBar {
  line: string;
  percent: string;
  barClass: string;
}

export const AREA_BARS: AreaBar[] = [
  { line: 'Line 1', percent: '88.7%', barClass: 'bg-emerald-500' },
  { line: 'Line 2', percent: '76.3%', barClass: 'bg-emerald-500' },
  { line: 'Line 3', percent: '85.7%', barClass: 'bg-amber-500' },
  { line: 'Line 4', percent: '90.2%', barClass: 'bg-[#FF3D0A]' },
];

/* ------------------------------------------------------------------ */
/* Energy Consumption sparkline (viewBox 0 0 400 48)                   */
/* ------------------------------------------------------------------ */

export interface EnergyPoint {
  cx: number;
  cy: number;
  /** Legacy `title` tooltip, verbatim. */
  tip: string;
}

export const ENERGY_LINE = '10,32 55,28 100,38 145,34 190,44 235,28 280,36 325,36 360,30 390,16';

export const ENERGY_POINTS: EnergyPoint[] = [
  { cx: 10, cy: 32, tip: '10.8 kW' },
  { cx: 55, cy: 28, tip: '11.2 kW' },
  { cx: 100, cy: 38, tip: '10.2 kW' },
  { cx: 145, cy: 34, tip: '10.6 kW' },
  { cx: 190, cy: 44, tip: '9.8 kW' },
  { cx: 235, cy: 28, tip: '11.4 kW' },
  { cx: 280, cy: 36, tip: '10.4 kW' },
  { cx: 325, cy: 36, tip: '10.5 kW' },
  { cx: 360, cy: 30, tip: '11.8 kW' },
  { cx: 390, cy: 16, tip: '12.4 kW (Peak)' },
];
