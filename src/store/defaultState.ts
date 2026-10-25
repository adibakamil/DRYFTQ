import type { PlantState } from '../lib/types';

/**
 * Seed data for a fresh install — identical to the legacy engine's
 * `DEFAULT_STATE` so the nine modules look the same on first load.
 */
export const DEFAULT_STATE: PlantState = {
  user: {
    name: 'Adiba Kamil',
    role: 'Product Specialist',
    department: 'Plant Operations',
    email: 'adibakamil@dryyftq.com',
    phone: '+91 98765 43210',
    avatar: '/mine.jpg',
  },
  settings: {
    language: 'en',
    timezone: 'asia-kolkata',
    dateFormat: 'dd-mm-yyyy',
    theme: 'light',
    units: 'metric',
    autoRefresh: true,
    refreshInterval: 15,
  },
  machines: [
    { id: 'CNC-01', name: 'CNC-01 Milling Center', line: 'Line 1', status: 'Running', load: '78%', temp: 68, vibration: 1.2, power: '2.4 kW', lastMaint: '2 days ago', health: 92, type: 'Milling' },
    { id: 'PRESS-02', name: 'PRESS-02 Stamping', line: 'Line 2', status: 'Running', load: '85%', temp: 72, vibration: 1.8, power: '3.1 kW', lastMaint: '5 days ago', health: 86, type: 'Stamping' },
    { id: 'CNC-02', name: 'CNC-02 High Speed Axis', line: 'Line 2', status: 'Error', load: '92%', temp: 105, vibration: 2.8, power: '2.9 kW', lastMaint: '12 days ago', health: 48, type: 'Milling' },
    { id: 'PUMP-01', name: 'PUMP-01 Hydraulic Core', line: 'Line 1', status: 'Running', load: '64%', temp: 58, vibration: 0.9, power: '1.8 kW', lastMaint: '1 week ago', health: 95, type: 'Hydraulic' },
    { id: 'CONV-01', name: 'CONV-01 Assembly Belt', line: 'Line 3', status: 'Running', load: '71%', temp: 62, vibration: 2.2, power: '1.5 kW', lastMaint: '3 days ago', health: 84, type: 'Conveyor' },
    { id: 'ROBOT-01', name: 'ROBOT-01 6-Axis Arm', line: 'Line 4', status: 'Maintenance', load: '0%', temp: 45, vibration: 0.2, power: '0.5 kW', lastMaint: 'In Progress', health: 65, type: 'Robotics' },
    { id: 'PRESS-01', name: 'PRESS-01 Heavy Duty', line: 'Line 1', status: 'Running', load: '82%', temp: 70, vibration: 1.4, power: '2.8 kW', lastMaint: '4 days ago', health: 88, type: 'Stamping' },
    { id: 'MILL-01', name: 'MILL-01 Precision Lathe', line: 'Line 2', status: 'Running', load: '75%', temp: 65, vibration: 1.3, power: '2.2 kW', lastMaint: '1 week ago', health: 91, type: 'Milling' },
    { id: 'LATHE-02', name: 'LATHE-02 Turret Axis', line: 'Line 3', status: 'Idle', load: '15%', temp: 42, vibration: 0.4, power: '0.8 kW', lastMaint: '2 weeks ago', health: 94, type: 'Turning' },
    { id: 'PACK-01', name: 'PACK-01 Auto Packaging', line: 'Line 4', status: 'Running', load: '88%', temp: 69, vibration: 1.6, power: '2.0 kW', lastMaint: '6 days ago', health: 87, type: 'Packaging' },
  ],
  alerts: [
    { id: 'ALT-101', title: 'High Temperature', machineId: 'CNC-02', machineName: 'Line 2 - CNC-02', description: 'Temperature in Line 2 exceeded the threshold.', details: 'Reached: 105°C | Limit: 90°C', time: '10:25', date: 'Oct 16, 2025', severity: 'Critical', status: 'Active', metric: 'Temperature', reading: '105°C', threshold: '90°C' },
    { id: 'ALT-102', title: 'Abnormal Vibration', machineId: 'CONV-01', machineName: 'Line 3 - CONV-01', description: 'Vibration in Line 3 is above normal threshold.', details: 'Reached: 2.8 mm/s | Limit: 2.0 mm/s', time: '09:45', date: 'Oct 16, 2025', severity: 'Warning', status: 'Active', metric: 'Vibration', reading: '2.8 mm/s', threshold: '2.0 mm/s' },
    { id: 'ALT-103', title: 'Process Deviation', machineId: 'CNC-01', machineName: 'Line 1 - CNC-01', description: 'Quality index is below target in Line 1.', details: 'Deviation in Line 1', time: '08:45', date: 'Oct 16, 2025', severity: 'Warning', status: 'Active', metric: 'Quality', reading: '81%', threshold: '90%' },
    { id: 'ALT-104', title: 'Quality Deviation', machineId: 'PRESS-02', machineName: 'Line 2 - PRESS-02', description: 'Lot Error - Line 2. Quality index is below target.', details: 'Lot Error - Line 2', time: '07:30', date: 'Oct 16, 2025', severity: 'Info', status: 'Acknowledged', metric: 'Quality', reading: '84%', threshold: '90%' },
    { id: 'ALT-105', title: 'Maintenance Required', machineId: 'PUMP-01', machineName: 'Line 1 - PUMP-01', description: 'Scheduled maintenance overdue for motor bearings.', details: 'Service - Motor 1', time: '06:15', date: 'Oct 16, 2025', severity: 'Info', status: 'Resolved', metric: 'Runtime', reading: '2500 hrs', threshold: '2000 hrs' },
  ],
  maintenanceTasks: [
    { id: 'MNT-201', task: 'Oil Change', machine: 'CNC-01', type: 'Preventive', priority: 'High', dueDate: 'Oct 18, 2025', status: 'Upcoming', technician: 'Priya Sharma', notes: 'Replace synthetic lubricant and flush filters.' },
    { id: 'MNT-202', task: 'Vibration Check', machine: 'PRESS-02', type: 'Predictive', priority: 'Medium', dueDate: 'Oct 19, 2025', status: 'Upcoming', technician: 'Vikash Singh', notes: 'Inspect flywheel alignment and dampening pads.' },
    { id: 'MNT-203', task: 'Filter Replacement', machine: 'PUMP-01', type: 'Preventive', priority: 'Medium', dueDate: 'Oct 19, 2025', status: 'Upcoming', technician: 'Priya Sharma', notes: 'Replace intake mesh and pressure sensors.' },
    { id: 'MNT-204', task: 'Belt Inspection', machine: 'CONV-01', type: 'Predictive', priority: 'Low', dueDate: 'Oct 18, 2025', status: 'Upcoming', technician: 'Vikash Singh', notes: 'Check tension and drive rollers.' },
    { id: 'MNT-205', task: 'Calibration', machine: 'ROBOT-01', type: 'Corrective', priority: 'High', dueDate: 'Oct 20, 2025', status: 'In Progress', technician: 'Aditya Kamil', notes: 'Calibrate 6-axis servo offsets after torque fault.' },
  ],
  team: [
    { id: 'TM-1', name: 'Aditya Kamil', role: 'Admin', department: 'Plant Operations', status: 'Active', lastActive: '2 min ago', email: 'adibakamil@dryyftq.com', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMWPntWuCH7F8XDwAMFEDIesVS6Qva6Fw3qR0q1vpyQ_B_ZnEhbmi4OIMoh1PXj6TJ1yFPWPlZYq7rQB_YxUlgLN1-1oT5VeKqSFqlzKdeEdHS-PVqdTfjdSmAjt0jPwZkVUlHVVq8T-Pd3DeDtpSLUJO1xt5Uf_Jjo2uBObirsD31SVAnKGU2iR-blzQYNAVm9V89nGKbOZcXMt01N-3RYJBy1BdNaTs9POZKeaUcBsC3oNaC9LHdZA' },
    { id: 'TM-2', name: 'Vikash Singh', role: 'Operator', department: 'Production', status: 'Active', lastActive: '1 hour ago', email: 'vikash.s@dryyftq.com', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBW1MpG5ZQMP6OMsmrdQ9HNvlefngHPsUUewGAFl8Z9smIjLYBPdfWIEwf7ncQNtrnNBj12c59gBR5CAkKs_HE3RUktmQOLaqYzbPATCQFB6mae7xL0AsfyKH1DusQsjAHH7NnwyQs88H_m2d5saij-NVnI4GU7IHahO2qDGd0nlLyz5KPX0CNHMtoJBu1iYr8sMRsEXkUps4lNiV0KIDKRqRbrd4EFvIqY33iBTw2JZDjNNr4-wE9uOg' },
    { id: 'TM-3', name: 'Rekha Verma', role: 'Analyst', department: 'Analytics', status: 'Active', lastActive: '30 min ago', email: 'rekha.v@dryyftq.com', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqXqiHoO7E4VBqx9lpAsSpx-fVBPsU8RVVeVupHg5LNct3K8SFHRHkICrxiayxX0hyemLO-k3otTRcPvXgxAo4eWl8AmYN2vgXUTMVR9yYF4qEYWUKvZbtUfpEEDy7bmzNHiT4mhkO3bP0skNGhqhyjva9J8gIu7AtQ9aoRXT50-As0R_-z-xSeSj-hLEGecm3mrUu2MhELOE4xmonbqrhfn_rMRqNgEzEvvc8jkMwoECH7JgbToQvYQ' },
    { id: 'TM-4', name: 'Priya Sharma', role: 'Maintenance', department: 'Maintenance', status: 'Active', lastActive: '15 min ago', email: 'priya.s@dryyftq.com', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUVq_yIfcZLoVz4bZuQ3kllqGFx2B21gNWqtD7qogmvPQCI-S-HMtpw-F7FQ6dVgcwGnVTdoH6lUnoFlcAtWHDGwfrkUBi2hxx5E-DDfkIRkt5OW_bbrRi4wUxNffLAgQKTkeejcxYYcyxw1mYhJfu5Q8ROhczKV0C7SDvkCWsqTMfQzqJOu08xCgQswAu-vGz1Lk6dTus4UDqLHjGoOPMW3cuXOzV59di8tHZ6kESxTFs4ipZlVDytA' },
    { id: 'TM-5', name: 'Amit Patel', role: 'Viewer', department: 'Management', status: 'Inactive', lastActive: '2 days ago', email: 'amit.p@dryyftq.com', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzA5UQe3XNnVn-3JcHdFFMvz7H1-Y3WpMntrx_FpSxMJiZU-mEfW-kYrXKuNLLWrfVtbkLvFuKWNqlXouZmwXVnOlJBfNHLkPa66eXTuE00rCiPHPIzt9s_HweRT4301AxDrLz2_o2wCaAq1E6W8j-cbJ2u-1ssXLQFM-voju4ZYBsDofkYNsKOPGnImvcsQdDnpQ-R7ZEstTK77eoCbNZJhxt8qD-NpjXzr-uiiUdjlD0NxBqbfDvLA' },
  ],
  integrations: [
    { id: 'aws', name: 'AWS 3', category: 'Cloud IoT', status: 'Connected', lastSync: '2 min ago', endpoint: 'https://iot.us-east-1.amazonaws.com', syncInterval: '60s', apiKey: 'AKIA****************' },
    { id: 'azure', name: 'Azure IoT', category: 'Cloud IoT', status: 'Connected', lastSync: '2 min ago', endpoint: 'dryftq-hub.azure-devices.net', syncInterval: '30s', apiKey: 'SharedAccessKey=****' },
    { id: 'influx', name: 'InfluxDB', category: 'Time-Series DB', status: 'Connected', lastSync: '1 min ago', endpoint: 'https://influx.internal.dryftq.io:8086', syncInterval: '15s', apiKey: 'token_d9f829f0****' },
    { id: 'slack', name: 'Slack', category: 'Alert Notifications', status: 'Connected', lastSync: '2 min ago', endpoint: 'https://hooks.slack.com/services/DRYFTQ/B0123/alerts', syncInterval: 'Real-time', apiKey: 'xoxb-dryftq-bot****' },
    { id: 'datadog', name: 'Datadog', category: 'APM & Telemetry', status: 'Disconnected', lastSync: 'Never', endpoint: 'https://api.datadoghq.com', syncInterval: '60s', apiKey: '' },
    { id: 'grafana', name: 'Grafana', category: 'Visualization', status: 'Disconnected', lastSync: 'Never', endpoint: 'https://grafana.internal.dryftq.io', syncInterval: '30s', apiKey: '' },
    { id: 'gcp', name: 'Google Cloud', category: 'Cloud IoT', status: 'Disconnected', lastSync: 'Never', endpoint: 'https://cloudiot.googleapis.com', syncInterval: '60s', apiKey: '' },
    { id: 'teams', name: 'Microsoft Teams', category: 'Alert Notifications', status: 'Disconnected', lastSync: 'Never', endpoint: 'https://dryftq.webhook.office.com', syncInterval: 'Real-time', apiKey: '' },
  ],
  recentEvents: [
    { time: '10:30', title: 'Vibration detected on Line 2', severity: 'critical', machineId: 'CNC-02' },
    { time: '09:15', title: 'Temperature threshold exceeded', severity: 'warning', machineId: 'PRESS-02' },
    { time: '08:45', title: 'Process back to normal', severity: 'info', machineId: 'CNC-01' },
  ],
};

/** Deep clone of the seed state (safe for reset + first paint). */
export function cloneDefaultState(): PlantState {
  return structuredClone(DEFAULT_STATE);
}
