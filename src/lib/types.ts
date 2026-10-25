/**
 * DRYFTQ domain model.
 * Mirrors the data seeded by the legacy `dryftq-state.js` engine
 * (storage key `dryftq_plant_operations_v2`) so existing operator
 * state carries over unchanged.
 */

export type MachineStatus = 'Running' | 'Idle' | 'Error' | 'Maintenance';

export interface User {
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  avatar: string;
}

export interface Settings {
  language: string;
  timezone: string;
  dateFormat: string;
  /** `system` is offered by the settings UI; nothing in the app reads it yet. */
  theme: 'light' | 'dark' | 'system';
  units: 'metric' | 'imperial';
  autoRefresh: boolean;
  refreshInterval: number; // seconds
}

export interface Machine {
  id: string;
  name: string;
  line: string;
  status: MachineStatus;
  load: string;
  temp: number;
  vibration: number;
  power: string;
  lastMaint: string;
  health: number;
  type: string;
}

export type AlertSeverity = 'Critical' | 'Warning' | 'Info';
export type AlertStatus = 'Active' | 'Acknowledged' | 'Resolved';

export interface Alert {
  id: string;
  title: string;
  machineId: string;
  machineName: string;
  description: string;
  details: string;
  time: string;
  date: string;
  severity: AlertSeverity;
  status: AlertStatus;
  metric: string;
  reading: string;
  threshold: string;
}

export type MaintenanceStatus = 'Upcoming' | 'In Progress' | 'Completed';
export type MaintenanceType = 'Preventive' | 'Predictive' | 'Corrective';
export type Priority = 'High' | 'Medium' | 'Low';

export interface MaintenanceTask {
  id: string;
  task: string;
  machine: string;
  type: MaintenanceType;
  priority: Priority;
  dueDate: string;
  status: MaintenanceStatus;
  technician: string;
  notes: string;
  linkedAlertId?: string;
}

export type MemberRole = 'Admin' | 'Operator' | 'Analyst' | 'Maintenance' | 'Viewer';

export interface TeamMember {
  id: string;
  name: string;
  role: MemberRole | string;
  department: string;
  status: 'Active' | 'Inactive';
  lastActive: string;
  email: string;
  avatar: string;
}

export interface Integration {
  id: string;
  name: string;
  category: string;
  status: 'Connected' | 'Disconnected';
  lastSync: string;
  endpoint: string;
  syncInterval: string;
  apiKey: string;
}

export type EventSeverity = 'critical' | 'warning' | 'info';

export interface RecentEvent {
  time: string;
  title: string;
  severity: EventSeverity;
  machineId: string;
}

/** Root persisted state — everything localStorage owns. */
export interface PlantState {
  user: User;
  settings: Settings;
  machines: Machine[];
  alerts: Alert[];
  maintenanceTasks: MaintenanceTask[];
  team: TeamMember[];
  integrations: Integration[];
  recentEvents: RecentEvent[];
}

/** Notification style shared by every transient UI message. */
export type ToastType = 'success' | 'error' | 'warning' | 'info';
