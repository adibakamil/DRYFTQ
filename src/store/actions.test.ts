import { describe, expect, it } from 'vitest';
import * as actions from './actions';
import { cloneDefaultState, DEFAULT_STATE } from './defaultState';
import { computeOee, hasValue, nextId, numOr } from '../lib/utils';

const seed = () => cloneDefaultState();

describe('id + numeric helpers', () => {
  it('nextId uses the highest suffix, not the list length', () => {
    const list = [{ id: 'TM-1' }, { id: 'TM-2' }, { id: 'TM-5' }];
    expect(nextId('TM', list, 0)).toBe('TM-6');
    // remove-then-create can never collide with a surviving id
    expect(nextId('TM', [{ id: 'TM-2' }, { id: 'TM-6' }], 0)).toBe('TM-7');
  });

  it('numOr keeps real zeros', () => {
    expect(numOr(0, 65)).toBe(0);
    expect(numOr('0', 65)).toBe(0);
    expect(numOr('', 65)).toBe(65);
    expect(numOr(undefined, 65)).toBe(65);
    expect(numOr('abc', 65)).toBe(65);
  });

  it('hasValue distinguishes 0 from missing', () => {
    expect(hasValue(0)).toBe(true);
    expect(hasValue('')).toBe(false);
    expect(hasValue(null)).toBe(false);
  });

  it('computeOee scores running machines above errored ones', () => {
    const running = computeOee({ ...DEFAULT_STATE.machines[0]! });
    const errored = computeOee({ ...DEFAULT_STATE.machines[2]! });
    expect(running).toBeGreaterThan(errored);
  });
});

describe('alert workflow', () => {
  it('acknowledgeAlert flips status and records an event', () => {
    const state = seed();
    const result = actions.acknowledgeAlert(state, 'ALT-101');
    expect(result.state.alerts.find((a) => a.id === 'ALT-101')?.status).toBe('Acknowledged');
    expect(result.state.recentEvents[0]?.title).toContain('ALT-101');
    expect(result.state.recentEvents[0]?.title).toContain('acknowledged');
    expect(result.notice?.type).toBe('info');
    // original untouched (pure function)
    expect(state.alerts.find((a) => a.id === 'ALT-101')?.status).toBe('Active');
  });

  it('acknowledgeAlert on an unknown id changes nothing', () => {
    const state = seed();
    const result = actions.acknowledgeAlert(state, 'ALT-999');
    expect(result.state).toBe(state);
    expect(result.notice).toBeUndefined();
  });

  it('resolveAlert restores an errored machine once the last critical clears', () => {
    const state = seed();
    const result = actions.resolveAlert(state, 'ALT-101'); // CNC-02 critical
    const machine = result.state.machines.find((m) => m.id === 'CNC-02');
    expect(machine?.status).toBe('Running');
    expect(machine?.temp).toBe(68);
    expect(result.notice?.type).toBe('success');
  });

  it('resolveAlert keeps the machine in Error while another critical is active', () => {
    const state = seed();
    state.alerts.push({
      ...state.alerts[0]!,
      id: 'ALT-900',
      machineId: 'CNC-02',
      severity: 'Critical',
      status: 'Active',
    });
    const result = actions.resolveAlert(state, 'ALT-101');
    expect(result.state.machines.find((m) => m.id === 'CNC-02')?.status).toBe('Error');
  });
});

describe('maintenance workflow', () => {
  it('creates tasks with the legacy id series and acknowledges a linked alert', () => {
    const state = seed();
    const result = actions.createMaintenanceTask(state, {
      task: 'Bearing Swap',
      machine: 'CNC-02',
      linkedAlertId: 'ALT-101',
    });
    const task = result.state.maintenanceTasks[0]!;
    expect(task.id).toBe('MNT-206');
    expect(task.status).toBe('Upcoming');
    expect(result.state.alerts.find((a) => a.id === 'ALT-101')?.status).toBe('Acknowledged');
    expect(result.state.maintenanceTasks).toHaveLength(state.maintenanceTasks.length + 1);
  });

  it('completing a task returns the machine to service with a health boost', () => {
    const state = seed(); // ROBOT-01 is in Maintenance with health 65
    const result = actions.updateMaintenanceStatus(state, 'MNT-205', 'Completed');
    const machine = result.state.machines.find((m) => m.id === 'ROBOT-01')!;
    expect(machine.status).toBe('Running');
    expect(machine.lastMaint).toBe('Today');
    expect(machine.health).toBe(80);
    expect(result.state.maintenanceTasks.find((t) => t.id === 'MNT-205')?.status).toBe('Completed');
  });

  it('health boost is capped at 100', () => {
    const state = seed();
    const idx = state.machines.findIndex((m) => m.id === 'CNC-01');
    state.machines[idx] = { ...state.machines[idx]!, status: 'Maintenance', health: 95 };
    const result = actions.updateMaintenanceStatus(state, 'MNT-201', 'Completed');
    expect(result.state.machines.find((m) => m.id === 'CNC-01')?.health).toBe(100);
  });
});

describe('machine management', () => {
  it('rejects a missing id', () => {
    const result = actions.addMachine(seed(), {});
    expect(result.notice?.type).toBe('error');
    expect(result.state.machines).toHaveLength(10);
  });

  it('rejects duplicate ids case-insensitively', () => {
    const result = actions.addMachine(seed(), { id: 'cnc-01' });
    expect(result.notice?.type).toBe('error');
    expect(result.notice?.title).toBe('Duplicate Machine ID');
  });

  it('accepts a new machine, uppercase the id and keeps real zeros', () => {
    const result = actions.addMachine(seed(), { id: 'laser-01', temp: 0, vibration: 0, health: 0 });
    const added = result.state.machines.find((m) => m.id === 'LASER-01')!;
    expect(added).toBeDefined();
    expect(added.temp).toBe(0);
    expect(added.vibration).toBe(0);
    expect(added.health).toBe(0);
    expect(added.lastMaint).toBe('Just added');
  });
});

describe('team management', () => {
  it('requires name and email', () => {
    const result = actions.inviteTeamMember(seed(), { name: 'Sam' });
    expect(result.notice?.type).toBe('error');
  });

  it('invites, re-roles and removes members', () => {
    let state = seed();
    const invited = actions.inviteTeamMember(state, { name: 'Sam Rao', email: 'sam@dryyftq.com', role: 'Analyst' });
    expect(invited.notice?.type).toBe('success');
    state = invited.state;
    const created = state.team.find((m) => m.email === 'sam@dryyftq.com')!;
    expect(created.id).toBe('TM-6');
    expect(invited.notice?.message).toContain('No email is sent');

    state = actions.updateTeamMemberRole(state, created.id, 'Admin').state;
    expect(state.team.find((m) => m.id === created.id)?.role).toBe('Admin');

    state = actions.removeTeamMember(state, created.id).state;
    expect(state.team.find((m) => m.id === created.id)).toBeUndefined();
    // seed members untouched
    expect(state.team).toHaveLength(5);
  });
});

describe('integrations', () => {
  it('toggles connection state both ways', () => {
    let state = seed();
    state = actions.toggleIntegration(state, 'datadog').state;
    expect(state.integrations.find((i) => i.id === 'datadog')?.status).toBe('Connected');
    expect(state.integrations.find((i) => i.id === 'datadog')?.lastSync).toBe('Just now');
    state = actions.toggleIntegration(state, 'datadog', false).state;
    expect(state.integrations.find((i) => i.id === 'datadog')?.status).toBe('Disconnected');
  });

  it('saving config marks the integration connected', () => {
    const result = actions.saveIntegrationConfig(seed(), 'grafana', { apiKey: 'abc', endpoint: 'https://g' });
    const item = result.state.integrations.find((i) => i.id === 'grafana')!;
    expect(item.status).toBe('Connected');
    expect(item.apiKey).toBe('abc');
  });
});

describe('profile, settings and reset', () => {
  it('merges partial updates without dropping fields', () => {
    const state = seed();
    const updated = actions.updateUser(state, { phone: '+1 555 0100' }).state;
    expect(updated.user.name).toBe(state.user.name);
    expect(updated.user.phone).toBe('+1 555 0100');

    const patched = actions.updateSettings(state, { refreshInterval: 60, units: 'imperial' }).state;
    expect(patched.settings.timezone).toBe(state.settings.timezone);
    expect(patched.settings.refreshInterval).toBe(60);
  });

  it('reset restores the factory defaults', () => {
    const dirty = actions.addMachine(seed(), { id: 'X-1' }).state;
    const result = actions.resetToDefaults();
    expect(result.state.machines).toHaveLength(DEFAULT_STATE.machines.length);
    expect(result.state.machines.some((m) => m.id === 'X-1')).toBe(false);
    expect(dirty.machines).toHaveLength(11);
  });
});
