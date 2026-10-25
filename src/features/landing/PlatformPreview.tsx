import { useState } from 'react';
import { Icon, type IconName } from '../../components/Icon';

type TabKey = 'overview' | 'machines' | 'analytics' | 'alerts' | 'reports' | 'settings';

/** Sidebar tab → live-region title (verbatim from the legacy titles map). */
const TAB_TITLES: Record<TabKey, string> = {
  overview: 'Process Overview',
  machines: 'Connected Line Assets',
  analytics: 'Drift & Anomaly Diagnostics',
  alerts: 'Real-time Incident Feed',
  reports: 'Yield & Performance Audits',
  settings: 'Telemetry & Sensor Config',
};

const TABS: Array<{ key: TabKey; icon: IconName; label: string }> = [
  { key: 'overview', icon: 'grid', label: 'Overview' },
  { key: 'machines', icon: 'machine', label: 'Machines' },
  { key: 'analytics', icon: 'bars', label: 'Analytics' },
  { key: 'alerts', icon: 'bell', label: 'Alerts' },
  { key: 'reports', icon: 'report', label: 'Reports' },
  { key: 'settings', icon: 'gear', label: 'Settings' },
];

const KPIS: Array<{ label: string; value: string; textClass: string; dotClass: string }> = [
  { label: 'Machine Health', value: 'Healthy', textClass: 'text-emerald-700', dotClass: 'bg-emerald-600' },
  { label: 'Anomaly Score', value: 'Low', textClass: 'text-blue-700', dotClass: 'bg-blue-600' },
  { label: 'Process Stability', value: 'Stable', textClass: 'text-emerald-700', dotClass: 'bg-emerald-600' },
];

/** Production-quality bar heights (percent) — same sample data as the legacy mock. */
const QUALITY_BARS: Array<{ height: string; color: string }> = [
  { height: 'h-[90%]', color: 'bg-emerald-500' },
  { height: 'h-[95%]', color: 'bg-emerald-500' },
  { height: 'h-[88%]', color: 'bg-emerald-500' },
  { height: 'h-[92%]', color: 'bg-emerald-500' },
  { height: 'h-[96%]', color: 'bg-emerald-500' },
  { height: 'h-[94%]', color: 'bg-emerald-500' },
  { height: 'h-[91%]', color: 'bg-emerald-500' },
  { height: 'h-[87%]', color: 'bg-emerald-500' },
  { height: 'h-[52%]', color: 'bg-orange-500' },
  { height: 'h-[38%]', color: 'bg-brand' },
];

const CHECKS: string[] = [
  'Live machine & process monitoring',
  'Anomaly detection & alerts',
  'Root cause analysis',
  'Customizable dashboards',
];

/**
 * Platform section — the interactive dashboard mock (sidebar tabs with
 * `aria-pressed` swap the live-region view title) beside the feature checklist.
 */
export function PlatformPreview() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  return (
    <section className="section-y bg-[#FAFAFA]" id="platform" aria-labelledby="platform-h">
      <div className="container-x grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <figure className="reveal min-w-0 lg:col-span-7">
          <div className="card overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="flex flex-col justify-between border-b border-gray-200 bg-slate-50 p-3 md:w-44 md:flex-none md:border-b-0 md:border-r">
                <div>
                  <div className="mb-3 flex items-center justify-between px-1 pt-1 text-sm font-black tracking-tight">
                    <span>DRYFTQ</span>
                    <span className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-[10px] font-medium text-gray-700">
                      v2.4
                    </span>
                  </div>
                  <div
                    className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 md:flex-col md:overflow-visible md:pb-0"
                    id="dashboardSidebarMenu"
                    role="group"
                    aria-label="Dashboard views"
                  >
                    {TABS.map((tab) => (
                      <button
                        key={tab.key}
                        className="tab-btn"
                        type="button"
                        data-tab={tab.key}
                        aria-pressed={activeTab === tab.key}
                        onClick={() => setActiveTab(tab.key)}
                      >
                        <Icon name={tab.icon} />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="mt-4 hidden border-t border-gray-200 pt-3 font-mono text-[11px] text-gray-600 md:block">
                  Telemetry: Active
                </p>
              </div>

              <div className="min-w-0 flex-1 p-4 sm:p-5" role="region" aria-live="polite" aria-label="Dashboard preview">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold" id="currentViewTitle">
                      {TAB_TITLES[activeTab]}
                    </h4>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      Live
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-gray-600">Line 3 | 12:42 PM</span>
                </div>

                <div className="my-3 grid grid-cols-3 gap-2">
                  {KPIS.map((kpi) => (
                    <div key={kpi.label} className="rounded-lg border border-gray-100 bg-gray-50 p-2">
                      <span className="block text-[11px] font-medium text-gray-600">{kpi.label}</span>
                      <span className={`mt-0.5 flex items-center gap-1 text-xs font-bold ${kpi.textClass}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${kpi.dotClass}`} />
                        {kpi.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mb-3 rounded-lg border border-gray-100 p-3">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <span className="text-xs font-bold">Temperature (°C)</span>
                    <span className="flex items-center gap-3 text-[11px] font-medium text-gray-600">
                      <span className="flex items-center gap-1">
                        <span className="h-0.5 w-3 bg-blue-500" />
                        Actual
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 border-b border-dashed border-gray-400" />
                        Expected
                      </span>
                      <span className="flex items-center gap-1 text-brand-action">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                        Anomaly
                      </span>
                    </span>
                  </div>
                  <div className="relative h-28">
                    <svg
                      className="h-full w-full"
                      preserveAspectRatio="none"
                      viewBox="0 0 500 110"
                      role="img"
                      aria-label="Line chart: actual temperature spikes above the expected baseline around 12:00"
                    >
                      <path d="M0 20h500M0 55h500M0 90h500" stroke="#f1f5f9" />
                      <path
                        d="M0,70 Q120,64 250,68 T500,66"
                        fill="none"
                        stroke="#cbd5e1"
                        strokeDasharray="3,3"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M0,72 Q70,66 140,70 T260,62 Q310,22 340,70 T500,68"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                      />
                      <circle cx="310" cy="24" r="5" fill="#FF5A1F" />
                      <circle cx="310" cy="24" r="9" fill="none" stroke="#FF5A1F" strokeWidth="1.5" opacity=".6" />
                    </svg>
                    <span className="absolute left-[62%] top-0 -translate-x-1/2 rounded bg-brand-action px-1.5 py-0.5 text-[11px] font-bold text-white shadow">
                      +14.2°C Drift
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between font-mono text-[10px] text-gray-600">
                    <span>08:00</span>
                    <span>10:00</span>
                    <span>12:00</span>
                    <span>14:00</span>
                    <span>16:00</span>
                  </div>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  <div className="rounded-lg border border-gray-100 p-3">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold">Vibration</span>
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-brand-action">
                        <span className="h-1 w-1 rounded-full bg-brand" />
                        Anomaly Detected
                      </span>
                    </div>
                    <svg className="h-10 w-full" preserveAspectRatio="none" viewBox="0 0 200 35" aria-hidden="true">
                      <path
                        d="M0,18 L15,20 L30,16 L45,21 L60,17 L75,19 L90,13 L100,26 L110,4 L120,30 L130,8 L140,22 L160,18 L200,18"
                        fill="none"
                        stroke="#0ea5e9"
                        strokeWidth="1.6"
                      />
                      <circle cx="110" cy="4" r="2.5" fill="#FF5A1F" />
                    </svg>
                  </div>
                  <div className="rounded-lg border border-gray-100 p-3">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold">Production Quality</span>
                      <span className="font-mono text-xs font-bold text-emerald-700">
                        98.7% <span className="font-sans text-[11px] font-normal text-gray-600">Good</span>
                      </span>
                    </div>
                    <div className="flex h-10 items-end gap-1" aria-hidden="true">
                      {QUALITY_BARS.map((bar, index) => (
                        <i key={index} className={`${bar.height} flex-1 rounded-t ${bar.color}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <figcaption className="mt-3 text-center text-xs text-gray-600">
            Illustrative interface preview with sample data.
          </figcaption>
        </figure>

        <div className="reveal lg:col-span-5">
          <h2 className="h2" id="platform-h">One clear view of <br className="hidden sm:block" />process health.</h2>
          <p className="lead mt-3">
            Real-time data, AI insights and actionable alerts — all in one powerful platform.
          </p>
          <ul className="mt-7 space-y-4">
            {CHECKS.map((check) => (
              <li key={check} className="flex items-center gap-3 font-semibold text-gray-800">
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-orange-100 text-brand-action">
                  <Icon name="check" className="!h-3.5 !w-3.5" />
                </span>
                {check}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
