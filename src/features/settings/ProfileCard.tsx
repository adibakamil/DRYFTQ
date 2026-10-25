import { Link } from 'react-router-dom';
import { Icon } from '../../components/Icon';
import { ACCENT_SM, MUTED_BLOCK, type ProfileDisplay } from './shared';

/** Legacy contact-row glyphs — ported as-is (the shared icon set has no mail/phone mark). */
const EMAIL_GLYPH =
  'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z';
const PHONE_GLYPH =
  'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z';

function ContactGlyph({ path }: { path: string }) {
  return (
    <svg
      className="h-5 w-5 shrink-0 text-slate-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

export interface ProfileCardProps {
  profile: ProfileDisplay;
  onEdit(): void;
  onChangePassword(): void;
}

/** Legacy `#user-profile-card` — avatar, contact rows, access tier, password action. */
export function ProfileCard({ profile, onEdit, onChangePassword }: ProfileCardProps) {
  return (
    <article
      className="console-card-solid flex min-h-[580px] flex-col justify-between p-6 lg:col-span-5 lg:p-8"
      data-purpose="user-profile-card"
    >
      <div>
        {/* Card header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Profile</h3>
            <p className="mt-1 text-sm text-slate-400">Manage your personal operator credentials</p>
          </div>
          <button type="button" className={`${ACCENT_SM} whitespace-nowrap`} onClick={onEdit}>
            Edit Profile
          </button>
        </div>

        {/* Large avatar + titles */}
        <div className="mb-8 mt-3 flex flex-col items-center text-center">
          <div className="mb-5 h-36 w-36 overflow-hidden rounded-full border-4 border-white bg-[#E8DAC9] shadow-[0_0_0_6px_rgba(232,218,201,0.4)]">
            <img
              id="profile-card-avatar"
              src={profile.avatar}
              alt={profile.name}
              className="h-full w-full object-cover"
            />
          </div>
          <h4 id="profile-card-name" className="text-[23px] font-bold tracking-tight text-white">
            {profile.name}
          </h4>
          <p id="profile-card-role" className="mt-1 text-sm font-medium text-slate-300">
            {profile.role}
          </p>
          <p id="profile-card-dept" className="text-sm font-medium text-slate-400">
            {profile.department}
          </p>
        </div>

        {/* Contact details */}
        <div className="mb-8 space-y-4 sm:px-3" data-purpose="contact-details">
          <div className="flex items-center gap-4 text-slate-200 transition-colors hover:text-white">
            <ContactGlyph path={EMAIL_GLYPH} />
            <span id="profile-card-email" className="break-all text-sm font-medium tracking-tight">
              {profile.email}
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-200 transition-colors hover:text-white">
            <ContactGlyph path={PHONE_GLYPH} />
            <span id="profile-card-phone" className="text-sm font-medium tracking-tight">
              {profile.phone}
            </span>
          </div>
        </div>

        {/* Permission & quick access box (required flow: Settings → Team Management) */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div>
            <span className="block text-xs font-bold text-white">Plant Access Tier: Administrator</span>
            <span className="text-[11px] text-slate-400">Authorized for team administration &amp; scheduling</span>
          </div>
          <Link
            to="/team"
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/20"
          >
            <span>Manage Team</span>
            <Icon name="arrow" className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Bottom action: change password */}
      <div className="pt-2">
        <button type="button" className={MUTED_BLOCK} onClick={onChangePassword}>
          Change Password
        </button>
      </div>
    </article>
  );
}
