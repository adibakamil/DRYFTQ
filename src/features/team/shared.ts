/**
 * Shared constants, badge specs and pure helpers for the Team module.
 * Pure TypeScript only — no JSX in here. Copy is ported from
 * `DRYFTQ DASHBOARD 8(TEAM MANAGEMENT)/code.html`.
 */
import type { BadgeTone } from '../../components/ui';
import type { MemberRole, TeamMember } from '../../lib/types';

/** Role-pill filter — `'ALL'` is the legacy `filterByRole('ALL')` default. */
export type RoleFilter = 'ALL' | MemberRole;

/** Legacy `#role-filter-container` pills (labels verbatim). */
export const ROLE_FILTERS: { value: RoleFilter; label: string }[] = [
  { value: 'ALL', label: 'All Roles' },
  { value: 'Admin', label: 'Admins' },
  { value: 'Operator', label: 'Operators' },
  { value: 'Analyst', label: 'Analysts' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Viewer', label: 'Viewers' },
];

/** Active pill keeps the legacy `#031B30` chip; idle copy stays readable on dark. */
export const PILL_ACTIVE =
  'rounded-lg bg-[#031B30] px-4 py-1.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/15 transition';
export const PILL_IDLE =
  'rounded-lg px-4 py-1.5 text-sm font-semibold text-slate-400 transition hover:bg-white/10 hover:text-white';

/** Legacy `#invite-role` options, in source order. */
export const INVITE_ROLES: string[] = ['Operator', 'Maintenance', 'Analyst', 'Admin', 'Viewer'];

/** Legacy `#invite-dept` options, in source order. */
export const DEPARTMENTS: string[] = [
  'Plant Operations',
  'Production',
  'Maintenance',
  'Analytics',
  'Quality Control',
  'Management',
];

/** Legacy `#edit-role-select` option labels — copied verbatim from code.html. */
export const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: 'Admin', label: 'Admin (Full Control)' },
  { value: 'Operator', label: 'Operator (Floor Controls)' },
  { value: 'Analyst', label: 'Analyst (Data & Telemetry)' },
  { value: 'Maintenance', label: 'Maintenance (Work Orders)' },
  { value: 'Viewer', label: 'Viewer (Read Only)' },
];

/** Legacy unsplash avatar pool from `handleInviteSubmit`. */
export const AVATARS: string[] = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
];

/** Legacy row-avatar fallback (`renderTeamTable`). */
export const AVATAR_FALLBACK =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80';

/** Random avatar from the legacy pool (index-safe under `noUncheckedIndexedAccess`). */
export function pickAvatar(): string {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)] ?? AVATAR_FALLBACK;
}

/* ---------------- Badges ---------------- */

export interface BadgeSpec {
  tone: BadgeTone;
  /** Legacy pill colours — `!` keeps them above the kit's tone utilities. */
  className: string;
}

/** Legacy pill metrics: `px-3 py-1 text-xs`, no ring. */
const PILL = '!px-3 !py-1 !text-xs !ring-0';

/** Legacy `getRoleBadge()` — exact hexes from code.html. */
export const ROLE_BADGES: Record<string, BadgeSpec> = {
  Admin: { tone: 'info', className: `${PILL} !bg-[#E8F1FD] !text-[#2563EB]` },
  Operator: { tone: 'warning', className: `${PILL} !bg-[#FFEDD5] !text-[#EA580C]` },
  Analyst: { tone: 'neutral', className: `${PILL} !bg-[#F3E8FF] !text-[#9333EA]` },
  Maintenance: { tone: 'success', className: `${PILL} !bg-[#ECFDF5] !text-[#059669]` },
  Viewer: { tone: 'warning', className: `${PILL} !bg-[#FEF9C3] !text-[#CA8A04]` },
};

/** Legacy `getRoleBadge()` default branch → Viewer pill. */
export const DEFAULT_ROLE_BADGE: BadgeSpec = {
  tone: 'warning',
  className: `${PILL} !bg-[#FEF9C3] !text-[#CA8A04]`,
};

/** Legacy status pills: `Active` emerald, anything else `Inactive` red. */
export const ACTIVE_BADGE: BadgeSpec = { tone: 'success', className: `${PILL} !bg-[#DCFCE7] !text-[#16A34A]` };
export const INACTIVE_BADGE: BadgeSpec = { tone: 'danger', className: `${PILL} !bg-[#FEE2E2] !text-[#DC2626]` };

export function roleBadge(role: string): BadgeSpec {
  return ROLE_BADGES[role] ?? DEFAULT_ROLE_BADGE;
}

export function statusBadge(status: string): BadgeSpec {
  return status === 'Active' ? ACTIVE_BADGE : INACTIVE_BADGE;
}

/* ---------------- Copy helpers ---------------- */

/** Legacy email fallback: `<name with dots>@dryftq.internal`. */
export function memberEmail(member: Pick<TeamMember, 'name' | 'email'>): string {
  return member.email || `${member.name.toLowerCase().replace(/\s+/g, '.')}@dryftq.internal`;
}

/**
 * Invite validation — the form is `noValidate` so the legacy error toast fires
 * instead of a browser bubble; shape matches `type="email"` semantics.
 */
export function isValidInvite(name: string, email: string): boolean {
  return name.trim().length > 0 && /^[^\s@]+@[^\s@]+$/.test(email.trim());
}

/* ---------------- Dark-console control styles ---------------- */

/** Console accent action (legacy `#FF3D0A`). */
export const ACCENT_BTN = 'rounded-lg bg-[#FF3D0A] text-white hover:bg-[#e03405]';
/** Secondary action on the dark console. */
export const MUTED_BTN = 'rounded-lg bg-white/10 text-white hover:bg-white/20';
/** Legacy uppercase form labels, readable on #07243e. */
export const LABEL = 'mb-1 block text-xs font-bold uppercase tracking-wider text-slate-300';
/** `.field` utilities overridden for the dark modal panel. */
export const FIELD = 'min-h-[40px] border-white/15 bg-white/5 text-sm text-white placeholder-slate-500';
/** Select options must not inherit the light UA style inside a dark panel. */
export const OPTION = 'bg-[#07243e] text-white';
