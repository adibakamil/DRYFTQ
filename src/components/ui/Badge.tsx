import type { ReactNode } from 'react';
import { cx } from '../../lib/utils';
import { alertStatusTone, statusTone, type BadgeTone } from './tone';

const TONE_CLASS: Record<BadgeTone, string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  danger: 'bg-red-50 text-red-700 ring-red-600/20',
  warning: 'bg-amber-50 text-amber-800 ring-amber-600/25',
  info: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  neutral: 'bg-gray-100 text-gray-700 ring-gray-500/20',
  brand: 'bg-brand-tint text-brand-action ring-brand/25',
};

export interface BadgeProps {
  tone?: BadgeTone;
  dot?: boolean;
  children: ReactNode;
  className?: string;
  /** Dark-console variant (translucent instead of pastel). */
  dark?: boolean;
}

const DARK_TONE_CLASS: Record<BadgeTone, string> = {
  success: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30',
  danger: 'bg-red-500/15 text-red-300 ring-red-400/30',
  warning: 'bg-amber-500/15 text-amber-300 ring-amber-400/30',
  info: 'bg-blue-500/15 text-blue-300 ring-blue-400/30',
  neutral: 'bg-white/10 text-slate-300 ring-white/15',
  brand: 'bg-[#FF3D0A]/15 text-orange-300 ring-orange-400/30',
};

/** Pill label used for severities, statuses and categories. */
export function Badge({ tone = 'neutral', dot, dark, children, className }: BadgeProps) {
  return (
    <span
      className={cx(
        'chip ring-1 ring-inset',
        dark ? DARK_TONE_CLASS[tone] : TONE_CLASS[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 flex-none rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}

export interface StatusBadgeProps {
  value: string;
  dark?: boolean;
  dot?: boolean;
  className?: string;
}

/** Status/severity pill with the platform's canonical colour mapping. */
export function StatusBadge({ value, dark, dot = true, className }: StatusBadgeProps) {
  return (
    <Badge tone={statusTone(value)} dark={dark} dot={dot} className={className}>
      {value}
    </Badge>
  );
}

export interface AlertStatusBadgeProps {
  status: string;
  dark?: boolean;
  dot?: boolean;
  className?: string;
}

/** Status pill for an incident: Active (red) / Acknowledged (amber) / Resolved (emerald). */
export function AlertStatusBadge({ status, dark, dot = true, className }: AlertStatusBadgeProps) {
  return (
    <Badge tone={alertStatusTone(status)} dark={dark} dot={dot} className={className}>
      {status}
    </Badge>
  );
}
