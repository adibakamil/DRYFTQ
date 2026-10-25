import { createContext, useContext, useMemo } from 'react';
import type { MaintenanceStatus, Machine, Settings, TeamMember, User, PlantState } from '../lib/types';
import type { MaintenanceDraft, Notice } from './actions';

/** Domain actions, bound to the live store — mirrors the legacy `Dryftq.*` API. */
export interface StoreActions {
  // Alerts
  acknowledgeAlert(alertId: string): void;
  resolveAlert(alertId: string): void;
  // Maintenance
  createMaintenanceTask(draft: MaintenanceDraft): void;
  updateMaintenanceStatus(taskId: string, status: MaintenanceStatus): void;
  removeMaintenanceTask(taskId: string): void;
  // Machines
  addMachine(data: Partial<Machine>): void;
  updateMachine(machineId: string, patch: Partial<Machine>): void;
  // Team
  inviteTeamMember(data: Partial<TeamMember>): void;
  removeTeamMember(memberId: string): void;
  updateTeamMemberRole(memberId: string, role: string): void;
  updateTeamMember(memberId: string, patch: Partial<TeamMember>): void;
  // Integrations
  toggleIntegration(integrationId: string, isConnected?: boolean): void;
  saveIntegrationConfig(
    integrationId: string,
    config: { endpoint?: string; apiKey?: string; syncInterval?: string },
  ): void;
  // Profile & settings
  updateUser(patch: Partial<User>): void;
  updateSettings(patch: Partial<Settings>): void;
  // Lifecycle
  resetToDefaults(): void;
}

export interface ToastItem extends Notice {
  id: number;
}

export interface StoreContextValue {
  state: PlantState;
  actions: StoreActions;
  toasts: ToastItem[];
  notify(notice: Notice): void;
  dismissToast(id: number): void;
}

export const StoreContext = createContext<StoreContextValue | null>(null);

/** Full store (state + actions + toasts). Throws outside `StoreProvider`. */
export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}

/** Just the persisted plant state. */
export function usePlantState(): PlantState {
  return useStore().state;
}

/** Just the bound domain actions. */
export function useActions(): StoreActions {
  return useStore().actions;
}

/** Toast helpers for imperative feedback (validation errors, confirmations). */
export function useToasts(): Pick<StoreContextValue, 'toasts' | 'notify' | 'dismissToast'> {
  const { toasts, notify, dismissToast } = useStore();
  return useMemo(() => ({ toasts, notify, dismissToast }), [toasts, notify, dismissToast]);
}
