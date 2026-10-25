import { cx } from '../../lib/utils';
import type { Integration } from '../../lib/types';
import { CARD_SHELL } from './shared';
import { ProviderLogo } from './ProviderLogo';

export interface IntegrationCardProps {
  item: Integration;
  onOpen(id: string): void;
}

/**
 * Connected card — the whole card is one real `<button>` (legacy card
 * `onclick="openIntegModal(...)"`), so every child is phrasing content.
 */
function ConnectedCard({ item, onOpen }: IntegrationCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(item.id)}
      className={cx(
        CARD_SHELL,
        'group w-full cursor-pointer text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF3D0A]',
      )}
    >
      <span className="flex h-16 items-center">
        <ProviderLogo id={item.id} />
      </span>
      <span className="block">
        <span className="flex items-center justify-between gap-3">
          <span className="block min-w-0 text-[20px] font-bold tracking-tight text-white transition-colors group-hover:text-[#FF4D15]">
            {item.name}
          </span>
          <span className="text-xs text-slate-400" aria-hidden="true">
            &rarr;
          </span>
        </span>
        <span className="mt-1.5 flex items-center gap-1.5 text-[15px] font-semibold text-[#16A66A]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#16A66A]" aria-hidden="true" />
          Connected
        </span>
        <span className="mt-1 block text-sm text-slate-400">
          Last Sync: {item.lastSync || '2 min ago'}
        </span>
      </span>
    </button>
  );
}

/**
 * Available card — legacy markup kept (category + `Configure & Connect`
 * button). The real `<button>` stretches an `::after` overlay across the
 * whole card, so the entire card stays clickable and keyboard-focusable
 * without nesting interactive elements.
 */
function AvailableCard({ item, onOpen }: IntegrationCardProps) {
  return (
    <div className={cx(CARD_SHELL, 'group relative')}>
      <div>
        <div className="flex h-16 items-center">
          <ProviderLogo id={item.id} />
        </div>
        <h4 className="mt-3 text-[20px] font-bold tracking-tight text-white transition-colors group-hover:text-[#FF4D15]">
          {item.name}
        </h4>
        <span className="chip mt-2 bg-white/[0.07] text-slate-400">{item.category}</span>
      </div>
      <div className="pt-2">
        <button
          type="button"
          onClick={() => onOpen(item.id)}
          className="w-full rounded-xl border border-[#0d3459] px-4 py-2.5 text-[15px] font-semibold text-slate-200 shadow-sm transition-colors after:absolute after:inset-0 hover:border-[#FF3D0A] hover:bg-[#FF3D0A]/10 hover:text-[#FF3D0A] focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-[#FF3D0A]"
        >
          Configure &amp; Connect
        </button>
      </div>
    </div>
  );
}

/** Legacy integration card — split by `status` exactly like `renderIntegrations()`. */
export function IntegrationCard(props: IntegrationCardProps) {
  return props.item.status === 'Connected' ? <ConnectedCard {...props} /> : <AvailableCard {...props} />;
}
