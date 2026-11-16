import { useEffect, useRef, useState } from 'react';
import { useStore } from '../../store/context';
import { Icon } from '../../components/Icon';

/**
 * `QUANTUM-DRIFT™ CORE` — the dark hero card on the updated dashboard.
 *
 * The console's light theme (`body.console-light`) remaps `text-white`,
 * `text-slate-*`, `border-white/*`, `bg-white/*` and a handful of solid navy
 * hexes to white-on-light surfaces. This card is intentionally dark in both
 * themes, so it uses arbitrary hex utilities only (no remappable class names).
 */

const RING_RADIUS = 84;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const STABILITY = 99.84;

const MINI_STATS = [
  { label: 'Spindle Vibration', value: '2.3 m/s' },
  { label: 'Thermal Envelope', value: '74.2 °C' },
  { label: 'Kinematic Drift', value: '0.003 m' },
];

export default function QuantumDriftCore() {
  const { notify } = useStore();
  const [sweeping, setSweeping] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const runSweep = () => {
    if (sweeping) return;
    setSweeping(true);
    timer.current = window.setTimeout(() => {
      setSweeping(false);
      notify({
        title: 'Drift Sweep Complete',
        message: 'Neural drift sweep finished — invariance stable at 99.84%.',
        type: 'success',
      });
    }, 1200);
  };

  return (
    <section
      aria-label="QUANTUM-DRIFT CORE telemetry"
      data-purpose="quantum-drift-core"
      className="relative overflow-hidden rounded-[28px] border border-[#1d3049] bg-[linear-gradient(165deg,#101d2f_0%,#17273c_46%,#0b1725_100%)] p-5 shadow-[0_24px_60px_-30px_rgba(8,20,34,0.65)] sm:p-7"
    >
      {/* ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(249,83,9,0.16),transparent_68%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.10),transparent_70%)]"
      />

      <div className="relative space-y-6">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#2b4160] bg-[#16263a] text-[#ff8a3d]"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M12 2.6l7.6 4.4v9.8L12 21.2 4.4 16.8V7z" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="2.6" />
              </svg>
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-[13px] font-extrabold uppercase tracking-[0.18em] text-[#eaf1fb] sm:text-sm">
                  QUANTUM-DRIFT&trade; CORE
                </h2>
                <span className="rounded-full border border-[#2b4160] bg-[#16263a] px-2.5 py-[3px] text-[9px] font-bold uppercase tracking-[0.16em] text-[#93a8c2]">
                  Neural v4.2
                </span>
              </div>
              <p className="mt-1 truncate text-xs font-medium text-[#8ea4bf]">
                Human-Aware Real-time Invariance Engine
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-[#1f4d43] bg-[#0f2a26] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#4ade80]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4ade80]" />
            Active
          </span>
        </header>

        {/* Gauge + headline metrics */}
        <div className="grid items-center gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="flex flex-col items-center">
            <div className="relative grid h-[176px] w-[176px] place-items-center">
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(249,83,9,0.28),rgba(249,83,9,0.06)_48%,transparent_72%)]"
              />
              <svg viewBox="0 0 200 200" className="relative h-full w-full -rotate-90" aria-hidden="true">
                <defs>
                  <linearGradient id="qdc-ring" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f95309" />
                    <stop offset="58%" stopColor="#ff9a4d" />
                    <stop offset="100%" stopColor="#2dd4bf" />
                  </linearGradient>
                </defs>
                <circle cx="100" cy="100" r={RING_RADIUS} fill="none" stroke="#1b2c42" strokeWidth="9" />
                <circle
                  cx="100"
                  cy="100"
                  r={RING_RADIUS}
                  fill="none"
                  stroke="url(#qdc-ring)"
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={`${(RING_CIRCUMFERENCE * STABILITY) / 100} ${RING_CIRCUMFERENCE}`}
                />
              </svg>
              <div
                aria-hidden="true"
                className="absolute h-16 w-16 animate-pulse rounded-full bg-[radial-gradient(circle,rgba(255,163,102,0.55),rgba(249,83,9,0.12)_55%,transparent_72%)]"
              />
              <span className="absolute text-[15px] font-extrabold tracking-tight text-[#f3f7fd]">
                {STABILITY.toFixed(2)}%
              </span>
            </div>
            <span className="mt-3 text-[9px] font-bold uppercase tracking-[0.32em] text-[#7f95b1]">
              Live Telemetry
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <span className="block text-[11px] font-semibold text-[#8ea4bf]">
                Invariance Stability
              </span>
              <span className="mt-1.5 flex flex-wrap items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-[#f3f7fd] sm:text-4xl">
                  {STABILITY.toFixed(2)}%
                </span>
                <span className="text-xs font-bold text-[#34d399]">+0.12%</span>
              </span>
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-[#8ea4bf]">
                Throughput
              </span>
              <span className="mt-1.5 block text-3xl font-extrabold tracking-tight text-[#f3f7fd] sm:text-4xl">
                1.24M <span className="text-xl font-bold text-[#8ea4bf] sm:text-2xl">pts/s</span>
              </span>
            </div>
          </div>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-1 gap-3 border-t border-[#1e2f45] pt-4 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-[#1e2f45]">
          {MINI_STATS.map((stat) => (
            <div key={stat.label} className="sm:px-4 sm:first:pl-0 sm:last:pr-0">
              <span className="block text-[10px] font-semibold text-[#8298b3]">
                {stat.label}
              </span>
              <span className="mt-1 block text-sm font-bold text-[#e6edf8]">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Action */}
        <button
          type="button"
          onClick={runSweep}
          disabled={sweeping}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(90deg,#f95309,#ef7a12)] px-4 py-3 text-sm font-bold tracking-wide text-[#ffffff] shadow-[0_14px_30px_-16px_rgba(249,83,9,0.9)] transition-[filter,transform] hover:brightness-110 active:translate-y-px disabled:cursor-progress disabled:opacity-80"
        >
          <Icon name="bolt" className={sweeping ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
          {sweeping ? 'Running Neural Drift Sweep…' : 'Run Neural Drift Sweep'}
        </button>

        <p className="text-center text-[10px] font-medium tracking-[0.06em] text-[#7f95b1]">
          Edge AI Architecture: Quantized 4-bit INT4 Tensor Core
        </p>
      </div>
    </section>
  );
}
