import { useId, useMemo } from 'react';
import { useStore } from '../store/context';
import { cx } from '../lib/utils';
import DigitalTwin from '../features/dashboard/DigitalTwin';
import PerformanceOverview from '../features/dashboard/PerformanceOverview';
import QuantumDriftCore from '../features/dashboard/QuantumDriftCore';

/* ------------------------------------------------------------------ */
/* Sparkline                                                           */
/* ------------------------------------------------------------------ */

interface SparklineProps {
  values: number[];
  stroke: string;
  fill: string;
}

/** Smooth Catmull-Rom sparkline with a soft gradient wash underneath. */
function Sparkline({ values, stroke, fill }: SparklineProps) {
  const gradientId = `kpi-spark-${useId().replace(/:/g, '')}`;
  const w = 96;
  const h = 44;

  const points = useMemo(() => {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    return values.map((v, i) => {
      const x = 4 + (i * (w - 8)) / Math.max(1, values.length - 1);
      const y = h - 5 - ((v - min) / span) * (h - 12);
      return [x, y] as const;
    });
  }, [values]);

  const line = useMemo(() => {
    if (points.length < 2) return '';
    const first = points[0]!;
    let d = `M ${first[0]} ${first[1]}`;
    for (let i = 0; i < points.length - 1; i += 1) {
      const p0 = points[i - 1] ?? points[i]!;
      const p1 = points[i]!;
      const p2 = points[i + 1]!;
      const p3 = points[i + 2] ?? p2;
      const c1x = p1[0] + (p2[0] - p0[0]) / 6;
      const c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6;
      const c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2[0]} ${p2[1]}`;
    }
    return d;
  }, [points]);

  const last = points[points.length - 1];

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="kpi-spark" aria-hidden focusable="false">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.3" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      {line && <path d={`${line} L ${w - 4} ${h} L 4 ${h} Z`} fill={`url(#${gradientId})`} stroke="none" />}
      <path d={line} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {last && <circle cx={last[0]} cy={last[1]} r="2.6" fill="#ffffff" stroke={stroke} strokeWidth="1.6" />}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* KPI card                                                            */
/* ------------------------------------------------------------------ */

interface KpiCardProps {
  label: string;
  value: string;
  pill?: { label: string; tone: 'green' | 'blue'; icon: 'dot' | 'up' };
  sub?: string;
  accent?: 'green';
  spark: number[];
  stroke: string;
  fill: string;
}

function KpiCard({ label, value, pill, sub, accent, spark, stroke, fill }: KpiCardProps) {
  return (
    <article className={cx('kpi-card', accent === 'green' && 'kpi-card--green')}>
      <div className="kpi-card__head">
        <span className="kpi-card__label">{label}</span>
        {pill && (
          <span className={cx('kpi-pill', `kpi-pill--${pill.tone}`)}>
            {pill.icon === 'dot' ? (
              <span className="kpi-pill__dot" aria-hidden />
            ) : (
              <span className="kpi-pill__up" aria-hidden>
                ▲
              </span>
            )}
            {pill.label}
          </span>
        )}
      </div>

      <div className="kpi-card__body">
        <div className="min-w-0">
          <div className="kpi-card__value">{value}</div>
          {sub && <div className="kpi-card__sub">{sub}</div>}
        </div>
        <Sparkline values={spark} stroke={stroke} fill={fill} />
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const GREEN = { stroke: '#22c55e', fill: '#22c55e' };
const BLUE = { stroke: '#3b82f6', fill: '#3b82f6' };

const SPARKS = {
  health: [54, 56, 55, 59, 58, 62, 61, 65, 64, 68, 67, 70],
  anomalies: [4, 5, 4, 3, 5, 4, 4, 3, 4, 3, 3, 3],
  stability: [82, 84, 83, 86, 85, 88, 87, 89, 90, 91, 91, 92.3],
  oee: [48, 49, 51, 50, 52, 51, 53, 52, 54, 55, 54.6, 55.5],
};

/**
 * Plant overview: the four headline KPIs over the interactive floor digital
 * twin, followed by the QUANTUM-DRIFT CORE telemetry card and the previous
 * performance chart (temperature / vibration) restored beneath it.
 */
export default function DashboardPage() {
  const { state } = useStore();
  const activeAlerts = useMemo(() => state.alerts.filter((a) => a.status === 'Active').length, [state.alerts]);

  return (
    <div className="mx-auto max-w-[1440px] space-y-5">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Plant KPIs">
        <KpiCard
          label="Machine Health"
          value="70.0%"
          pill={{ label: 'Healthy', tone: 'green', icon: 'dot' }}
          accent="green"
          spark={SPARKS.health}
          stroke={GREEN.stroke}
          fill={GREEN.fill}
        />
        <KpiCard
          label="Anomaly Detection"
          value={String(activeAlerts)}
          pill={{ label: 'Active', tone: 'blue', icon: 'up' }}
          spark={SPARKS.anomalies}
          stroke={BLUE.stroke}
          fill={BLUE.fill}
        />
        <KpiCard
          label="Process Stability"
          value="92.3%"
          pill={{ label: 'Stable', tone: 'green', icon: 'dot' }}
          spark={SPARKS.stability}
          stroke={BLUE.stroke}
          fill={BLUE.fill}
        />
        <KpiCard
          label="Overall OEE"
          value="55.5%"
          sub="↑ 2.1% vs last 7 days"
          spark={SPARKS.oee}
          stroke={BLUE.stroke}
          fill={BLUE.fill}
        />
      </section>

      <DigitalTwin />

      <QuantumDriftCore />

      <PerformanceOverview />
    </div>
  );
}
