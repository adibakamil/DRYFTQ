/**
 * Shared constants, types and pure helpers for the Integrations module.
 * Pure TypeScript only — no JSX in here.
 */
import type { Integration } from '../../lib/types';

/** Console accent action (legacy `#FF4D15`, platform accent `#FF3D0A`). */
export const ACCENT_BTN = 'btn btn-sm rounded-lg bg-[#FF3D0A] text-white hover:bg-[#e03405]';
/** Secondary action on the dark console. */
export const MUTED_BTN = 'btn btn-sm rounded-lg bg-white/10 text-white hover:bg-white/20';
/** Legacy labels were slate-700 on white — keep them readable on #07243e. */
export const FIELD_DARK = '[&_label]:text-slate-300';

/** 4-up card grid — legacy `#connected-cards-grid` / `#available-cards-grid`. */
export const CARD_GRID = 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4';

/** Card shell — legacy `h-[255px]` white card, restyled for the console (#07243E). */
export const CARD_SHELL =
  'console-card-solid flex h-[255px] flex-col justify-between p-6 transition-all hover:border-white/25 hover:bg-white/[0.06]';

/** Legacy `#integ-state-toggle` values. */
export type ConnectionState = 'Connected' | 'Disconnected';

/** Draft backing the legacy `#integ-config-modal` form. */
export interface IntegDraft {
  endpoint: string;
  apiKey: string;
  syncInterval: string;
  status: ConnectionState;
}

/** Legacy `#integ-interval` options (value/label pairs kept verbatim). */
export const SYNC_INTERVALS: ReadonlyArray<{ value: string; label: string }> = [
  { value: '15s', label: 'Every 15 Seconds' },
  { value: '30s', label: 'Every 30 Seconds' },
  { value: '60s', label: 'Every 60 Seconds' },
  { value: 'Real-time', label: 'Real-Time Streaming' },
];

/** Legacy `#integ-state-toggle` options (label copy kept verbatim). */
export const STATE_OPTIONS: ReadonlyArray<{ value: ConnectionState; label: string }> = [
  { value: 'Connected', label: 'Enabled & Connected' },
  { value: 'Disconnected', label: 'Disabled / Disconnected' },
];

/** Field defaults the legacy `openIntegModal()` wrote into the form. */
export function draftFor(item: Integration): IntegDraft {
  return {
    endpoint: item.endpoint || `https://api.${item.id}.dryftq.io`,
    apiKey: item.apiKey || 'sk_live_9a87f61c...',
    syncInterval: item.syncInterval || '30s',
    status: item.status,
  };
}
