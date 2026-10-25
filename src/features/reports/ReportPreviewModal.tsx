import { useMemo } from 'react';
import { Modal, StatusBadge, Table, Td, Th, Thead, Tr } from '../../components/ui';
import { Icon } from '../../components/Icon';
import { SCOPE_STRIP, samplePreviewRows, type ReportCardDef } from './shared';

export interface ReportPreviewModalProps {
  /** The card whose preview is open (null = closed). */
  report: ReportCardDef | null;
  onClose(): void;
  /** Download the active report's verified CSV (wired to `downloadReport`). */
  onDownload(report: ReportCardDef): void;
}

/**
 * Verified-data preview dialog (legacy `#report-preview-modal`): scope strip,
 * hard-coded sample telemetry table and the CSV download action.
 */
export function ReportPreviewModal({ report, onClose, onDownload }: ReportPreviewModalProps) {
  const today = useMemo(() => new Date().toISOString().split('T')[0] ?? '', []);
  const rows = useMemo(() => (report ? samplePreviewRows(report.previewTitle) : []), [report]);

  return (
    <Modal
      open={report !== null}
      onClose={onClose}
      size="lg"
      tone="dark"
      panelClassName="!bg-[#07243e]"
      labelledBy="report-preview-title"
    >
      {report && (
        <>
          {/* Header */}
          <div className="border-b border-[#0d3459] pb-3 pr-10">
            <h3 id="report-preview-title" className="text-xl font-bold text-white">
              {report.previewTitle}
            </h3>
            <p className="mt-0.5 text-xs text-slate-400">
              {report.previewSub} · Estimated Size: {report.size}
            </p>
          </div>

          {/* Filter and Scope Bar */}
          <dl className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-[#0d3459] bg-white/5 p-3.5 text-xs sm:grid-cols-3">
            {SCOPE_STRIP.map((item) => (
              <div key={item.label}>
                <dt className="console-label mb-1">{item.label}</dt>
                <dd className="font-bold text-white">{item.value}</dd>
              </div>
            ))}
          </dl>

          {/* Sample Data Preview Table */}
          <div className="mt-5">
            <h4 className="console-label mb-2">Sample Telemetry Records (Live Preview)</h4>
            <div className="rounded-xl border border-[#0d3459]">
              <Table tone="dark" className="text-xs">
                <Thead tone="dark">
                  <Tr>
                    <Th tone="dark">Date</Th>
                    <Th tone="dark">Entity</Th>
                    <Th tone="dark">Primary Metric</Th>
                    <Th tone="dark">Reading</Th>
                    <Th tone="dark">Status</Th>
                  </Tr>
                </Thead>
                <tbody>
                  {rows.map((row, i) => (
                    <Tr key={`${row.entity}-${row.metric}-${i}`}>
                      <Td tone="dark">{today}</Td>
                      <Td tone="dark" className="font-semibold text-white">
                        {row.entity}
                      </Td>
                      <Td tone="dark">{row.metric}</Td>
                      <Td tone="dark" className={`font-bold ${row.readingClass}`}>
                        {row.reading}
                      </Td>
                      <Td tone="dark">
                        <StatusBadge dark value={row.status} />
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#0d3459] pt-3">
            <span className="text-xs text-slate-400">Includes verified timestamps and machine tags</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="btn btn-sm rounded-lg bg-white/10 text-white hover:bg-white/20"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-sm rounded-lg bg-[#FF3D0A] text-white hover:bg-[#e03405]"
                onClick={() => onDownload(report)}
              >
                <Icon name="download" className="h-4 w-4" />
                Download Verified CSV
              </button>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
