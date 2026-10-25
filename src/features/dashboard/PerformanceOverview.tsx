import { useEffect, useMemo, useRef, useState } from 'react';
import { cx } from '../../lib/utils';
import { useStore } from '../../store/context';
import {
  CHART_DATA_SETS,
  DEFAULT_GRANULARITY,
  DEFAULT_RANGE,
  TIME_RANGES,
  type ChartPoint,
  type Granularity,
  type TimeRange,
} from './chartData';

/** Hover tooltip state — port of the legacy `showPointTooltip` DOM writes. */
interface ChartTooltip {
  text: string;
  x: number;
  y: number;
}

/** Classification (mm/s) mini bars — heights/titles verbatim from the legacy markup. */
const CLASSIFICATION_BARS: Array<{ heightClass: string; title: string; warning?: boolean }> = [
  { heightClass: 'h-3', title: 'Normal: 0.2' },
  { heightClass: 'h-3.5', title: 'Normal: 0.4' },
  { heightClass: 'h-4', title: 'Normal: 0.6' },
  { heightClass: 'h-5', title: 'Normal: 0.8' },
  { heightClass: 'h-6', title: 'Normal: 1.0' },
  { heightClass: 'h-7', title: 'Normal: 1.2' },
  { heightClass: 'h-8', title: 'Normal: 1.4' },
  { heightClass: 'h-9', title: 'Normal: 1.8' },
  { heightClass: 'h-10', title: 'Elevated: 2.2', warning: true },
  { heightClass: 'h-11', title: 'Warning: 2.8', warning: true },
];

function pointsString(points: ChartPoint[]): string {
  return points.map((p) => `${p.x},${p.y}`).join(' ');
}

/**
 * `Performance Overview` — time-range/granularity controls, dual-line SVG chart
 * with hover tooltips, plus the vibration sub-metrics rail. All geometry and
 * copy ported from the legacy dashboard page.
 */
export default function PerformanceOverview() {
  const { notify } = useStore();

  const [range, setRange] = useState<TimeRange>(DEFAULT_RANGE);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [granularity, setGranularity] = useState<Granularity>(DEFAULT_GRANULARITY);
  const [showTemp, setShowTemp] = useState(true);
  const [showVib, setShowVib] = useState(true);
  const [tooltip, setTooltip] = useState<ChartTooltip | null>(null);

  const rangeRef = useRef<HTMLDivElement>(null);

  // Close the time-range menu on outside click (legacy document listener).
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (rangeRef.current && !rangeRef.current.contains(e.target as Node)) setRangeOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const data = useMemo(() => CHART_DATA_SETS[range] ?? CHART_DATA_SETS[DEFAULT_RANGE], [range]);
  const tempPointsStr = useMemo(() => pointsString(data.tempPoints), [data]);
  const vibPointsStr = useMemo(() => pointsString(data.vibPoints), [data]);

  const pickRange = (next: TimeRange) => {
    setRange(next);
    setRangeOpen(false);
    notify({ message: `View updated to ${next}.`, type: 'info', title: 'Filter Applied' });
  };

  const showPointTooltip = (text: string, x: number, y: number) => setTooltip({ text, x, y });
  const hidePointTooltip = () => setTooltip(null);

  return (
    <section className="console-card-solid space-y-6 rounded-3xl p-6" data-purpose="chart-analytics-container">
      {/* Card Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-white">Performance Overview</h2>
        <div className="flex items-center gap-3">
          {/* Dropdown Selector */}
          <div ref={rangeRef} id="time-range-container" className="relative inline-block text-left">
            <button
              id="time-range-btn"
              type="button"
              onClick={() => setRangeOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full border border-[#0d3459] bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/10"
            >
              <span id="time-range-label">{range}</span>
              <svg className="h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </button>
            <div
              id="time-range-menu"
              className={cx(
                'absolute right-0 z-30 mt-1 w-40 rounded-xl border border-[#0d3459] bg-[#07243e] py-1 shadow-pop',
                rangeOpen ? 'block' : 'hidden',
              )}
            >
              {TIME_RANGES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => pickRange(r)}
                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-300 hover:bg-white/5"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          {/* Time Granularity Pill Toggle */}
          <div className="flex items-center rounded-full border border-[#0d3459] bg-white/5 p-0.5 text-xs font-semibold">
            <button
              id="btn-granularity-daily"
              type="button"
              onClick={() => setGranularity('daily')}
              className={cx(
                'rounded-full px-3 py-1 transition-colors',
                granularity === 'daily' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200',
              )}
            >
              Daily
            </button>
            <button
              id="btn-granularity-hourly"
              type="button"
              onClick={() => setGranularity('hourly')}
              className={cx(
                'rounded-full px-3 py-1 transition-colors',
                granularity === 'hourly' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200',
              )}
            >
              Hourly
            </button>
          </div>
        </div>
      </div>

      {/* Dual Chart & Side Metric Visuals */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-4">
        {/* Left Chart Area (Span 3 Columns) */}
        <div className="space-y-4 lg:col-span-3">
          {/* Chart Legend */}
          <div className="flex items-center gap-6 pl-8 text-xs font-semibold text-slate-300">
            {/* Temperature Legend Item */}
            <button
              type="button"
              title="Click to filter Temperature"
              onClick={() => setShowTemp((v) => !v)}
              className="flex cursor-pointer items-center gap-2"
            >
              <span id="legend-temp-label" className={cx(!showTemp && 'line-through')}>
                Temperature (°C)
              </span>
              <span className="flex items-center">
                <span className="mr-1 h-2.5 w-2.5 rotate-45 rounded-sm bg-[#f95721]" />
                <span className="h-0.5 w-6 bg-[#f95721]" />
                <span className="ml-1 h-2 w-2 rounded-full bg-[#f95721]" />
              </span>
            </button>
            {/* Vibration Legend Item */}
            <button
              type="button"
              title="Click to filter Vibration"
              onClick={() => setShowVib((v) => !v)}
              className="flex cursor-pointer items-center gap-2"
            >
              <span className="h-2 w-2 rounded-full bg-[#1e78f6]" />
              <span id="legend-vib-label" className={cx(!showVib && 'line-through')}>
                Vibration
              </span>
            </button>
          </div>

          {/* SVG Dual Line Chart Container */}
          <div id="dual-chart-container" className="relative h-64 w-full font-mono text-[11px] text-slate-400">
            <svg
              id="dashboard-svg-chart"
              viewBox="0 0 760 220"
              preserveAspectRatio="none"
              className="h-full w-full overflow-visible"
            >
              {/* Horizontal Grid Lines */}
              <g stroke="#0d3459" strokeDasharray="2,2" strokeWidth="1">
                <line x1="45" x2="750" y1="20" y2="20" />
                <line x1="45" x2="750" y1="65" y2="65" />
                <line x1="45" x2="750" y1="110" y2="110" />
                <line x1="45" x2="750" y1="155" y2="155" />
                <line x1="45" x2="750" y1="200" y2="200" />
              </g>
              {/* Y-Axis Value Labels */}
              <text className="font-sans font-semibold" fill="#94a3b8" textAnchor="end" x="35" y="24">100</text>
              <text className="font-sans font-semibold" fill="#94a3b8" textAnchor="end" x="35" y="69">80</text>
              <text className="font-sans font-semibold" fill="#94a3b8" textAnchor="end" x="35" y="114">60</text>
              <text className="font-sans font-semibold" fill="#94a3b8" textAnchor="end" x="35" y="159">20</text>
              <text className="font-sans font-semibold" fill="#94a3b8" textAnchor="end" x="35" y="204">00</text>

              {/* Blue Trend Line (Vibration) */}
              {showVib && (
                <polyline
                  id="vibration-polyline"
                  fill="none"
                  points={vibPointsStr}
                  stroke="#1e78f6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                />
              )}
              {/* Blue Data Point Dots */}
              <g id="vibration-points" fill="#1e78f6">
                {showVib &&
                  data.vibPoints.map((p, i) => (
                    <circle
                      key={`vib-${i}`}
                      cx={p.x}
                      cy={p.y}
                      r={4.5}
                      className="cursor-pointer transition-transform duration-150 hover:-translate-y-px"
                      onMouseEnter={() => showPointTooltip(`Vibration: ${p.val} mm/s`, p.x, p.y)}
                      onMouseLeave={hidePointTooltip}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                    />
                  ))}
              </g>

              {/* Orange Trend Line (Temperature) */}
              {showTemp && (
                <polyline
                  id="temperature-polyline"
                  fill="none"
                  points={tempPointsStr}
                  stroke="#f95721"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                />
              )}
              {/* Orange Data Point Dots */}
              <g id="temperature-points" fill="#f95721">
                {showTemp &&
                  data.tempPoints.map((p, i) => (
                    <circle
                      key={`temp-${i}`}
                      cx={p.x}
                      cy={p.y}
                      r={4.5}
                      className="cursor-pointer transition-transform duration-150 hover:-translate-y-px"
                      onMouseEnter={() => showPointTooltip(`Temperature: ${p.val} °C`, p.x, p.y)}
                      onMouseLeave={hidePointTooltip}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                    />
                  ))}
              </g>
            </svg>

            {/* Live Hover Tooltip — inline port of `.dryftq-chart-tooltip` */}
            <div
              id="chart-tooltip"
              aria-hidden
              className={cx(
                'pointer-events-none absolute z-50 rounded-lg border border-white/10 bg-[#071629] px-3 py-1.5',
                'text-[11px] font-semibold whitespace-nowrap text-white shadow-lg',
                'transition-opacity duration-150 ease-out',
                tooltip ? 'opacity-100' : 'opacity-0',
              )}
              style={
                tooltip
                  ? {
                      left: `${(tooltip.x / 760) * 100}%`,
                      top: `${tooltip.y - 32}px`,
                      transform: 'translate(-50%, -4px)',
                    }
                  : undefined
              }
            >
              {tooltip?.text ?? ''}
            </div>

            {/* X-Axis Timestamps */}
            <div id="chart-x-axis" className="flex justify-between pl-10 pr-2 pt-2 text-[11px] font-medium text-slate-400">
              {data.xLabels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column Sub-Metrics (Span 1 Column) */}
        <div className="space-y-6 pt-4 lg:col-span-1 lg:border-l lg:border-[#0d3459] lg:pl-6 lg:pt-0">
          {/* Vibration Mini Trend */}
          <div className="space-y-1">
            <span className="console-label">Vibration</span>
            <p id="submetric-vibration" className="text-lg font-bold text-white">2.2 mm/s</p>
            <div className="h-8 w-full pt-1">
              <svg viewBox="0 0 160 30" className="h-full w-full overflow-visible">
                <polyline
                  fill="none"
                  points="5,20 30,19 60,17 90,14 110,18 135,19 155,7"
                  stroke="#1e78f6"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                />
                <circle cx="155" cy="7" fill="#1e78f6" r="3" />
              </svg>
            </div>
          </div>
          {/* Classification Progress Bar Chart */}
          <div className="space-y-1 pt-2">
            <span className="console-label">Classification (mm/s)</span>
            <p className="text-lg font-bold text-white">98.7%</p>
            {/* Mini ascending bar visualization */}
            <div className="flex h-12 items-end gap-1.5 pt-3">
              {CLASSIFICATION_BARS.map((bar) => (
                <span
                  key={bar.title}
                  title={bar.title}
                  className={cx(
                    'w-2.5 rounded-sm transition-opacity hover:opacity-80',
                    bar.heightClass,
                    bar.warning ? 'bg-[#ff4d15]' : 'bg-emerald-500',
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
