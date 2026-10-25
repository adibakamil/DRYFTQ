import type {
  Integration,
  MaintenanceStatus,
  MaintenanceTask,
  Machine,
  MemberRole,
  PlantState,
  Settings,
  TeamMember,
  ToastType,
  User,
} from '../lib/types';
import { cloneDefaultState } from './defaultState';
import { nextId, numOr } from '../lib/utils';

/** What a domain operation hands back: next state + optional user-facing notice. */
export interface ActionResult {
  state: PlantState;
  notice?: Notice;
}

export interface Notice {
  message: string;
  type: ToastType;
  title?: string;
}

/** `true` when the operation failed and state was left untouched. */
export function failed(result: ActionResult): boolean {
  return Boolean(result.notice && result.notice.type === 'error');
}

function noop(state: PlantState): ActionResult {
  return { state };
}

function event(title: string, severity: 'critical' | 'warning' | 'info', machineId: string) {
  return {
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    title,
    severity,
    machineId,
  };
}

function unshift<T>(list: T[], item: T, cap = 50): T[] {
  return [item, ...list].slice(0, cap);
}

/* ================= Alerts ================= */

export function acknowledgeAlert(state: PlantState, alertId: string): ActionResult {
  const alert = state.alerts.find((a) => a.id === alertId);
  if (!alert) return noop(state);
  const next: PlantState = {
    ...state,
    alerts: state.alerts.map((a) => (a.id === alertId ? { ...a, status: 'Acknowledged' as const } : a)),
    recentEvents: unshift(
      state.recentEvents,
      event(`Alert ${alert.id} (${alert.title}) acknowledged`, 'info', alert.machineId),
    ),
  };
  return {
    state: next,
    notice: { message: `Alert ${alert.id} has been acknowledged.`, type: 'info', title: 'Alert Acknowledged' },
  };
}

export function resolveAlert(state: PlantState, alertId: string): ActionResult {
  const alert = state.alerts.find((a) => a.id === alertId);
  if (!alert) return noop(state);

  const alerts = state.alerts.map((a) => (a.id === alertId ? { ...a, status: 'Resolved' as const } : a));

  // A machine only leaves the Error state once no *other* critical alert is open.
  const hasOtherCritical = alerts.some(
    (a) => a.machineId === alert.machineId && a.status === 'Active' && a.severity === 'Critical',
  );
  const machines = hasOtherCritical
    ? state.machines
    : state.machines.map((m) =>
        m.id === alert.machineId && m.status === 'Error' ? { ...m, status: 'Running' as const, temp: 68, vibration: 1.3 } : m,
      );

  const next: PlantState = {
    ...state,
    alerts,
    machines,
    recentEvents: unshift(state.recentEvents, event(`Alert ${alert.id} (${alert.title}) resolved`, 'info', alert.machineId)),
  };
  return {
    state: next,
    notice: { message: `Alert ${alert.id} marked as resolved.`, type: 'success', title: 'Alert Resolved' },
  };
}

/* ================= Maintenance ================= */

export type MaintenanceDraft = Partial<Omit<MaintenanceTask, 'id'>> & { linkedAlertId?: string | null };

export function createMaintenanceTask(state: PlantState, draft: MaintenanceDraft): ActionResult {
  const id = nextId('MNT', state.maintenanceTasks, 200);
  const task: MaintenanceTask = {
    id,
    task: draft.task || 'General Maintenance',
    machine: draft.machine || 'CNC-01',
    type: (draft.type as MaintenanceTask['type']) || 'Preventive',
    priority: (draft.priority as MaintenanceTask['priority']) || 'Medium',
    dueDate: draft.dueDate || 'Tomorrow',
    status: 'Upcoming',
    technician: draft.technician || 'Priya Sharma',
    notes: draft.notes || '',
    ...(draft.linkedAlertId ? { linkedAlertId: draft.linkedAlertId } : {}),
  };

  // Creating a task against a live alert acknowledges that alert.
  const alerts = task.linkedAlertId
    ? state.alerts.map((a) => (a.id === task.linkedAlertId && a.status === 'Active' ? { ...a, status: 'Acknowledged' as const } : a))
    : state.alerts;

  const next: PlantState = {
    ...state,
    maintenanceTasks: [task, ...state.maintenanceTasks],
    alerts,
    recentEvents: unshift(
      state.recentEvents,
      event(`Maintenance task created for ${task.machine} (${task.task})`, 'info', task.machine),
    ),
  };
  return {
    state: next,
    notice: { message: `Task ${id} created and assigned to ${task.technician}.`, type: 'success', title: 'Maintenance Scheduled' },
  };
}

export function updateMaintenanceStatus(state: PlantState, taskId: string, newStatus: MaintenanceStatus): ActionResult {
  const task = state.maintenanceTasks.find((t) => t.id === taskId);
  if (!task) return noop(state);

  // Completing work on a machine returns it to service with a health boost.
  const machines =
    newStatus === 'Completed'
      ? state.machines.map((m) =>
          m.id === task.machine && m.status === 'Maintenance'
            ? { ...m, status: 'Running' as const, lastMaint: 'Today', health: Math.min(100, numOr(m.health, 80) + 15) }
            : m,
        )
      : state.machines;

  const next: PlantState = {
    ...state,
    maintenanceTasks: state.maintenanceTasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    machines,
    recentEvents: unshift(
      state.recentEvents,
      event(`Task ${task.id} (${task.task}) updated to ${newStatus}`, 'info', task.machine),
    ),
  };
  return {
    state: next,
    notice: { message: `Task ${task.id} status changed to ${newStatus}.`, type: 'success', title: 'Status Updated' },
  };
}

export function removeMaintenanceTask(state: PlantState, taskId: string): ActionResult {
  const task = state.maintenanceTasks.find((t) => t.id === taskId);
  if (!task) return noop(state);
  return {
    state: { ...state, maintenanceTasks: state.maintenanceTasks.filter((t) => t.id !== taskId) },
    notice: { message: `Task ${task.id} removed from the schedule.`, type: 'info', title: 'Task Removed' },
  };
}

/* ================= Machines ================= */

export function addMachine(state: PlantState, data: Partial<Machine>): ActionResult {
  const id = String(data.id ?? '').trim();
  if (!id) {
    return { state, notice: { message: 'Machine ID is required.', type: 'error', title: 'Validation Error' } };
  }
  if (state.machines.some((m) => m.id.toLowerCase() === id.toLowerCase())) {
    return {
      state,
      notice: { message: `Machine with ID ${id} already exists.`, type: 'error', title: 'Duplicate Machine ID' },
    };
  }
  const machine: Machine = {
    id: id.toUpperCase(),
    name: data.name || `${id} Industrial Unit`,
    line: data.line || 'Line 1',
    status: (data.status as Machine['status']) || 'Running',
    load: data.load || '75%',
    temp: numOr(data.temp, 65),
    vibration: numOr(data.vibration, 1.2),
    power: data.power || '2.0 kW',
    lastMaint: 'Just added',
    health: numOr(data.health, 90),
    type: data.type || 'General',
  };
  return {
    state: { ...state, machines: [...state.machines, machine] },
    notice: { message: `Machine ${machine.id} added successfully.`, type: 'success', title: 'Machine Registered' },
  };
}

export function updateMachine(state: PlantState, machineId: string, patch: Partial<Machine>): ActionResult {
  if (!state.machines.some((m) => m.id === machineId)) return noop(state);
  return {
    state: { ...state, machines: state.machines.map((m) => (m.id === machineId ? { ...m, ...patch } : m)) },
    notice: { message: `Machine ${machineId} updated.`, type: 'success', title: 'Machine Updated' },
  };
}

/* ================= Team ================= */

export function inviteTeamMember(state: PlantState, data: Partial<TeamMember>): ActionResult {
  if (!data.name || !data.email) {
    return { state, notice: { message: 'Name and email are required.', type: 'error', title: 'Validation Error' } };
  }
  const member: TeamMember = {
    id: nextId('TM', state.team, 0),
    name: data.name,
    role: data.role || 'Operator',
    department: data.department || 'Production',
    status: 'Active',
    lastActive: 'Just now',
    email: data.email,
    avatar:
      data.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  };
  return {
    state: { ...state, team: [...state.team, member] },
    notice: {
      message: `${member.email} was added as ${member.role}. No email is sent in this demo build.`,
      type: 'success',
      title: 'Member Added',
    },
  };
}

export function removeTeamMember(state: PlantState, memberId: string): ActionResult {
  const member = state.team.find((m) => m.id === memberId);
  if (!member) return noop(state);
  return {
    state: { ...state, team: state.team.filter((m) => m.id !== memberId) },
    notice: { message: `${member.name} has been removed from the team.`, type: 'info', title: 'Member Removed' },
  };
}

export function updateTeamMemberRole(state: PlantState, memberId: string, newRole: MemberRole | string): ActionResult {
  const member = state.team.find((m) => m.id === memberId);
  if (!member) return noop(state);
  return {
    state: { ...state, team: state.team.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)) },
    notice: { message: `${member.name}'s role updated to ${newRole}.`, type: 'success', title: 'Role Updated' },
  };
}

export function updateTeamMember(state: PlantState, memberId: string, patch: Partial<TeamMember>): ActionResult {
  if (patch.role) return updateTeamMemberRole(state, memberId, patch.role);
  const member = state.team.find((m) => m.id === memberId);
  if (!member) return noop(state);
  return {
    state: { ...state, team: state.team.map((m) => (m.id === memberId ? { ...m, ...patch } : m)) },
  };
}

/* ================= Integrations ================= */

export function toggleIntegration(state: PlantState, integrationId: string, isConnected?: boolean): ActionResult {
  const item = state.integrations.find((i) => i.id === integrationId);
  if (!item) return noop(state);
  const connected = isConnected ?? item.status !== 'Connected';
  const next: Integration = {
    ...item,
    status: connected ? 'Connected' : 'Disconnected',
    lastSync: connected ? 'Just now' : 'Never',
  };
  return {
    state: { ...state, integrations: state.integrations.map((i) => (i.id === integrationId ? next : i)) },
    notice: {
      message: `${item.name} is now ${next.status}.`,
      type: connected ? 'success' : 'info',
      title: 'Integration Updated',
    },
  };
}

export function saveIntegrationConfig(
  state: PlantState,
  integrationId: string,
  config: { endpoint?: string; apiKey?: string; syncInterval?: string },
): ActionResult {
  const item = state.integrations.find((i) => i.id === integrationId);
  if (!item) return noop(state);
  const next: Integration = {
    ...item,
    endpoint: config.endpoint || item.endpoint,
    apiKey: config.apiKey || item.apiKey,
    syncInterval: config.syncInterval || item.syncInterval,
    status: 'Connected',
    lastSync: 'Just now',
  };
  return {
    state: { ...state, integrations: state.integrations.map((i) => (i.id === integrationId ? next : i)) },
    notice: { message: `${item.name} configuration saved and verified.`, type: 'success', title: 'Connected' },
  };
}

/* ================= Profile & settings ================= */

export function updateUser(state: PlantState, patch: Partial<User>): ActionResult {
  return {
    state: { ...state, user: { ...state.user, ...patch } },
    notice: { message: 'Profile updated successfully.', type: 'success', title: 'Profile Updated' },
  };
}

export function updateSettings(state: PlantState, patch: Partial<Settings>): ActionResult {
  return {
    state: { ...state, settings: { ...state.settings, ...patch } },
    notice: { message: 'Preferences saved successfully.', type: 'success', title: 'Settings Saved' },
  };
}

/* ================= Lifecycle ================= */

export function resetToDefaults(): ActionResult {
  return {
    state: cloneDefaultState(),
    notice: { message: 'All plant data was restored to the factory defaults.', type: 'warning', title: 'Data Reset' },
  };
}
