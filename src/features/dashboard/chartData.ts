/**
 * Dashboard chart datasets — ported verbatim from the legacy
 * `DRYFTQ DASHBOARD 1/code.html` inline script (`chartDataSets`),
 * including the SVG-space coordinates (viewBox 0 0 760 220).
 */

export interface ChartPoint {
  x: number;
  y: number;
  val: number;
}

export interface ChartDataSet {
  xLabels: string[];
  tempPoints: ChartPoint[];
  vibPoints: ChartPoint[];
}

export const TIME_RANGES = ['Last 24 Hours', 'Last 7 Days', 'Last 30 Days'] as const;
export type TimeRange = (typeof TIME_RANGES)[number];
export type Granularity = 'daily' | 'hourly';

export const DEFAULT_RANGE: TimeRange = 'Last 7 Days';
export const DEFAULT_GRANULARITY: Granularity = 'hourly';

export const CHART_DATA_SETS: Record<TimeRange, ChartDataSet> = {
  'Last 7 Days': {
    xLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    tempPoints: [
      { x: 60, y: 140, val: 62 }, { x: 170, y: 130, val: 65 }, { x: 280, y: 92, val: 84 },
      { x: 400, y: 110, val: 74 }, { x: 510, y: 95, val: 82 }, { x: 630, y: 125, val: 68 }, { x: 745, y: 118, val: 71 },
    ],
    vibPoints: [
      { x: 60, y: 170, val: 1.1 }, { x: 170, y: 160, val: 1.3 }, { x: 280, y: 142, val: 1.9 },
      { x: 400, y: 130, val: 2.2 }, { x: 510, y: 155, val: 1.5 }, { x: 630, y: 148, val: 1.7 }, { x: 745, y: 150, val: 1.6 },
    ],
  },
  'Last 24 Hours': {
    xLabels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
    tempPoints: [
      { x: 60, y: 150, val: 58 }, { x: 170, y: 145, val: 60 }, { x: 280, y: 110, val: 76 },
      { x: 400, y: 88, val: 88 }, { x: 510, y: 95, val: 85 }, { x: 630, y: 120, val: 72 }, { x: 745, y: 130, val: 66 },
    ],
    vibPoints: [
      { x: 60, y: 180, val: 0.8 }, { x: 170, y: 175, val: 0.9 }, { x: 280, y: 155, val: 1.4 },
      { x: 400, y: 132, val: 2.2 }, { x: 510, y: 140, val: 1.9 }, { x: 630, y: 160, val: 1.3 }, { x: 745, y: 165, val: 1.2 },
    ],
  },
  'Last 30 Days': {
    xLabels: ['W1', 'W2', 'W3', 'W4', 'W5'],
    tempPoints: [
      { x: 60, y: 135, val: 64 }, { x: 230, y: 120, val: 70 }, { x: 400, y: 105, val: 78 },
      { x: 570, y: 90, val: 86 }, { x: 745, y: 110, val: 75 },
    ],
    vibPoints: [
      { x: 60, y: 165, val: 1.2 }, { x: 230, y: 150, val: 1.5 }, { x: 400, y: 145, val: 1.7 },
      { x: 570, y: 135, val: 2.0 }, { x: 745, y: 148, val: 1.6 },
    ],
  },
};
