import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { PlantState } from '../lib/types';
import * as actions from './actions';
import type { ActionResult, Notice } from './actions';
import { StoreContext, type StoreActions, type StoreContextValue, type ToastItem } from './context';
import { loadState, saveState } from './persistence';

const TOAST_DURATION_MS = 4500;
const MAX_TOASTS = 4;

/**
 * Application store.
 *
 * Domain logic lives in the pure functions in `actions.ts`; this provider only
 * owns three concerns: holding the current state, applying an `ActionResult`
 * (state + toast) atomically, and persisting every change.
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlantState>(() => loadState());
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Actions read the freshest state even when dispatched back-to-back in the
  // same tick, without needing every caller to thread a setter around.
  const stateRef = useRef(state);
  stateRef.current = state;

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (notice: Notice) => {
      const id = Date.now() + Math.random();
      setToasts((current) => [{ ...notice, id }, ...current].slice(0, MAX_TOASTS));
      window.setTimeout(() => dismissToast(id), TOAST_DURATION_MS);
    },
    [dismissToast],
  );

  /** Apply an action result: commit state, surface the notice. */
  const commit = useCallback(
    (result: ActionResult) => {
      stateRef.current = result.state;
      setState(result.state);
      if (result.notice) notify(result.notice);
    },
    [notify],
  );

  const actionsApi = useMemo<StoreActions>(
    () => ({
      acknowledgeAlert: (id) => commit(actions.acknowledgeAlert(stateRef.current, id)),
      resolveAlert: (id) => commit(actions.resolveAlert(stateRef.current, id)),
      createMaintenanceTask: (draft) => commit(actions.createMaintenanceTask(stateRef.current, draft)),
      updateMaintenanceStatus: (id, status) => commit(actions.updateMaintenanceStatus(stateRef.current, id, status)),
      removeMaintenanceTask: (id) => commit(actions.removeMaintenanceTask(stateRef.current, id)),
      addMachine: (data) => commit(actions.addMachine(stateRef.current, data)),
      updateMachine: (id, patch) => commit(actions.updateMachine(stateRef.current, id, patch)),
      inviteTeamMember: (data) => commit(actions.inviteTeamMember(stateRef.current, data)),
      removeTeamMember: (id) => commit(actions.removeTeamMember(stateRef.current, id)),
      updateTeamMemberRole: (id, role) => commit(actions.updateTeamMemberRole(stateRef.current, id, role)),
      updateTeamMember: (id, patch) => commit(actions.updateTeamMember(stateRef.current, id, patch)),
      toggleIntegration: (id, connected) => commit(actions.toggleIntegration(stateRef.current, id, connected)),
      saveIntegrationConfig: (id, config) => commit(actions.saveIntegrationConfig(stateRef.current, id, config)),
      updateUser: (patch) => commit(actions.updateUser(stateRef.current, patch)),
      updateSettings: (patch) => commit(actions.updateSettings(stateRef.current, patch)),
      resetToDefaults: () => commit(actions.resetToDefaults()),
    }),
    [commit],
  );

  // Persist every change.
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Stay in sync across tabs. (`storage` only fires in *other* tabs, so our
  // own writes can never echo back; `dryftq:state-change` is dispatched for
  // legacy pages on the same origin and is deliberately not consumed here.)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === 'dryftq_plant_operations_v2') setState(loadState());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({ state, actions: actionsApi, toasts, notify, dismissToast }),
    [state, actionsApi, toasts, notify, dismissToast],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
