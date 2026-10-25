import { useEffect, useState, type FormEvent } from 'react';
import { Modal, Select, TextInput } from '../../components/ui';
import { Icon } from '../../components/Icon';
import { useActions, useStore } from '../../store/context';
import {
  ACCENT_BTN,
  DEPARTMENTS,
  FIELD,
  INVITE_ROLES,
  LABEL,
  MUTED_BTN,
  OPTION,
  isValidInvite,
  pickAvatar,
} from './shared';

interface InviteDraft {
  name: string;
  email: string;
  role: string;
  department: string;
}

/** Same first options the legacy `#invite-*` selects started on. */
const EMPTY_DRAFT: InviteDraft = {
  name: '',
  email: '',
  role: 'Operator',
  department: 'Plant Operations',
};

export interface InviteMemberModalProps {
  open: boolean;
  onClose(): void;
}

/** Legacy `#invite-modal` — invite form with SSO key notice + follow-up toast. */
export function InviteMemberModal({ open, onClose }: InviteMemberModalProps) {
  const actions = useActions();
  const { notify } = useStore();
  const [draft, setDraft] = useState<InviteDraft>(EMPTY_DRAFT);

  // Legacy `closeInviteModal()` reset `#invite-form`.
  useEffect(() => {
    if (!open) setDraft(EMPTY_DRAFT);
  }, [open]);

  const set = <K extends keyof InviteDraft>(key: K, value: InviteDraft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = draft.name.trim();
    const email = draft.email.trim();

    if (!isValidInvite(name, email)) {
      notify({ message: 'Please provide a valid name and email address', type: 'error' });
      return;
    }

    const role = draft.role;
    actions.inviteTeamMember({
      name,
      email,
      role,
      department: draft.department,
      status: 'Active',
      lastActive: 'Just now',
      avatar: pickAvatar(),
    });
    notify({ message: `Team invitation sent to ${name} (${role})`, type: 'success' });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      tone="dark"
      panelClassName="!bg-[#07243e]"
      aria-label="Invite Team Member"
    >
      <div className="mb-5 border-b border-[#0d3459] pb-4 pr-10">
        <h3 className="text-xl font-bold text-white">Invite Team Member</h3>
        <p className="mt-0.5 text-xs text-slate-400">
          Add an engineer or supervisor to the DRYFTQ plant workspace
        </p>
      </div>

      {/* `noValidate` keeps the legacy toast authoritative over the browser bubble. */}
      <form noValidate onSubmit={submit} className="space-y-4">
        <div>
          <label className={LABEL} htmlFor="invite-name">
            Full Name
          </label>
          <TextInput
            id="invite-name"
            type="text"
            required
            placeholder="e.g. Elena Rostova"
            className={FIELD}
            value={draft.name}
            onChange={(e) => set('name', e.target.value)}
          />
        </div>

        <div>
          <label className={LABEL} htmlFor="invite-email">
            Work Email
          </label>
          <TextInput
            id="invite-email"
            type="email"
            required
            placeholder="elena@dryftq.internal"
            className={FIELD}
            value={draft.email}
            onChange={(e) => set('email', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="invite-role">
              Role
            </label>
            <Select
              id="invite-role"
              required
              className={FIELD}
              value={draft.role}
              onChange={(e) => set('role', e.target.value)}
            >
              {INVITE_ROLES.map((role) => (
                <option key={role} value={role} className={OPTION}>
                  {role}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className={LABEL} htmlFor="invite-dept">
              Department
            </label>
            <Select
              id="invite-dept"
              required
              className={FIELD}
              value={draft.department}
              onChange={(e) => set('department', e.target.value)}
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept} className={OPTION}>
                  {dept}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-xl border border-[#0d3459] bg-white/5 p-3 text-xs text-slate-400">
          <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-[#FF3D0A]" strokeWidth={2} />
          <span>
            An access invite key will be automatically provisioned for internal SSO login. Permissions take
            effect immediately.
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#0d3459] pt-3">
          <button type="button" className={`btn btn-sm ${MUTED_BTN}`} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={`btn btn-sm ${ACCENT_BTN}`}>
            Send Invitation
          </button>
        </div>
      </form>
    </Modal>
  );
}
