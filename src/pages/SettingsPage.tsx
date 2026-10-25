/**
 * Settings & Profile module — React migration of the legacy
 * `DRYFTQ ALL DASHBOARD/DRYFTQ DASHBOARD 9(SETTING)/code.html`.
 *
 * Everything renders from `usePlantState()` (`user`, `settings`): no manual
 * `dryftq:state-change` listeners, no DOM reads and no `localStorage` calls —
 * persistence and toasts stay in the store.
 */
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useActions, usePlantState, useToasts } from '../store/context';
import { ProfileCard } from '../features/settings/ProfileCard';
import { EditProfileModal, PasswordModal } from '../features/settings/ProfileModals';
import { SettingsFormCard } from '../features/settings/SettingsFormCard';
import {
  EMPTY_PASSWORDS,
  checkPassword,
  displayProfile,
  profileDraft,
  settingsDraft,
  toSettingsPatch,
  trimProfile,
  type PasswordDraft,
  type ProfileDraft,
  type SettingsDraft,
} from '../features/settings/shared';

export default function SettingsPage() {
  const state = usePlantState();
  const actions = useActions();
  const { notify } = useToasts();

  /* ---------------- System settings form ---------------- */

  const [settings, setSettings] = useState<SettingsDraft>(() => settingsDraft(state.settings));

  // Re-seed when the store's settings change elsewhere (cross-tab sync,
  // `resetToDefaults`) — replaces the legacy `dryftq:state-change` listener.
  useEffect(() => {
    setSettings(settingsDraft(state.settings));
  }, [state.settings]);

  const saveSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // The store toasts on every action — no extra "Saved" toast here.
    actions.updateSettings(toSettingsPatch(settings));
  };

  /* ---------------- Profile card ---------------- */

  const profile = useMemo(() => displayProfile(state.user), [state.user]);

  /* ---------------- Edit profile modal ---------------- */

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileDraft>(() => profileDraft(state.user));

  // Legacy seeded the inputs inside `openEditProfileModal()` — read the
  // freshest state here rather than from a possibly stale closure.
  const openProfile = () => {
    setProfileForm(profileDraft(state.user));
    setProfileOpen(true);
  };

  const submitProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    actions.updateUser(trimProfile(profileForm)); // store toasts
    setProfileOpen(false);
  };

  /* ---------------- Password modal ---------------- */

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwords, setPasswords] = useState<PasswordDraft>(EMPTY_PASSWORDS);

  // Legacy `closePasswordModal()` cleared all three fields on every close.
  const closePassword = () => {
    setPasswordOpen(false);
    setPasswords(EMPTY_PASSWORDS);
  };

  const submitPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const check = checkPassword(passwords);
    if (!check.ok) {
      notify({ message: check.message, type: 'error' });
      return;
    }
    closePassword();
    notify({ message: 'Security credentials updated successfully', type: 'success' });
  };

  /* ---------------- Render ---------------- */

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-lg font-bold text-white">Settings &amp; Profile</h2>
        <p className="mt-1 text-sm text-slate-400">
          Configure plant telemetry preferences, localization, and administrator credentials
        </p>
      </header>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12" data-purpose="settings-and-profile-grid">
        <SettingsFormCard
          draft={settings}
          onDraft={(patch) => setSettings((current) => ({ ...current, ...patch }))}
          onSubmit={saveSettings}
        />

        <ProfileCard
          profile={profile}
          onEdit={openProfile}
          onChangePassword={() => setPasswordOpen(true)}
        />
      </section>

      <EditProfileModal
        open={profileOpen}
        draft={profileForm}
        onDraft={(patch) => setProfileForm((current) => ({ ...current, ...patch }))}
        onClose={() => setProfileOpen(false)}
        onSubmit={submitProfile}
      />

      <PasswordModal
        open={passwordOpen}
        draft={passwords}
        onDraft={(patch) => setPasswords((current) => ({ ...current, ...patch }))}
        onClose={closePassword}
        onSubmit={submitPassword}
      />
    </div>
  );
}
