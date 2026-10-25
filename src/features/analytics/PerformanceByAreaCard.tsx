import { useNavigate } from 'react-router-dom';
import { cx } from '../../lib/utils';
import { AREA_BARS } from './data';

/**
 * Performance by Area card — four horizontal bars (verbatim legacy values and
 * colours). Each row deep-links to that line's machines
 * (`Dryftq.navigateTo('machines', { search: 'Line N' })`).
 */
export default function PerformanceByAreaCard() {
  const navigate = useNavigate();

  return (
    <section className="console-card-solid flex flex-col justify-between rounded-2xl p-6" data-purpose="performance-by-area-card">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-base font-bold text-white">Performance by Area</h3>
        <span className="text-xs text-slate-400">Click a line to view machines</span>
      </div>

      <div className="space-y-4">
        {AREA_BARS.map((bar) => (
          <button
            key={bar.line}
            type="button"
            title={`View ${bar.line} Machines`}
            onClick={() => navigate(`/machines?search=${encodeURIComponent(bar.line)}`)}
            className="flex w-full items-center gap-4 rounded-lg p-1.5 text-left transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3D0A]/60"
          >
            <span className="w-14 text-sm font-semibold text-white">{bar.line}</span>
            <span className="h-3 flex-1 overflow-hidden rounded-full bg-white/10">
              <span
                className={cx('block h-full rounded-full transition-all duration-500', bar.barClass)}
                style={{ width: bar.percent }}
              />
            </span>
            <span className="w-12 text-right text-xs font-bold text-white">{bar.percent}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
