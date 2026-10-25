/**
 * Shared constants, drafts and pure helpers for the Settings & Profile module.
 * Pure TypeScript only — no JSX in here.
 *
 * Option values, labels and validation copy are ported verbatim from the
 * legacy `DRYFTQ ALL DASHBOARD/DRYFTQ DASHBOARD 9(SETTING)/code.html`.
 */
import type { Settings, User } from '../../lib/types';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

/* ------------------------------------------------------------------ */
/* System Settings option lists (legacy `#select-*` markup)            */
/* ------------------------------------------------------------------ */

export const LANGUAGE_OPTIONS: SelectOption[] = [
  { value: 'en', label: 'English (US / Global)' },
  { value: 'de', label: 'Deutsch (German)' },
  { value: 'es', label: 'Español (Spanish)' },
  { value: 'fr', label: 'Français (French)' },
  { value: 'hi', label: 'हिन्दी (Hindi)' },
  { value: 'ja', label: '日本語 (Japanese)' },
];

export const TIMEZONE_OPTIONS: SelectOption[] = [
  { value: 'Asia/Kolkata', label: '(UTC+05:30) Asia/Kolkata (IST)' },
  { value: 'UTC', label: '(UTC+00:00) UTC (Universal Coordinated Time)' },
  { value: 'America/New_York', label: '(UTC-05:00) Eastern Time (US & Canada)' },
  { value: 'Europe/London', label: '(UTC+01:00) London (BST)' },
  { value: 'Asia/Tokyo', label: '(UTC+09:00) Tokyo (JST)' },
  { value: 'Europe/Berlin', label: '(UTC+02:00) Berlin (CEST)' },
];

export const DATE_FORMAT_OPTIONS: SelectOption[] = [
  { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY (e.g. 24-10-2026)' },
  { value: 'MM-DD-YYYY', label: 'MM-DD-YYYY (e.g. 10-24-2026)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO 8601)' },
];

/**
 * The legacy theme select offers a third `system` choice that
 * `Settings['theme']` (`'light' | 'dark'`) does not model yet — the draft
 * keeps it so the option list stays verbatim; `toSettingsPatch` narrows it
 * for the store call (see below).
 */
export type ThemeChoice = Settings['theme'] | 'system';

export const THEME_OPTIONS: SelectOption<ThemeChoice>[] = [
  { value: 'light', label: 'DRYFTQ Light Surface (Standard)' },
  { value: 'dark', label: 'Industrial High-Contrast Dark' },
  { value: 'system', label: 'Follow Operating System' },
];

export const UNIT_OPTIONS: SelectOption<Settings['units']>[] = [
  { value: 'metric', label: 'Metric (°C, kW, bar, mm/s)' },
  { value: 'imperial', label: 'Imperial (°F, HP, PSI, in/s)' },
];

/* ------------------------------------------------------------------ */
/* Drafts                                                              */
/* ------------------------------------------------------------------ */

export interface SettingsDraft {
  language: string;
  timezone: string;
  dateFormat: string;
  theme: ThemeChoice;
  units: Settings['units'];
}

/**
 * Seed the form straight from the store — values are copied verbatim, never
 * normalized, so the legacy `dateFormat: 'dd-mm-yyyy'` / `timezone:
 * 'asia-kolkata'` defaults keep falling back to the first `<option>` exactly
 * like the legacy `populateSettings()` did.
 */
export function settingsDraft(settings: Settings): SettingsDraft {
  return {
    language: settings.language,
    timezone: settings.timezone,
    dateFormat: settings.dateFormat,
    theme: settings.theme,
    units: settings.units,
  };
}

/** `Save Changes` payload — legacy `handleSettingsSave()` shape. */
export function toSettingsPatch(draft: SettingsDraft): Partial<Settings> {
  return {
    language: draft.language,
    timezone: draft.timezone,
    dateFormat: draft.dateFormat,
    // `Settings['theme']` only allows 'light' | 'dark' while the legacy select
    // also offers 'system'; `lib/types.ts` is outside this module's scope, so
    // the choice is handed to the store verbatim (it persists the string).
    theme: draft.theme as Settings['theme'],
    units: draft.units,
  };
}

export interface ProfileDraft {
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
}

/** Edit-profile modal seed (legacy `openEditProfileModal()` used `|| ''`). */
export function profileDraft(user: User): ProfileDraft {
  return {
    name: user.name || '',
    role: user.role || '',
    department: user.department || '',
    email: user.email || '',
    phone: user.phone || '',
  };
}

/** Legacy `handleProfileUpdate()` trimmed every field before saving. */
export function trimProfile(draft: ProfileDraft): ProfileDraft {
  return {
    name: draft.name.trim(),
    role: draft.role.trim(),
    department: draft.department.trim(),
    email: draft.email.trim(),
    phone: draft.phone.trim(),
  };
}

export interface ProfileDisplay {
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  avatar: string;
}

/** Profile card copy — legacy `populateProfile()` fallbacks, verbatim. */
export function displayProfile(user: User): ProfileDisplay {
  return {
    name: user.name || 'Adiba Kamil',
    role: user.role || 'Product Specialist',
    department: user.department || 'Plant Operations',
    email: user.email || 'adibakamil@dryftq.com',
    phone: user.phone || '+91 98765 43210',
    avatar: user.avatar || '/mine.jpg',
  };
}

/* ------------------------------------------------------------------ */
/* Password modal                                                      */
/* ------------------------------------------------------------------ */

export interface PasswordDraft {
  current: string;
  next: string;
  confirm: string;
}

export const EMPTY_PASSWORDS: PasswordDraft = { current: '', next: '', confirm: '' };

export type PasswordCheck = { ok: true } | { ok: false; message: string };

/**
 * Legacy `handlePasswordSubmit()` checks in the same order, with the exact
 * copy it toasted. Password values are only ever read here — never logged,
 * persisted or echoed back.
 */
export function checkPassword(draft: PasswordDraft): PasswordCheck {
  if (!draft.current) return { ok: false, message: 'Please enter your current password' };
  if (draft.next.length < 8) return { ok: false, message: 'New password must be at least 8 characters long' };
  if (draft.next !== draft.confirm) return { ok: false, message: 'New passwords do not match' };
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Console styling constants (dark module per MODULE_CONTRACT.md)      */
/* ------------------------------------------------------------------ */

/** Console accent action (contract accent `#FF3D0A`). */
export const ACCENT_SM = 'btn btn-sm rounded-lg bg-[#FF3D0A] text-white hover:bg-[#e03405]';
/** Secondary action on the dark console. */
export const MUTED_SM = 'btn btn-sm rounded-lg bg-white/10 text-white hover:bg-white/20';
/** Legacy full-width 58px card actions (`Save Changes`, `Change Password`). */
export const ACCENT_BLOCK =
  'btn h-[58px] w-full rounded-xl bg-[#FF3D0A] px-6 text-base font-bold text-white hover:bg-[#e03405]';
export const MUTED_BLOCK =
  'btn h-[58px] w-full rounded-xl bg-white/10 px-6 text-base font-bold text-white hover:bg-white/20';
/** Legacy gray labels/hints are unreadable on the #07243e dialog panel. */
export const FIELD_DARK = '[&_label]:text-slate-300 [&_span]:text-slate-400';
