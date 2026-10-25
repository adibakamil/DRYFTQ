import { usePlantState, useToasts } from '../../store/context';
import { downloadReport } from '../../lib/reports';
import { ENERGY_LINE, ENERGY_POINTS } from './data';

/**
 * Energy Consumption card — headline draw, 7-day delta, CSV export
 * (`Dryftq.downloadReportCSV('Energy Report')` → `downloadReport()`) and the
 * legacy 10-point sparkline with per-point `title` tooltips.
 */
export default function EnergyConsumptionCard() {
  const state = usePlantState();
  const { notify } = useToasts();

  const exportCsv = () => {
    const filename = downloadReport('Energy Report', state);
    notify({ message: `Exported ${filename} successfully.`, type: 'success', title: 'Report Exported' });
  };

  return (
    <section className="console-card-solid flex flex-col justify-between rounded-2xl p-6" data-purpose="energy-consumption-card">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Energy Consumption</h3>
          <button
            type="button"
            onClick={exportCsv}
            className="flex items-center gap-1 text-xs font-semibold text-orange-400 transition-colors hover:text-orange-300 hover:underline"
          >
            Export CSV &darr;
          </button>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-white">12.4 kw</span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-emerald-400">
          <svg className="h-3.5 w-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>4.2%</span>
          <span className="font-medium text-slate-400">vs last 7 days</span>
        </div>
      </div>

      {/* Bottom Sparkline Wave Chart */}
      <div id="energy-sparkline-container" className="relative h-16 w-full pt-3">
        <svg className="h-full w-full overflow-visible" viewBox="0 0 400 48" preserveAspectRatio="none" aria-hidden="true">
          <polyline
            fill="none"
            points={ENERGY_LINE}
            stroke="#1d72fe"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
          />
          {ENERGY_POINTS.map((point) => (
            <circle key={point.cx} cx={point.cx} cy={point.cy} fill="#1d72fe" r="3.5" stroke="#ffffff" strokeWidth="2" className="cursor-pointer">
              <title>{point.tip}</title>
            </circle>
          ))}
        </svg>
      </div>
    </section>
  );
}
