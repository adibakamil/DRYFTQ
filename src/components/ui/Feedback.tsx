import type { ReactNode } from 'react';
import { cx } from '../../lib/utils';
import { Icon, type IconName } from '../Icon';

/* ---------------- Empty state ---------------- */

export interface EmptyStateProps {
  icon?: IconName;
  title: string;
  message?: string;
  action?: ReactNode;
  tone?: 'light' | 'dark';
  className?: string;
}

export function EmptyState({ icon = 'search', title, message, action, tone = 'light', className }: EmptyStateProps) {
  const dark = tone === 'dark';
  return (
    <div className={cx('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      <span
        className={cx(
          'mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full',
          dark ? 'bg-white/10 text-slate-300' : 'bg-brand-tint text-brand-action',
        )}
      >
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <h3 className={cx('text-base font-bold', dark ? 'text-white' : 'text-brand-ink')}>{title}</h3>
      {message && (
        <p className={cx('mt-1.5 max-w-sm text-sm', dark ? 'text-slate-400' : 'text-gray-600')}>{message}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ---------------- Spinner ---------------- */

export function Spinner({ className, label = 'Loading' }: { className?: string; label?: string }) {
  return (
    <span role="status" aria-label={label} className={cx('inline-block', className)}>
      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
        <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/* ---------------- Progress ---------------- */

const PROGRESS_TONE: Record<string, string> = {
  good: 'bg-emerald-500',
  ok: 'bg-amber-400',
  bad: 'bg-red-500',
  brand: 'bg-[#FF3D0A]',
};

function progressTone(value: number): keyof typeof PROGRESS_TONE {
  if (value >= 85) return 'good';
  if (value >= 65) return 'ok';
  return 'bad';
}

export interface ProgressBarProps {
  value: number;
  tone?: keyof typeof PROGRESS_TONE | 'auto';
  label?: string;
  className?: string;
}

/** Health/OEE style meter (0–100). */
export function ProgressBar({ value, tone = 'auto', label, className }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const resolved = tone === 'auto' ? progressTone(pct) : tone;
  return (
    <div
      className={cx('h-1.5 w-full overflow-hidden rounded-full bg-white/10', className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `Progress ${pct}%`}
    >
      <div className={cx('h-full rounded-full transition-[width] duration-500', PROGRESS_TONE[resolved])} style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ---------------- Search input ---------------- */

export interface SearchInputProps {
  value: string;
  onChange(value: string): void;
  placeholder?: string;
  /** Adds a clear button when there is text. */
  onClear?: () => void;
  className?: string;
  id?: string;
  'aria-label'?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search…', onClear, className, id, ...rest }: SearchInputProps) {
  return (
    <div className={cx('relative', className)}>
      <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        id={id}
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={rest['aria-label']}
        onChange={(e) => onChange(e.target.value)}
        className={cx(
          'field !min-h-[40px] !pl-9 !text-sm',
          '[&::-webkit-search-cancel-button]:hidden',
        )}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        >
          <Icon name="close" className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
