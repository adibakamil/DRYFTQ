/**
 * Telemetry for the six machines pinned on the 3D isometric floor map.
 *
 * Coordinates are percentages of the map viewport (not pixels) so every
 * hotspot stays locked to its machine at any breakpoint, zoom level or pan
 * offset. `layout` picks the marker treatment: the critical Dahlih gets the
 * full warning card, the rest get the compact glass pill.
 */
export type TwinAccent = 'critical' | 'warning' | 'healthy' | 'cyan';
export type TwinStatus = 'Critical' | 'Attention' | 'Healthy';

export interface TwinMachine {
  id: string;
  name: string;
  asset: string;
  line: string;
  health: number;
  status: TwinStatus;
  accent: TwinAccent;
  /** Marker anchor, % of the map viewport. */
  top: number;
  left: number;
  layout: 'card' | 'pill';
  /** Draw the pulsing floor ring over the machine. */
  ring: boolean;
  /** Subtle connector from the pill down to the machine. */
  connector?: boolean;
  /** Extra lift (px) so the label clears neighbours on narrow maps. */
  mobileLift?: number;
  /** Tall stem on mobile when the label floats well above the anchor. */
  stem?: boolean;
  temperature: number;
  vibration: number;
  shiftOutput: number;
  note: string;
}

export const TWIN_MACHINES: TwinMachine[] = [
  {
    id: 'MCV-1250',
    name: 'Dahlih MCV-1250',
    asset: 'Vertical machining centre',
    line: 'Line 1',
    health: 23,
    status: 'Critical',
    accent: 'critical',
    top: 44,
    left: 26,
    layout: 'card',
    ring: true,
    mobileLift: 20,
    temperature: 96,
    vibration: 4.8,
    shiftOutput: 412,
    note: 'Spindle bearing wear detected. Vibration has held above 4.2 mm/s for three consecutive shifts — schedule a bearing inspection before the next production window.',
  },
  {
    id: 'PB-02',
    name: 'Pressure brake',
    asset: 'Hydraulic press brake',
    line: 'Line 2',
    health: 33,
    status: 'Attention',
    accent: 'warning',
    top: 52,
    left: 41,
    layout: 'pill',
    ring: false,
    connector: true,
    mobileLift: 20,
    temperature: 84,
    vibration: 3.6,
    shiftOutput: 520,
    note: 'Hydraulic pressure is cycling outside tolerance. The relief valve is compensating — verify the accumulator pre-charge at the next changeover.',
  },
  {
    id: 'INT-200',
    name: 'Mazak Integrex',
    asset: 'Multi-tasking lathe',
    line: 'Line 2',
    health: 59,
    status: 'Attention',
    accent: 'healthy',
    top: 39,
    left: 53,
    layout: 'pill',
    ring: true,
    mobileLift: 62,
    stem: true,
    temperature: 74,
    vibration: 2.1,
    shiftOutput: 861,
    note: 'Tool-change interval was shortened automatically after a thermal drift event. Compensation is holding; trend the spindle warm-up curve this week.',
  },
  {
    id: 'PL-07',
    name: 'Plasma',
    asset: 'CNC plasma cutter',
    line: 'Line 1',
    health: 83,
    status: 'Healthy',
    accent: 'cyan',
    top: 56,
    left: 51,
    layout: 'pill',
    ring: true,
    mobileLift: 8,
    temperature: 68,
    vibration: 1.2,
    shiftOutput: 1180,
    note: 'Cut quality is nominal and dross is within spec. Torch consumables are at 62% of service life — no action required this shift.',
  },
  {
    id: 'DP-04',
    name: 'Deosan puma',
    asset: 'Wash & sanitation unit',
    line: 'Line 3',
    health: 77,
    status: 'Healthy',
    accent: 'healthy',
    top: 66,
    left: 43,
    layout: 'pill',
    ring: false,
    mobileLift: 20,
    temperature: 61,
    vibration: 0.8,
    shiftOutput: 940,
    note: 'Wash cycle is stable. Chemical dosage sits within 1.4% of the recipe target — the next calibration is due in nine days.',
  },
  {
    id: 'LS-09',
    name: 'Laser',
    asset: 'Fibre laser cell',
    line: 'Line 3',
    health: 70,
    status: 'Healthy',
    accent: 'healthy',
    top: 44,
    left: 72,
    layout: 'pill',
    ring: false,
    mobileLift: 10,
    temperature: 58,
    vibration: 0.6,
    shiftOutput: 1325,
    note: 'Beam alignment was verified at the start of shift and the protective lens is clean. Chiller delta is steady at 4.1 °C.',
  },
];

/** Accent hex values used by the drawer gauge + status pill. */
export const ACCENT_COLOR: Record<TwinAccent, string> = {
  critical: '#f87171',
  warning: '#fb923c',
  healthy: '#4ade80',
  cyan: '#2dd4bf',
};

