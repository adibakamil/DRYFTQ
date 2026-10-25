import { Badge } from '../../components/ui';
import { roleBadge, statusBadge } from './shared';

/** Legacy `getRoleBadge()` pill — exact background/text hexes from code.html. */
export function RoleBadge({ role }: { role: string }) {
  const spec = roleBadge(role);
  return (
    <Badge tone={spec.tone} className={spec.className}>
      {role}
    </Badge>
  );
}

/** Legacy status pill: `Active` emerald, every other value renders as `Inactive` red. */
export function MemberStatusBadge({ status }: { status: string }) {
  const spec = statusBadge(status);
  return (
    <Badge tone={spec.tone} className={spec.className}>
      {status === 'Active' ? 'Active' : 'Inactive'}
    </Badge>
  );
}
