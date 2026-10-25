import { useMemo, useState } from 'react';
import { cx } from '../../lib/utils';
import { DOWNTIME_SLICES } from './data';

/**
 * Downtime Analysis card — inline SVG donut with the six verbatim legacy
 * slices plus a legend that highlights the matching slice on hover/focus
 * (`highlightDonut()` / `resetDonut()` from the legacy script).
 */
export default function DowntimeCard() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex === null ? null : DOWNTIME_SLICES[activeIndex];

  // Legacy centre text + category chip, derived from the hovered slice.
  const { centerLabel, centerValue, chip } = useMemo(
    () => ({
      centerLabel: active ? active.category : 'Total',
      centerValue: active ? active.value : '2.6h',
      chip: active ? active.category : 'All Categories',
    }),
    [active],
  );

  return (
    <section className="console-card-solid flex flex-col justify-between rounded-2xl p-6" data-purpose="downtime-analysis-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-white">Downtime Analysis</h3>
        <span id="downtime-category-tag" className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-slate-300">
          {chip}
        </span>
      </div>

      <div className="flex h-full flex-col items-center justify-around gap-6 sm:flex-row">
        {/* Inline SVG Donut Chart */}
        <div className="relative flex h-48 w-48 flex-shrink-0 items-center justify-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 190 190" aria-hidden="true">
            <circle cx="95" cy="95" fill="transparent" r="68" stroke="#0d3459" strokeWidth="26" />
            {DOWNTIME_SLICES.map((slice, index) => (
              <circle
                key={slice.id}
                cx="95"
                cy="95"
                fill="transparent"
                r="68"
                stroke={slice.color}
                strokeDasharray={slice.dasharray}
                strokeDashoffset={slice.dashoffset}
                strokeWidth={activeIndex === index ? 30 : 26}
                className="cursor-pointer transition-[stroke-width] duration-200 ease-out"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              />
            ))}
          </svg>
          {/* Donut Center Text */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span id="donut-center-label" className="text-xs font-semibold text-slate-400">
              {centerLabel}
            </span>
            <span id="donut-center-value" className="text-2xl font-black tracking-tight text-white">
              {centerValue}
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="flex w-full max-w-[240px] flex-1 flex-col space-y-2.5 sm:w-auto">
          {DOWNTIME_SLICES.map((slice, index) => (
            <button
              key={slice.id}
              type="button"
              className={cx(
                'flex w-full items-center justify-between rounded-md px-1 text-left text-xs transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3D0A]/60',
                activeIndex === index && 'opacity-75',
              )}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              onFocus={() => setActiveIndex(index)}
              onBlur={() => setActiveIndex(null)}
            >
              <span className="flex items-center gap-2 font-medium text-slate-300">
                <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
                <span>{slice.legendLabel}</span>
              </span>
              <span className="font-bold text-white">{slice.percent}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
