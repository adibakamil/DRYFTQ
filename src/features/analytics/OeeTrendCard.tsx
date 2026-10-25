import { useRef, useState, type MouseEvent } from 'react';
import { cx } from '../../lib/utils';
import { OEE_TREND_LINE, OEE_TREND_POINTS } from './data';

interface TooltipState {
  text: string;
  left: number;
  top: number;
}

/**
 * OEE Trend card — legacy polyline (`#1d72fe`) with seven hover points and a
 * tooltip positioned exactly like `showOEETooltip()` (+8px right, −28px above
 * the point, relative to the chart container).
 */
export default function OeeTrendCard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const showTooltip = (event: MouseEvent<SVGCircleElement>, text: string) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const bounds = container.getBoundingClientRect();
    setTooltip({ text, left: rect.left - bounds.left + 8, top: rect.top - bounds.top - 28 });
  };

  return (
    <section className="console-card-solid relative flex flex-col justify-between rounded-2xl p-6" data-purpose="oee-trend-card">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-base font-bold text-white">OEE Trend</h3>
        <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
          +4.2% Week-over-Week
        </span>
      </div>

      {/* Trend Line Chart Container */}
      <div ref={containerRef} id="oee-trend-container" className="relative h-56 w-full pt-2">
        <svg className="h-full w-full overflow-visible" viewBox="0 0 500 180" preserveAspectRatio="none" aria-hidden="true">
          {/* Grid lines & labels */}
          <text fill="#94a3b8" fontSize="11" fontWeight="600" x="5" y="16">
            100%
          </text>
          <line stroke="#0d3459" strokeWidth="1.5" x1="45" x2="495" y1="12" y2="12" />
          <text fill="#94a3b8" fontSize="11" fontWeight="600" x="12" y="58">
            75%
          </text>
          <line stroke="#0d3459" strokeWidth="1.5" x1="45" x2="495" y1="54" y2="54" />
          <text fill="#94a3b8" fontSize="11" fontWeight="600" x="12" y="100">
            50%
          </text>
          <line stroke="#0d3459" strokeWidth="1.5" x1="45" x2="495" y1="96" y2="96" />
          <text fill="#94a3b8" fontSize="11" fontWeight="600" x="12" y="142">
            20%
          </text>
          <line stroke="#0d3459" strokeWidth="1.5" x1="45" x2="495" y1="138" y2="138" />

          {/* Smooth Path */}
          <polyline
            fill="none"
            points={OEE_TREND_LINE}
            stroke="#1d72fe"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          />

          {/* Interactive Data Point Circles with Tooltip */}
          {OEE_TREND_POINTS.map((point) => (
            <circle
              key={point.day}
              cx={point.cx}
              cy={point.cy}
              fill="#1d72fe"
              r="4.5"
              stroke="#ffffff"
              strokeWidth="2.5"
              className="cursor-pointer"
              onMouseEnter={(event) => showTooltip(event, point.tip)}
              onMouseLeave={() => setTooltip(null)}
            />
          ))}

          {/* X-Axis Labels */}
          {OEE_TREND_POINTS.map((point) => (
            <text key={`${point.day}-label`} fill="#64748b" fontSize="11" fontWeight="600" textAnchor="middle" x={point.cx} y="172">
              {point.day}
            </text>
          ))}
        </svg>

        <div
          id="oee-tooltip"
          role="tooltip"
          aria-hidden={tooltip === null}
          className={cx(
            'pointer-events-none absolute z-10 rounded-lg border border-[#0d3459] bg-[#07243e] px-2 py-1 text-xs font-semibold text-white shadow-pop transition-opacity duration-150',
            tooltip ? 'opacity-100' : 'opacity-0',
          )}
          style={tooltip ? { left: tooltip.left, top: tooltip.top } : undefined}
        >
          {tooltip?.text ?? ''}
        </div>
      </div>
    </section>
  );
}
