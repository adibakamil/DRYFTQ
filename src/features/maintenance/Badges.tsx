import { Badge, type BadgeTone } from '../../components/ui';
import { cx } from '../../lib/utils';
import type { MaintenanceStatus, Priority } from '../../lib/types';

const PRIORITY_TONE: Record<Priority, BadgeTone> = {
  High: 'danger',
  Medium: 'warning',
  Low: 'success',
};

/** Legacy "High" is rose, not the kit's red — override to the exact hue. */
const PRIORITY_CLASS: Record<Priority, string> = {
  High: '!bg-rose-500/15 !text-rose-300 !ring-rose-400/30',
  Medium: '',
  Low: '',
};

/** Priority pill: High=rose, Medium=amber, Low=emerald (legacy hues, dark surface). */
export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <Badge dark tone={PRIORITY_TONE[priority]} className={cx(PRIORITY_CLASS[priority], className)}>
      {priority}
    </Badge>
  );
}

const STATUS_TONE: Record<MaintenanceStatus, BadgeTone> = {
  Upcoming: 'info',
  'In Progress': 'warning',
  Completed: 'success',
};

/** Status pill: Upcoming=blue, In Progress=amber (pulsing), Completed=emerald. */
export function MaintenanceStatusBadge({ status, className }: { status: MaintenanceStatus; className?: string }) {
  return (
    <Badge dark tone={STATUS_TONE[status]} className={cx(status === 'In Progress' && 'animate-pulse', className)}>
      {status}
    </Badge>
  );
}
