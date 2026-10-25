import type { FormEvent } from 'react';
import { Field, Modal, TextInput } from '../../components/ui';
import { ACCENT_SM, FIELD_DARK, MUTED_SM, type PasswordDraft, type ProfileDraft } from './shared';

/* ------------------------------------------------------------------ */
/* Edit Profile Information (legacy `#edit-profile-modal`)             */
/* ------------------------------------------------------------------ */

export interface EditProfileModalProps {
  open: boolean;
  draft: ProfileDraft;
  onDraft(patch: Partial<ProfileDraft>): void;
  onClose(): void;
  onSubmit(event: FormEvent<HTMLFormElement>): void;
}

export function EditProfileModal({ open, draft, onDraft, onClose, onSubmit }: EditProfileModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      tone="dark"
      panelClassName="!bg-[#07243e]"
      labelledBy="edit-profile-heading"
    >
      <div className="space-y-5 pr-8">
        <div className="border-b border-[#0d3459] pb-3">
          <h2 id="edit-profile-heading" className="text-lg font-bold text-white">
            Edit Profile Information
          </h2>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <Field label="Full Name" htmlFor="edit-profile-name" required className={FIELD_DARK}>
            <TextInput
              id="edit-profile-name"
              required
              autoComplete="name"
              value={draft.name}
              onChange={(event) => onDraft({ name: event.target.value })}
            />
          </Field>
          <Field label="Job Role" htmlFor="edit-profile-role" required className={FIELD_DARK}>
            <TextInput
              id="edit-profile-role"
              required
              autoComplete="organization-title"
              value={draft.role}
              onChange={(event) => onDraft({ role: event.target.value })}
            />
          </Field>
          <Field label="Department" htmlFor="edit-profile-dept" required className={FIELD_DARK}>
            <TextInput
              id="edit-profile-dept"
              required
              autoComplete="organization"
              value={draft.department}
              onChange={(event) => onDraft({ department: event.target.value })}
            />
          </Field>
          <Field label="Email Address" htmlFor="edit-profile-email" required className={FIELD_DARK}>
            <TextInput
              id="edit-profile-email"
              type="email"
              required
              autoComplete="email"
              value={draft.email}
              onChange={(event) => onDraft({ email: event.target.value })}
            />
          </Field>
          <Field label="Phone Number" htmlFor="edit-profile-phone" required className={FIELD_DARK}>
            <TextInput
              id="edit-profile-phone"
              required
              autoComplete="tel"
              value={draft.phone}
              onChange={(event) => onDraft({ phone: event.target.value })}
            />
          </Field>

          <div className="flex items-center justify-end gap-3 border-t border-[#0d3459] pt-3">
            <button type="button" className={MUTED_SM} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={ACCENT_SM}>
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Change Password (legacy `#password-modal`)                          */
/* ------------------------------------------------------------------ */

export interface PasswordModalProps {
  open: boolean;
  draft: PasswordDraft;
  onDraft(patch: Partial<PasswordDraft>): void;
  onClose(): void;
  onSubmit(event: FormEvent<HTMLFormElement>): void;
}

/**
 * The three inputs are deliberately left off the native `required` list the
 * legacy markup carried: browser validation would swallow the empty-field
 * checks and `Please enter your current password` would never be toasted.
 * `checkPassword()` is the single source of truth instead.
 */
export function PasswordModal({ open, draft, onDraft, onClose, onSubmit }: PasswordModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      tone="dark"
      panelClassName="!bg-[#07243e]"
      labelledBy="password-heading"
    >
      <div className="space-y-5 pr-8">
        <div className="border-b border-[#0d3459] pb-3">
          <h2 id="password-heading" className="text-lg font-bold text-white">
            Change Password
          </h2>
        </div>

        <form className="space-y-4 py-2" onSubmit={onSubmit}>
          <Field label="Current Password" htmlFor="pwd-curr" className={FIELD_DARK}>
            <TextInput
              id="pwd-curr"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={draft.current}
              onChange={(event) => onDraft({ current: event.target.value })}
            />
          </Field>
          <Field label="New Password" htmlFor="pwd-new" hint="Minimum 8 characters" className={FIELD_DARK}>
            <TextInput
              id="pwd-new"
              type="password"
              autoComplete="new-password"
              value={draft.next}
              onChange={(event) => onDraft({ next: event.target.value })}
            />
          </Field>
          <Field label="Confirm New Password" htmlFor="pwd-confirm" className={FIELD_DARK}>
            <TextInput
              id="pwd-confirm"
              type="password"
              placeholder="Repeat new password"
              autoComplete="new-password"
              value={draft.confirm}
              onChange={(event) => onDraft({ confirm: event.target.value })}
            />
          </Field>

          <div className="flex items-center justify-end gap-3 border-t border-[#0d3459] pt-3">
            <button type="button" className={MUTED_SM} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={ACCENT_SM}>
              Update Password
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
