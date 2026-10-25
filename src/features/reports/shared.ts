import type { IconName } from '../../components/Icon';

/**
 * Static catalogue of the eight report cards, ported verbatim from
 * `DRYFTQ ALL DASHBOARD/DRYFTQ DASHBOARD 5 (REPORT)/code.html`
 * (titles, sub-lines, sizes, icons, tints and download types).
 */

/** Icon tile tints — dark-console adaptation of the legacy pastel tiles. */
const ORANGE = 'bg-orange-500/10 text-orange-400';
const AMBER = 'bg-amber-500/10 text-amber-400';
const RED = 'bg-red-500/10 text-red-400';
const BLUE = 'bg-blue-500/10 text-blue-400';
const EMERALD = 'bg-emerald-500/10 text-emerald-400';

export interface ReportCardDef {
  /** Stable key. */
  id: string;
  /** Card headline (legacy `<h3>`). */
  title: string;
  /** Card sub-line, e.g. `Daily Production - 2.4 MB`. */
  sub: string;
  /** Preview modal headline (legacy `openReportPreview(title, …)`). */
  previewTitle: string;
  /** Preview modal sub-line topic, e.g. `Daily Production`. */
  previewSub: string;
  /** Estimated size label, e.g. `2.4 MB`. */
  size: string;
  /** Report type handed to `downloadReport` (legacy card download type). */
  downloadType: string;
  /** Icon in the card's tinted tile. */
  icon: IconName;
  /** Tailwind classes tinting the icon tile. */
  tint: string;
  /** aria-label for the trailing card button. */
  actionLabel: string;
  /** Tooltip title for the trailing card button. */
  actionTitle: string;
  /** Trailing button glyph — download for exports, plus for the builder. */
  actionIcon: IconName;
  /** `true` → the card opens the custom builder instead of a preview. */
  opensBuilder?: boolean;
}

export const REPORT_CARDS: ReportCardDef[] = [
  {
    id: 'production',
    title: 'Production Report',
    sub: 'Daily Production - 2.4 MB',
    previewTitle: 'Production Report',
    previewSub: 'Daily Production',
    size: '2.4 MB',
    downloadType: 'Production Report',
    icon: 'chart',
    tint: ORANGE,
    actionLabel: 'Download Production Report',
    actionTitle: 'Download Production Report CSV',
    actionIcon: 'download',
  },
  {
    id: 'energy',
    title: 'Energy Report',
    sub: 'Energy Consumption - 1.3 MB',
    previewTitle: 'Energy Report',
    previewSub: 'Energy Consumption',
    size: '1.3 MB',
    downloadType: 'Energy Report',
    icon: 'bolt',
    tint: AMBER,
    actionLabel: 'Download Energy Report',
    actionTitle: 'Download Energy Report CSV',
    actionIcon: 'download',
  },
  {
    id: 'quality',
    title: 'Quality Report',
    sub: 'Quality Analysis - 1.5 MB',
    previewTitle: 'Quality Report',
    previewSub: 'Quality Analysis',
    size: '1.5 MB',
    downloadType: 'Quality Report',
    icon: 'report',
    tint: RED,
    actionLabel: 'Download Quality Report',
    actionTitle: 'Download Quality Report CSV',
    actionIcon: 'download',
  },
  {
    // Legacy quirk kept: the headline says "Production Report" but the card
    // previews/downloads the date-wise variant (`Production Report` CSV type).
    id: 'datewise',
    title: 'Production Report',
    sub: 'Date-wise Production - 3.2 MB',
    previewTitle: 'Date-wise Production Report',
    previewSub: 'Date-wise Production',
    size: '3.2 MB',
    downloadType: 'Production Report',
    icon: 'factory',
    tint: BLUE,
    actionLabel: 'Download Date-wise Production Report',
    actionTitle: 'Download Date-wise Production Report CSV',
    actionIcon: 'download',
  },
  {
    id: 'performance',
    title: 'Performance Report',
    sub: 'OEE Analysis - 1.7 MB',
    previewTitle: 'Performance Report',
    previewSub: 'OEE Analysis',
    size: '1.7 MB',
    downloadType: 'Performance Report',
    icon: 'bolt',
    tint: EMERALD,
    actionLabel: 'Download Performance Report',
    actionTitle: 'Download Performance Report CSV',
    actionIcon: 'download',
  },
  {
    id: 'downtime',
    title: 'Downtime Report',
    sub: 'Downtime Analysis - 1.2 MB',
    previewTitle: 'Downtime Report',
    previewSub: 'Downtime Analysis',
    size: '1.2 MB',
    downloadType: 'Downtime Report',
    icon: 'clock',
    tint: BLUE,
    actionLabel: 'Download Downtime Report',
    actionTitle: 'Download Downtime Report CSV',
    actionIcon: 'download',
  },
  {
    id: 'maintenance',
    title: 'Maintenance Report',
    sub: 'Asset Health - 2.0 MB',
    previewTitle: 'Maintenance Report',
    previewSub: 'Asset Health',
    size: '2.0 MB',
    downloadType: 'Maintenance Report',
    icon: 'edit',
    tint: BLUE,
    actionLabel: 'Download Maintenance Report',
    actionTitle: 'Download Maintenance Report CSV',
    actionIcon: 'download',
  },
  {
    id: 'custom',
    title: 'Custom Report',
    sub: 'Build your own custom report',
    previewTitle: 'Custom Report',
    previewSub: 'Build your own custom report',
    size: '—',
    downloadType: 'Custom Report',
    icon: 'file',
    tint: BLUE,
    actionLabel: 'Configure Custom Report',
    actionTitle: 'Build Custom Report',
    actionIcon: 'plus',
    opensBuilder: true,
  },
];

/* ------------------------------------------------------------------ */
/* Preview sample rows (legacy `openReportPreview` tbody injection)    */
/* ------------------------------------------------------------------ */

export interface PreviewRow {
  entity: string;
  metric: string;
  reading: string;
  /** Reading colour (legacy `text-emerald-600` etc., dark-console variant). */
  readingClass: string;
  status: string;
}

/** Hard-coded sample telemetry rows keyed by report type — verbatim from legacy. */
export function samplePreviewRows(previewTitle: string): PreviewRow[] {
  if (previewTitle.includes('Production')) {
    return [
      { entity: 'Line 1', metric: 'Units', reading: '1,180', readingClass: 'text-emerald-400', status: 'Optimal' },
      { entity: 'Line 2', metric: 'Units', reading: '940', readingClass: 'text-amber-400', status: 'Attention' },
      { entity: 'Line 3', metric: 'Units', reading: '852', readingClass: 'text-emerald-400', status: 'Optimal' },
    ];
  }
  if (previewTitle.includes('Energy')) {
    return [
      { entity: 'CNC-01', metric: 'Power', reading: '2.4 kW', readingClass: 'text-blue-400', status: 'Normal' },
      { entity: 'PRESS-02', metric: 'Power', reading: '3.1 kW', readingClass: 'text-blue-400', status: 'Normal' },
      { entity: 'BOILER-01', metric: 'Power', reading: '3.2 kW', readingClass: 'text-amber-400', status: 'Elevated' },
    ];
  }
  if (previewTitle.includes('Quality')) {
    return [
      { entity: 'Line 1', metric: 'Yield Rate', reading: '99.0%', readingClass: 'text-emerald-400', status: 'Passed' },
      { entity: 'Line 2', metric: 'Yield Rate', reading: '93.3%', readingClass: 'text-amber-400', status: 'Inspection' },
    ];
  }
  return [
    { entity: 'Plant-Wide', metric: 'OEE', reading: '85.6%', readingClass: 'text-emerald-400', status: 'Verified' },
    { entity: 'Plant-Wide', metric: 'Availability', reading: '92.3%', readingClass: 'text-emerald-400', status: 'Verified' },
  ];
}

/** Scope strip values — identical for every report (legacy modal markup). */
export const SCOPE_STRIP = [
  { label: 'Time Horizon', value: 'Last 7 Days (Verified)' },
  { label: 'Scope', value: 'Plant-Wide (Lines 1-4)' },
  { label: 'Data Format', value: 'CSV Spreadsheet' },
] as const;

/** Dark-panel label styling shared by both modals (kit `.label` is light-only). */
export const MODAL_LABEL = 'mb-1 block text-xs font-semibold text-slate-300';
/** `.field` utilities overridden for the dark console panel. */
export const MODAL_FIELD =
  'min-h-[40px] border-white/15 bg-white/5 text-sm text-white placeholder-slate-500';
