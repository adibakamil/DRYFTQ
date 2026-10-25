import { useEffect, useState } from 'react';
import { Modal, Select } from '../../components/ui';
import { useActions, useStore } from '../../store/context';
import type { TeamMember } from '../../lib/types';
import { ACCENT_BTN, FIELD, LABEL, MUTED_BTN, OPTION, ROLE_OPTIONS } from './shared';

export interface EditRoleModalProps {
  /** Selected row — `null` keeps the dialog closed. */
  member: TeamMember | null;
  onClose(): void;
}

/** Legacy `#edit-role-modal` — role picker with the source option labels. */
export function EditRoleModal({ member, onClose }: EditRoleModalProps) {
  const actions = useActions();
  const { notify } = useStore();
  const [role, setRole] = useState<string>(ROLE_OPTIONS[0]?.value ?? 'Admin');

  // Prefill from the selected member whenever it changes (legacy `openEditRoleModal`).
  useEffect(() => {
    if (member) setRole(member.role);
  }, [member]);

  const save = () => {
    if (!member) return;
    actions.updateTeamMemberRole(member.id, role);
    notify({ message: `Updated member role to ${role}`, type: 'success' });
    onClose();
  };

  // A role outside the legacy list still has to render as a selected option.
  const options = ROLE_OPTIONS.some((o) => o.value === role)
    ? ROLE_OPTIONS
    : [...ROLE_OPTIONS, { value: role, label: role }];

  return (
    <Modal
      open={member !== null}
      onClose={onClose}
      size="sm"
      tone="dark"
      panelClassName="!bg-[#07243e]"
      aria-label="Update Member Role"
    >
      <div className="mb-4 border-b border-[#0d3459] pb-3 pr-10">
        <h3 className="text-lg font-bold text-white">Update Member Role</h3>
      </div>

      <div className="mb-4">
        <p className="text-xs text-slate-400">Member:</p>
        <p className="mt-0.5 text-sm font-bold text-white">
          {member ? `${member.name} (${member.department || 'Plant Operations'})` : '-'}
        </p>
      </div>

      <div className="mb-5">
        <label className={LABEL} htmlFor="edit-role-select">
          Assigned Role
        </label>
        <Select
          id="edit-role-select"
          className={FIELD}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className={OPTION}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button type="button" className={`btn btn-sm ${MUTED_BTN}`} onClick={onClose}>
          Cancel
        </button>
        <button type="button" className={`btn btn-sm ${ACCENT_BTN}`} onClick={save}>
          Save Role
        </button>
      </div>
    </Modal>
  );
}
