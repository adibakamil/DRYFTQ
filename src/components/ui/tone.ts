/**
 * Colour vocabulary shared by badges, dots and status pills.
 *
 * Kept in a component-free module so Vite's fast refresh keeps working
 * (a file that mixes components and helpers loses HMR granularity).
 */

export type BadgeTone = 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'brand';

/** Canonical tone for the platform's status/severity strings. */
export function statusTone(value: string): BadgeTone {
  switch (value) {
    case 'Running':
    case 'Active':
    case 'Connected':
    case 'Completed':
    case 'Resolved':
    case 'Healthy':
      return 'success';
    case 'Error':
    case 'Critical':
    case 'High':
      return 'danger';
    case 'Idle':
    case 'Warning':
    case 'Upcoming':
    case 'Medium':
    case 'In Progress':
      return 'warning';
    case 'Maintenance':
    case 'Acknowledged':
    case 'Info':
      return 'info';
    default:
      return 'neutral';
  }
}

/**
 * Alert lifecycle tone — deliberately different from `statusTone`: here
 * `Active` must read as urgent (red), matching the legacy incident feed.
 * (`Active` in the team/integration sense stays green via `statusTone`.)
 */
export function alertStatusTone(status: string): BadgeTone {
  switch (status) {
    case 'Active':
      return 'danger';
    case 'Acknowledged':
      return 'warning';
    case 'Resolved':
      return 'success';
    default:
      return 'neutral';
  }
}
