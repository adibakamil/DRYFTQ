import { ConfirmDialog } from '../../components/ui';
import { Icon } from '../../components/Icon';
import { useActions, useStore } from '../../store/context';
import type { TeamMember } from '../../lib/types';

export interface RemoveMemberDialogProps {
  /** Selected row — `null` keeps the dialog closed. */
  member: TeamMember | null;
  onClose(): void;
}

/** Legacy `#remove-modal` — destructive revoke confirmation. */
export function RemoveMemberDialog({ member, onClose }: RemoveMemberDialogProps) {
  const actions = useActions();
  const { notify } = useStore();

  const confirm = () => {
    if (!member) return;
    actions.removeTeamMember(member.id);
    notify({ message: 'Member removed from team', type: 'info' });
    onClose();
  };

  return (
    <ConfirmDialog
      open={member !== null}
      title="Remove Team Member?"
      tone="danger"
      cancelLabel="Cancel"
      confirmLabel="Yes, Remove"
      onCancel={onClose}
      onConfirm={confirm}
      message={
        <>
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <Icon name="trash" className="h-6 w-6" strokeWidth={2} />
          </span>
          <p className="text-center">
            Are you sure you want to revoke access for{' '}
            <span className="font-bold text-slate-700">{member?.name ?? '-'}</span>? This will immediately
            terminate active sessions.
          </p>
        </>
      }
    />
  );
}
