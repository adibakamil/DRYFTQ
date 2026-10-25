/**
 * Verification of DRYFTQ State Store & Business Logic
 */

const assert = require('assert');

// Mock localStorage and window
const store = {};
global.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => { store[key] = String(val); },
  removeItem: (key) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};

global.window = {
  location: { href: 'http://localhost:3000/dashboard', pathname: '/dashboard', search: '' },
  addEventListener: () => {},
  dispatchEvent: () => {}
};
const makeNode = () => ({
  setAttribute: () => {},
  click: () => {},
  appendChild: () => {},
  removeChild: () => {},
  classList: { add: () => {}, remove: () => {} },
  style: {}
});
global.document = {
  createElement: makeNode,
  getElementById: () => makeNode(),
  body: makeNode()
};

// Load dryftq-state.js
const Dryftq = require('./shared/dryftq-state.js');

function runStateTests() {
  console.log('--- Testing DRYFTQ Business Logic & State Operations ---');

  // Test 1: Initial state load
  const state = Dryftq.getState();
  assert.ok(state.machines.length >= 6, 'Should load initial machines');
  assert.ok(state.alerts.length >= 3, 'Should load initial alerts');
  assert.ok(state.team.length >= 5, 'Should load initial team members');
  assert.ok(state.integrations.length >= 6, 'Should load initial integrations');
  console.log('[PASS] Initial State loaded successfully');

  // Test 2: Alert acknowledgement & resolution
  const activeAlert = state.alerts.find(a => a.status === 'Active');
  assert.ok(activeAlert, 'Should find active alert');
  Dryftq.acknowledgeAlert(activeAlert.id);
  assert.strictEqual(Dryftq.getState().alerts.find(a => a.id === activeAlert.id).status, 'Acknowledged');
  console.log('[PASS] Alert Acknowledged');

  Dryftq.resolveAlert(activeAlert.id, 'Sensor calibrated and verified');
  assert.strictEqual(Dryftq.getState().alerts.find(a => a.id === activeAlert.id).status, 'Resolved');
  console.log('[PASS] Alert Resolved');

  // Test 3: Alert to Maintenance workflow
  const initialTaskCount = Dryftq.getState().maintenanceTasks.length;
  const newTask = Dryftq.createMaintenanceTask({
    task: 'Emergency Pump Calibration',
    machine: 'PUMP-04',
    priority: 'High',
    technician: 'Priya Sharma',
    dueDate: '2026-10-25',
    linkedAlertId: activeAlert.id
  });
  assert.ok(newTask.id, 'Task should have an ID');
  assert.strictEqual(Dryftq.getState().maintenanceTasks.length, initialTaskCount + 1);
  console.log('[PASS] Maintenance Task Created from Alert Workflow');

  // Test 4: Maintenance task status transition
  Dryftq.updateMaintenanceStatus(newTask.id, 'In Progress');
  assert.strictEqual(Dryftq.getState().maintenanceTasks.find(t => t.id === newTask.id).status, 'In Progress');
  Dryftq.updateMaintenanceStatus(newTask.id, 'Completed');
  assert.strictEqual(Dryftq.getState().maintenanceTasks.find(t => t.id === newTask.id).status, 'Completed');
  console.log('[PASS] Maintenance Task status transitions (Upcoming -> In Progress -> Completed)');

  // Test 5: Machine Management
  const initialMachineCount = Dryftq.getState().machines.length;
  Dryftq.addMachine({
    id: 'LATHE-09',
    name: 'Precision Lathe #9',
    line: 'Line 3',
    status: 'Running',
    load: '82%',
    temp: 64,
    vibration: 1.1
  });
  assert.strictEqual(Dryftq.getState().machines.length, initialMachineCount + 1);
  console.log('[PASS] Machine creation and registration verified');

  // Test 6: Team member management
  const initialTeamCount = Dryftq.getState().team.length;
  const newMember = Dryftq.addTeamMember({
    name: 'Lucas Scott',
    email: 'lucas@dryftq.internal',
    role: 'Maintenance',
    department: 'Maintenance'
  });
  assert.strictEqual(Dryftq.getState().team.length, initialTeamCount + 1);
  Dryftq.updateTeamMember(newMember.id, { role: 'Operator' });
  assert.strictEqual(Dryftq.getState().team.find(m => m.id === newMember.id).role, 'Operator');
  Dryftq.removeTeamMember(newMember.id);
  assert.strictEqual(Dryftq.getState().team.length, initialTeamCount);
  console.log('[PASS] Team member CRUD verified');

  // Test 7: Integration testing
  const awsInt = Dryftq.getState().integrations.find(i => i.id === 'aws');
  assert.strictEqual(awsInt.status, 'Connected');
  Dryftq.toggleIntegration('aws');
  assert.strictEqual(Dryftq.getState().integrations.find(i => i.id === 'aws').status, 'Disconnected');
  Dryftq.toggleIntegration('aws');
  assert.strictEqual(Dryftq.getState().integrations.find(i => i.id === 'aws').status, 'Connected');
  console.log('[PASS] Integration toggle and handshake persistence verified');

  // Test 8: Settings & Profile update
  Dryftq.updateSettings({ theme: 'dark', units: 'imperial' });
  assert.strictEqual(Dryftq.getState().settings.theme, 'dark');
  assert.strictEqual(Dryftq.getState().settings.units, 'imperial');

  Dryftq.updateUser({ name: 'Adiba Kamil - Supervisor' });
  assert.strictEqual(Dryftq.getState().user.name, 'Adiba Kamil - Supervisor');
  console.log('[PASS] Settings & Profile updates verified');

  console.log('\n======================================================');
  console.log('ALL 8 DRYFTQ STATE & WORKFLOW TEST SUITES PASSED (100%)');
  console.log('======================================================');
  process.exit(0);
}

runStateTests();
