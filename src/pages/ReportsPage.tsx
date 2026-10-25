/**
 * Reports module — React migration of the legacy
 * `DRYFTQ ALL DASHBOARD/DRYFTQ DASHBOARD 5 (REPORT)/code.html`.
 *
 * Card catalogue, preview sample rows and builder copy are ported verbatim
 * from the legacy page; CSV generation is delegated to `src/lib/reports.ts`.
 */
import { useMemo, useState } from 'react';
import { useStore } from '../store/context';
import { downloadReport } from '../lib/reports';
import { cx, matchesQuery } from '../lib/utils';
import { Icon } from '../components/Icon';
import { EmptyState, SearchInput } from '../components/ui';
import { REPORT_CARDS, type ReportCardDef } from '../features/reports/shared';
import { ReportPreviewModal } from '../features/reports/ReportPreviewModal';
import { CustomReportModal } from '../features/reports/CustomReportModal';

type ReportTab = 'standard' | 'custom';

const TAB_CLASS = 'rounded-lg px-7 py-2 text-sm font-semibold transition-colors';

/* ------------------------------------------------------------------ */
/* Report card                                                         */
/* ------------------------------------------------------------------ */

function ReportCard({
  report,
  onOpen,
  onAction,
}: {
  report: ReportCardDef;
  onOpen(report: ReportCardDef): void;
  onAction(report: ReportCardDef): void;
}) {
  return (
    <article
      data-purpose="report-card"
      className="console-card group relative flex items-center justify-between gap-3 px-6 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07]"
    >
      {/* Card body opens the preview (or the builder for the custom card). */}
      <button
        type="button"
        onClick={() => onOpen(report)}
        aria-label={
          report.opensBuilder
            ? `Open ${report.title} builder`
            : `Open ${report.title} preview, ${report.sub}`
        }
        className="flex min-w-0 flex-1 items-center gap-4 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3D0A]"
      >
        <span
          className={cx(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
            report.tint,
          )}
        >
          <Icon name={report.icon} className="h-6 w-6" />
        </span>
        <span className="min-w-0">
          <h3 className="truncate text-[16px] font-bold text-white">{report.title}</h3>
          <p className="mt-0.5 truncate text-xs text-slate-400">{report.sub}</p>
        </span>
      </button>

      {/* Trailing action: direct CSV download / custom builder configure. */}
      <button
        type="button"
        aria-label={report.actionLabel}
        title={report.actionTitle}
        onClick={() => onAction(report)}
        className="shrink-0 rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-[#FF3D0A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF3D0A]"
      >
        <Icon name={report.actionIcon} className="h-5 w-5" />
      </button>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function ReportsPage() {
  const { state, notify } = useStore();

  // Local UI state (legacy: `switchReportsTab`, `#report-search-input`,
  // `#report-preview-modal`, `#custom-builder-modal`).
  const [tab, setTab] = useState<ReportTab>('standard');
  const [query, setQuery] = useState('');
  const [preview, setPreview] = useState<ReportCardDef | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);

  // Keyword filter — legacy matched the card's visible text.
  const cards = useMemo(
    () => REPORT_CARDS.filter((c) => matchesQuery(query, c.title, c.sub)),
    [query],
  );

  /** Build + download a CSV and toast the legacy confirmation copy. */
  const exportReport = (reportType: string) => {
    const filename = downloadReport(reportType, state);
    notify({
      message: `Exported ${filename} successfully.`,
      type: 'success',
      title: 'Report Exported',
    });
  };

  const openReport = (report: ReportCardDef) => {
    if (report.opensBuilder) setBuilderOpen(true);
    else setPreview(report);
  };

  const handleAction = (report: ReportCardDef) => {
    if (report.opensBuilder) setBuilderOpen(true);
    else exportReport(report.downloadType);
  };

  const selectTab = (next: ReportTab) => {
    setTab(next);
    // Legacy behaviour: picking Custom highlights the tab and opens the builder.
    if (next === 'custom') setBuilderOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Workspace header */}
      <div>
        <h2 className="text-lg font-bold text-white">Reports</h2>
        <p className="mt-1 text-sm text-slate-400">
          Generate and export verified plant operational datasets
        </p>
      </div>

      {/* Tabs filter bar & search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2" role="group" aria-label="Report type">
          <button
            type="button"
            aria-pressed={tab === 'standard'}
            onClick={() => selectTab('standard')}
            className={cx(
              TAB_CLASS,
              tab === 'standard'
                ? 'bg-[#FF3D0A] text-white shadow-sm'
                : 'text-slate-300 hover:bg-white/10 hover:text-white',
            )}
          >
            Standard
          </button>
          <button
            type="button"
            aria-pressed={tab === 'custom'}
            onClick={() => selectTab('custom')}
            className={cx(
              TAB_CLASS,
              tab === 'custom'
                ? 'bg-[#FF3D0A] text-white shadow-sm'
                : 'text-slate-300 hover:bg-white/10 hover:text-white',
            )}
          >
            Custom
          </button>
        </div>
        <div className="w-full sm:w-72">
          <SearchInput
            id="report-search-input"
            aria-label="Filter reports by keyword"
            placeholder="Filter reports by keyword..."
            value={query}
            onChange={setQuery}
            onClear={() => setQuery('')}
            className="[&_input]:border-white/10 [&_input]:bg-white/5 [&_input]:text-white [&_input]:placeholder-slate-500"
          />
        </div>
      </div>

      {/* Reports 2x4 grid */}
      <section aria-label="Available Reports List" className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {cards.map((report) => (
          <ReportCard key={report.id} report={report} onOpen={openReport} onAction={handleAction} />
        ))}
      </section>

      {cards.length === 0 && (
        <EmptyState
          tone="dark"
          title="No reports match your filter"
          message="Try a different keyword to find a report."
        />
      )}

      {/* Main call-to-action */}
      <div data-purpose="generate-action-footer">
        <button
          type="button"
          onClick={() => setBuilderOpen(true)}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#FF3D0A] py-4 text-base font-bold text-white transition-all duration-200 hover:bg-[#e03405] active:scale-[0.99]"
        >
          <Icon name="target" className="h-5 w-5" />
          <span>Generate Custom Report</span>
        </button>
      </div>

      {/* Report preview modal */}
      <ReportPreviewModal
        report={preview}
        onClose={() => setPreview(null)}
        onDownload={(report) => {
          exportReport(report.downloadType);
          setPreview(null);
        }}
      />

      {/* Custom report builder modal */}
      <CustomReportModal
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        onGenerate={() => {
          setBuilderOpen(false);
          exportReport('Custom Report');
        }}
      />
    </div>
  );
}
