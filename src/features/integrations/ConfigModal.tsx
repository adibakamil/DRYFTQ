import { useEffect, useRef, useState, type FormEvent } from 'react';
import { cx } from '../../lib/utils';
import { Field, Modal, Select, TextInput } from '../../components/ui';
import { useStore } from '../../store/context';
import type { Integration } from '../../lib/types';
import {
  ACCENT_BTN,
  FIELD_DARK,
  MUTED_BTN,
  STATE_OPTIONS,
  SYNC_INTERVALS,
  draftFor,
  type ConnectionState,
  type IntegDraft,
} from './shared';

/** Legacy `#integ-test-feedback` tones (rose = invalid, emerald = verified). */
type Feedback = { tone: 'rose' | 'emerald'; message: string };

const FEEDBACK_TONE: Record<Feedback['tone'], string> = {
  rose: 'border border-rose-500/40 bg-rose-500/15 text-rose-400',
  emerald: 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-400',
};

const BADGE_TONE = {
  Connected: 'bg-emerald-500/15 text-emerald-400',
  Disconnected: 'bg-slate-500/15 text-slate-400',
} as const;

export interface ConfigModalProps {
  item: Integration;
  onClose(): void;
  onSave(draft: IntegDraft): void;
}

/**
 * Legacy `#integ-config-modal`: `openIntegModal()` defaults, `testCurrentIntegration()`
 * (750 ms fake handshake) and `handleSaveIntegConfig()` (save + toggle).
 * Mounted per integration, so drafts/feedback reset naturally on open.
 */
export function ConfigModal({ item, onClose, onSave }: ConfigModalProps) {
  const { notify } = useStore();
  const [draft, setDraft] = useState<IntegDraft>(() => draftFor(item));
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [testing, setTesting] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Never leave the fake handshake timer running after the dialog closes.
  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const patch = (next: Partial<IntegDraft>) => setDraft((prev) => ({ ...prev, ...next }));

  function testCurrentIntegration() {
    const endpoint = draft.endpoint.trim();
    const apiKey = draft.apiKey.trim();

    if (!endpoint || !apiKey) {
      setFeedback({
        tone: 'rose',
        message: 'Endpoint URL and API Key are required to perform handshake test.',
      });
      return;
    }

    setTesting(true);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      setTesting(false);
      setFeedback({
        tone: 'emerald',
        message: 'Handshake verified: 200 OK. Latency: 42ms. Telemetry ingress channel active.',
      });
      notify({
        message: 'Connection verified with remote gateway.',
        type: 'success',
        title: 'Ping Succeeded',
      });
    }, 750);
  }

  function handleSaveIntegConfig(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSave({
      ...draft,
      endpoint: draft.endpoint.trim(),
      apiKey: draft.apiKey.trim(),
    });
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="md"
      tone="dark"
      panelClassName="!bg-[#07243e]"
      labelledBy="modal-integ-name"
    >
      <div className="space-y-5 pr-8">
        <div className="border-b border-[#0d3459] pb-3">
          <div className="flex items-center gap-2.5">
            <h3 id="modal-integ-name" className="text-xl font-bold text-white">
              {item.name}
            </h3>
            <span
              id="modal-integ-status-badge"
              className={cx('rounded-full px-2.5 py-0.5 text-xs font-bold', BADGE_TONE[item.status])}
            >
              {item.status}
            </span>
          </div>
          <p id="modal-integ-category" className="mt-0.5 text-xs text-slate-400">
            {item.category}
          </p>
        </div>

        <form onSubmit={handleSaveIntegConfig} className="space-y-4 text-xs">
          <Field label="Endpoint URL" htmlFor="integ-endpoint" required className={FIELD_DARK}>
            <TextInput
              id="integ-endpoint"
              required
              value={draft.endpoint}
              onChange={(e) => patch({ endpoint: e.target.value })}
            />
          </Field>

          <Field label="API Key" htmlFor="integ-apikey" required className={FIELD_DARK}>
            <>
              <TextInput
                id="integ-apikey"
                type="password"
                required
                value={draft.apiKey}
                onChange={(e) => patch({ apiKey: e.target.value })}
              />
              <span className="mt-1.5 block text-[10px] text-slate-400">
                Stored securely in your plant's encrypted local environment.
              </span>
            </>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Telemetry Sync Interval" htmlFor="integ-interval" className={FIELD_DARK}>
              <Select
                id="integ-interval"
                value={draft.syncInterval}
                onChange={(e) => patch({ syncInterval: e.target.value })}
              >
                {SYNC_INTERVALS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Connection State" htmlFor="integ-state-toggle" className={FIELD_DARK}>
              <Select
                id="integ-state-toggle"
                value={draft.status}
                onChange={(e) => patch({ status: e.target.value as ConnectionState })}
              >
                {STATE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          {/* Test Connection Feedback Box */}
          <div
            id="integ-test-feedback"
            role={feedback?.tone === 'emerald' ? 'status' : 'alert'}
            hidden={!feedback}
            className={cx(
              'rounded-xl p-3 text-xs font-semibold',
              feedback ? FEEDBACK_TONE[feedback.tone] : FEEDBACK_TONE.rose,
            )}
          >
            {feedback?.message ?? ''}
          </div>

          <div className="flex items-center justify-between border-t border-[#0d3459] pt-3">
            <button
              type="button"
              disabled={testing}
              onClick={testCurrentIntegration}
              className={cx(MUTED_BTN, 'disabled:cursor-not-allowed disabled:opacity-60')}
            >
              {testing ? 'Verifying TLS Handshake...' : 'Test Handshake'}
            </button>
            <div className="flex items-center gap-2">
              <button type="button" className={MUTED_BTN} onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className={ACCENT_BTN}>
                Save Configuration
              </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
