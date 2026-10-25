import type { MachineStatus } from '../../lib/types';
import { Badge, StatusBadge } from '../../components/ui';

/**
 * Legacy pill palette: Running = green, Idle = blue, Error = red,
 * Maintenance = orange. The canonical `StatusBadge` mapping sends Idle to
 * amber and Maintenance to blue; Idle keeps the legacy blue explicitly, and
 * Maintenance uses the brand orange so the two never render identically.
 * Running/Error stay on the canonical mapping.
 */
export function StatusPill({ status }: { status: MachineStatus }) {
  if (status === 'Idle') return <Badge tone="info" dark dot>{status}</Badge>;
  if (status === 'Maintenance') return <Badge tone="brand" dark dot>{status}</Badge>;
  return <StatusBadge value={status} dark />;
}
