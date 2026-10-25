import type { ReactNode } from 'react';
import { cx } from '../lib/utils';

/**
 * SVG icon set rendered as React nodes (ported from the legacy inline sprite).
 * Paths are stroke-based unless noted, so `className="icon"` styles them.
 */
const PATHS: Record<string, ReactNode> = {
  // Marketing
  pulse: <path d="M3 12h3l3-7 4 14 3-7h5" />,
  brain: (
    <path d="M9.5 2A3.5 3.5 0 006 5.5v1A3.5 3.5 0 004 10v.5a3.5 3.5 0 002 3.16V14a3.5 3.5 0 003.5 3.5M14.5 2A3.5 3.5 0 0118 5.5v1a3.5 3.5 0 012 3.5v.5a3.5 3.5 0 01-2 3.16V14a3.5 3.5 0 01-3.5 3.5M12 2v19M6 10h6M6 14h6m2-4h6m-6 4h6" />
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </>
  ),
  bolt: <path d="M13 10V3L4 14h7v7l9-11h-7z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  trend: (
    <>
      <path d="M3 3v18h18M18 9l-5 5-4-4-5 5" />
      <path d="M14 9h4v4" />
    </>
  ),
  car: (
    <path d="M5 11l2-5h10l2 5M4 11h16a1 1 0 011 1v5a1 1 0 01-1 1h-1a2 2 0 11-4 0H9a2 2 0 11-4 0H4a1 1 0 01-1-1v-5a1 1 0 011-1z" />
  ),
  chip: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <path d="M9 1v3m6-3v3M9 20v3m6-3v3M1 9h3m-3 6h3M20 9h3m-3 6h3" />
    </>
  ),
  pill: <path d="M10.5 5.5l8 8a4.95 4.95 0 11-7 7l-8-8a4.95 4.95 0 017-7zM7.5 12.5l9-9" />,
  factory: (
    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5" />
  ),
  down: <path d="M19 14l-7 7-7-7m7 7V3" />,
  up: <path d="M5 10l7-7 7 7m-7-7v18" />,
  trash: (
    <path d="M19 7l-.87 12.14A2 2 0 0116.14 21H7.86a2 2 0 01-2-1.86L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  ),
  arrow: <path d="M5 12h14m-6-6l6 6-6 6" />,
  play: <path d="M8 5v14l11-7z" fill="currentColor" stroke="none" />,
  check: <path d="M5 13l4 4L19 7" strokeWidth={3} />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  close: <path d="M6 18L18 6M6 6l12 12" />,
  linkedin: (
    <path
      d="M19 0H5a5 5 0 00-5 5v14a5 5 0 005 5h14a5 5 0 005-5V5a5 5 0 00-5-5zM8 19H5V8h3v11zM6.5 6.73a1.76 1.76 0 110-3.53 1.76 1.76 0 010 3.53zM20 19h-3v-5.6c0-3.37-4-3.11-4 0V19h-3V8h3v1.77c1.4-2.59 7-2.78 7 2.48V19z"
      fill="currentColor"
      stroke="none"
    />
  ),
  x: (
    <path
      d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23zm-1.16 17.52h1.83L7.08 4.13H5.12z"
      fill="currentColor"
      stroke="none"
    />
  ),
  youtube: (
    <path
      d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 00.5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 002.12 2.14c1.87.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 002.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z"
      fill="currentColor"
      stroke="none"
    />
  ),

  // Console (sidebar + dashboard modules)
  grid: (
    <>
      <rect x="4" y="4" width="6" height="6" rx="1.5" />
      <rect x="14" y="4" width="6" height="6" rx="1.5" />
      <rect x="4" y="14" width="6" height="6" rx="1.5" />
      <rect x="14" y="14" width="6" height="6" rx="1.5" />
    </>
  ),
  chart: <path d="M4 20V10m6 10V4m6 16v-7m4 7H2" />,
  machine: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="16" cy="8" r="1.5" />
      <path d="M7 16h10" />
    </>
  ),
  server: (
    <>
      <rect x="2" y="3" width="20" height="8" rx="2" />
      <rect x="2" y="13" width="20" height="8" rx="2" />
      <path d="M6 7h.01M6 17h.01" />
    </>
  ),
  bars: <path d="M5 21V11M12 21V4m7 17v-7" />,
  bell: (
    <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.16V11a6 6 0 00-4-5.66V5a2 2 0 10-4 0v.34C7.67 6.17 6 8.39 6 11v3.16c0 .54-.21 1.05-.6 1.44L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  ),
  report: (
    <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.59a1 1 0 01.7.3l5.42 5.4a1 1 0 01.29.7V19a2 2 0 01-2 2z" />
  ),
  file: (
    <>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6M9 13h6M9 17h6" />
    </>
  ),
  wrench: <path d="M14.7 6.3a4 4 0 105.3 5.3l-9 9a2.8 2.8 0 01-4-4l9-9a4 4 0 01-1.3-1.3z" />,
  plug: (
    <path d="M9 2v6m6-6v6M7 8h10v3a5 5 0 01-5 5 5 5 0 01-5-5V8zm5 8v6" />
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </>
  ),
  cog: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1.08-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9l2.1 2.1m10 10l2.1 2.1m0-14.2L17 7M7 17l-2.1 2.1" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  refresh: <path d="M21 12a9 9 0 11-3-6.7M21 4v5h-5" />,
  download: <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5 5 5-5m-5 5V3" />,
  edit: <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4z" />,
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </>
  ),
  warn: (
    <>
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <path d="M12 9v4M12 17h.01" />
    </>
  ),
  logout: <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m7 14l5-5-5-5m5 5H9" />,
  send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />,
};

export type IconName = keyof typeof PATHS;

export interface IconProps {
  name: IconName;
  className?: string;
  /** Filled icons (social marks, play) opt out of the stroke style. */
  filled?: boolean;
  strokeWidth?: number;
  'aria-label'?: string;
}

export function Icon({ name, className, filled, strokeWidth = 2, ...rest }: IconProps) {
  const filledIcon = filled ?? ['linkedin', 'x', 'youtube', 'play'].includes(name);
  return (
    <svg
      className={cx('icon', className)}
      viewBox="0 0 24 24"
      fill={filledIcon ? 'currentColor' : 'none'}
      stroke={filledIcon ? 'none' : 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={rest['aria-label'] ? undefined : true}
      role={rest['aria-label'] ? 'img' : undefined}
      {...(rest['aria-label'] ? { 'aria-label': rest['aria-label'] } : {})}
    >
      {PATHS[name]}
    </svg>
  );
}
