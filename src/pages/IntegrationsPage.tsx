import { useMemo, useState } from 'react';
import { useActions, usePlantState } from '../store/context';
import type { Integration } from '../lib/types';
import { ConfigModal } from '../features/integrations/ConfigModal';
import { IntegrationCard } from '../features/integrations/IntegrationCard';
import { CARD_GRID, type IntegDraft } from '../features/integrations/shared';

/**
 * Integrations module — legacy `DRYFTQ DASHBOARD 7(INTEGRATIONS)/code.html`.
 * Two live sections (connected / available) plus the configuration modal;
 * everything derives from `state.integrations`, no manual listeners.
 */
export default function IntegrationsPage() {
  const state = usePlantState();
  const actions = useActions();
  const [activeId, setActiveId] = useState<string | null>(null);

  const { connected, available } = useMemo(() => {
    const connectedList: Integration[] = [];
    const availableList: Integration[] = [];
    for (const item of state.integrations) {
      (item.status === 'Connected' ? connectedList : availableList).push(item);
    }
    return { connected: connectedList, available: availableList };
  }, [state.integrations]);

  // Re-read from state on save so the handler never acts on a stale copy.
  const active = useMemo(
    () => state.integrations.find((i) => i.id === activeId) ?? null,
    [state.integrations, activeId],
  );

  /** Legacy `handleSaveIntegConfig()` — persist config, then apply the toggle. */
  function handleSaveIntegConfig(draft: IntegDraft) {
    if (!active) return;
    actions.saveIntegrationConfig(active.id, {
      endpoint: draft.endpoint,
      apiKey: draft.apiKey,
      syncInterval: draft.syncInterval,
    });
    actions.toggleIntegration(active.id, draft.status === 'Connected');
    setActiveId(null);
  }

  return (
    <div className="space-y-10">
      <header>
        <h2 className="text-lg font-bold text-white">Integrations</h2>
        <p className="mt-1 text-sm text-slate-400">
          Connect and stream industrial telemetry with your cloud and edge platforms
        </p>
      </header>

      <section data-purpose="connected-integrations">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-bold tracking-tight text-white">
            Connected Integrations (<span id="connected-count">{connected.length}</span>)
          </h3>
          <span className="text-xs font-semibold text-slate-400">
            Click any card to configure credentials &amp; parameters
          </span>
        </div>
        <div id="connected-cards-grid" className={CARD_GRID}>
          {connected.map((item) => (
            <IntegrationCard key={item.id} item={item} onOpen={(id) => setActiveId(id)} />
          ))}
        </div>
      </section>

      <section data-purpose="available-integrations">
        <h3 className="mb-5 text-base font-bold tracking-tight text-white">
          Available Integrations (<span id="available-count">{available.length}</span>)
        </h3>
        <div id="available-cards-grid" className={CARD_GRID}>
          {available.map((item) => (
            <IntegrationCard key={item.id} item={item} onOpen={(id) => setActiveId(id)} />
          ))}
        </div>
      </section>

      {active ? (
        <ConfigModal
          key={active.id}
          item={active}
          onClose={() => setActiveId(null)}
          onSave={handleSaveIntegConfig}
        />
      ) : null}
    </div>
  );
}
