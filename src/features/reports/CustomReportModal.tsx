import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Modal, Select, TextInput } from '../../components/ui';
import { MODAL_FIELD, MODAL_LABEL } from './shared';

/** Primary data streams — all checked by default (legacy builder markup). */
const DATA_STREAMS = [
  { id: 'oee', label: 'OEE & Availability' },
  { id: 'energy', label: 'Energy Consumption (kW)' },
  { id: 'vibration', label: 'Vibration & Temperature' },
  { id: 'maintenance', label: 'Maintenance Logs' },
] as const;

type StreamId = (typeof DATA_STREAMS)[number]['id'];

const RANGES = ['Last 7 Days', 'Last 24 Hours', 'Last 30 Days'] as const;
const LINES = ['All Lines (1-4)', 'Line 1', 'Line 2', 'Line 3'] as const;

export interface CustomReportModalProps {
  open: boolean;
  onClose(): void;
  /** Fire the CSV download for the configured report (wired to `downloadReport`). */
  onGenerate(): void;
}

/**
 * Custom Report Generator dialog (legacy `#custom-builder-modal`).
 *
 * Keeps the legacy 600 ms "Processing Telemetry..." disabled state before the
 * download fires; the timeout is cleaned up if the page unmounts.
 */
export function CustomReportModal({ open, onClose, onGenerate }: CustomReportModalProps) {
  const [title, setTitle] = useState('Plant Operations Telemetry Audit');
  const [streams, setStreams] = useState<Record<StreamId, boolean>>({
    oee: true,
    energy: true,
    vibration: true,
    maintenance: true,
  });
  const [range, setRange] = useState<string>(RANGES[0]);
  const [line, setLine] = useState<string>(LINES[0]);
  const [processing, setProcessing] = useState(false);
  const timer = useRef<number | null>(null);

  // Clear any pending processing timer on unmount.
  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const toggleStream = (id: StreamId) => setStreams((prev) => ({ ...prev, [id]: !prev[id] }));

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (processing) return;
    setProcessing(true);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      setProcessing(false);
      onGenerate();
    }, 600);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      tone="dark"
      panelClassName="!bg-[#07243e]"
      aria-label="Custom Report Generator"
    >
      <div className="border-b border-[#0d3459] pb-3 pr-10">
        <h3 className="text-lg font-bold text-white">Custom Report Generator</h3>
      </div>

      <form onSubmit={submit} className="mt-4 space-y-4 text-xs">
        <div>
          <label className={MODAL_LABEL} htmlFor="custom-rep-title">
            Report Title <span className="text-[#FF3D0A]">*</span>
          </label>
          <TextInput
            id="custom-rep-title"
            required
            className={MODAL_FIELD}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <fieldset>
          <legend className={MODAL_LABEL}>
            Select Primary Data Streams <span className="text-[#FF3D0A]">*</span>
          </legend>
          <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {DATA_STREAMS.map((stream) => (
              <label
                key={stream.id}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/15 bg-white/5 p-2 text-slate-300 hover:bg-white/10"
              >
                <input
                  type="checkbox"
                  checked={streams[stream.id]}
                  onChange={() => toggleStream(stream.id)}
                  className="rounded accent-[#FF3D0A]"
                />
                <span>{stream.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={MODAL_LABEL} htmlFor="custom-rep-range">
              Date Horizon
            </label>
            <Select id="custom-rep-range" className={MODAL_FIELD} value={range} onChange={(e) => setRange(e.target.value)}>
              {RANGES.map((r) => (
                <option key={r} value={r} className="bg-[#07243e] text-white">
                  {r}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className={MODAL_LABEL} htmlFor="custom-rep-line">
              Plant Section
            </label>
            <Select id="custom-rep-line" className={MODAL_FIELD} value={line} onChange={(e) => setLine(e.target.value)}>
              {LINES.map((l) => (
                <option key={l} value={l} className="bg-[#07243e] text-white">
                  {l}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#0d3459] pt-3">
          <button
            type="button"
            className="btn btn-sm rounded-lg bg-white/10 text-white hover:bg-white/20"
            onClick={onClose}
            disabled={processing}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-sm rounded-lg bg-[#FF3D0A] text-white hover:bg-[#e03405]"
            disabled={processing}
          >
            {processing ? 'Processing Telemetry...' : 'Generate & Download CSV →'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
