import type { ReactNode } from 'react';

/**
 * Provider marks ported verbatim from the legacy `logos` map
 * (`code.html` — same paths, viewBoxes, colours and `h-10` / `h-11` sizes).
 * Decorative only: the card text already names the provider.
 */
const LOGOS: Record<string, ReactNode> = {
  aws: (
    <svg className="h-10 w-auto" fill="none" viewBox="0 0 100 60" aria-hidden="true">
      <path
        /* AWS dark wordmark for the light console card (their standard
           light-background lockup); the orange smile stays #FF9900. */
        fill="#232F3E"
        d="M26.2 31.6c-.7.5-1.7.8-2.9.8-3.2 0-4.6-2-4.6-5 0-3.3 1.9-5.4 4.8-5.4 1.2 0 2 .3 2.7.8v8.8zm5.7-14.7h-5.4v2.9c-1.3-2-3.6-3.4-6.4-3.4-5.8 0-9.8 4.5-9.8 11.2 0 6.6 3.8 11 9.8 11 2.8 0 5.1-1.3 6.4-3.3v2.8h5.4V16.9zm13.1 21.6l-5.6-21.6h5.8l3.1 14.6 3.4-14.6h5.1l3.4 14.7 3.2-14.7h5.6L57.7 38.5h-5.6l-3.3-13.8-3.3 13.8h-1.4z"
      />
      <path
        fill="#FF9900"
        d="M78.6 44.2C62.7 54.3 36.1 55.4 13.5 44.5c-.3-.2-.7.1-.4.5 4.6 5.6 14.4 11.2 28.5 11.2 15.3 0 27.5-6.2 37.5-11.4.5-.3.1-.9-.5-.6z"
      />
    </svg>
  ),
  azure: (
    <svg className="h-10 w-auto" fill="none" viewBox="0 0 96 96" aria-hidden="true">
      <path d="M54.5 8L17 76.5h27.8l9.7-18.6L68.5 84H96L54.5 8z" fill="#007FFF" />
      <path d="M17 76.5L34.2 46 45 66.8 17 76.5z" fill="#005BA1" />
    </svg>
  ),
  influx: (
    <svg className="h-10 w-auto" fill="none" viewBox="0 0 100 100" aria-hidden="true">
      <path
        d="M50 8L14 28v44l36 20 36-20V28L50 8z"
        stroke="#0054F6"
        strokeLinejoin="round"
        strokeWidth="6.5"
      />
      <path
        d="M50 8v44M86 28L50 52M14 28l36 24M50 52v40"
        stroke="#0054F6"
        strokeLinejoin="round"
        strokeWidth="6.5"
      />
    </svg>
  ),
  slack: (
    <svg className="h-10 w-auto" fill="none" viewBox="0 0 120 120" aria-hidden="true">
      <path d="M25.6 74.4a12.4 12.4 0 01-12.4-12.4 12.4 12.4 0 0112.4-12.4h12.4v24.8H25.6z" fill="#E01E5A" />
      <path
        d="M50.4 74.4a12.4 12.4 0 0112.4-12.4 12.4 12.4 0 0112.4 12.4v31a12.4 12.4 0 01-12.4 12.4 12.4 12.4 0 01-12.4-12.4v-31z"
        fill="#E01E5A"
      />
      <path d="M45.6 25.6a12.4 12.4 0 0112.4-12.4 12.4 12.4 0 0112.4 12.4v12.4H45.6V25.6z" fill="#36C5F0" />
    </svg>
  ),
  datadog: (
    <svg className="h-11 w-auto" fill="none" viewBox="0 0 100 100" aria-hidden="true">
      <rect fill="#632CA6" height="70" rx="16" width="70" x="15" y="15" />
      <path
        d="M35 34c2 0 4 1 5 3l4 6h12l4-6c1-2 3-3 5-3 4 0 7 3 7 7 0 2-1 4-2 5l-2 3 5 5c2 2 3 4 3 7 0 5-4 9-9 9h-2l-3 4c-2 2-5 3-8 3s-6-1-8-3l-3-4h-2c-5 0-9-4-9-9 0-3 1-5 3-7l5-5-2-3c-1-1-2-3-2-5 0-4 3-7 7-7z"
        fill="none"
        stroke="white"
        strokeLinejoin="round"
        strokeWidth="3"
      />
    </svg>
  ),
  grafana: (
    <svg className="h-11 w-auto" fill="none" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" fill="#F46800" r="16" />
      <path
        d="M50 15c-19.3 0-35 15.7-35 35 0 8.3 2.9 16 7.8 22l5.6-4.2C24.8 62.7 22.5 56.6 22.5 50c0-15.2 12.3-27.5 27.5-27.5s27.5 12.3 27.5 27.5c0 14.8-11.7 26.8-26.3 27.4l.6 7.5C70.6 84.1 85 68.7 85 50c0-19.3-15.7-35-35-35z"
        fill="#FF9830"
      />
    </svg>
  ),
  gcp: (
    <svg className="h-10 w-auto" fill="none" viewBox="0 0 88 70" aria-hidden="true">
      <path
        d="M48.4 11.5c-8.4 0-15.7 4.8-19.3 11.9 2.9 2.5 5.2 5.7 6.6 9.4 2.6-4.5 7.4-7.5 12.8-7.5 8.1 0 14.7 6.6 14.7 14.7 0 .8-.1 1.6-.2 2.4 4.3 1.1 7.9 3.8 10.2 7.4 2-2.4 3.1-5.5 3.1-8.9-.1-10.7-9.2-19.4-20.2-19.4z"
        fill="#EA4335"
      />
      <path
        d="M68.4 62.9H21.7C10.5 62.9 1.4 53.8 1.4 42.6c0-9.6 6.7-17.7 15.7-19.8 1.7-2.8 3.9-5.2 6.5-7 1.8 3.7 2.6 7.8 2.3 12-2.8 1.6-4.9 4.3-5.8 7.5-1.1-.3-2.3-.5-3.5-.5-6.7 0-12.1 5.4-12.1 12.1 0 6.7 5.4 12.1 12.1 12.1h46.7c5.8 0 10.6-4.7 10.6-10.6 0-5.4-4.1-9.8-9.3-10.5-2.2-2.8-5.6-4.6-9.4-4.9.1-.4.1-.9.1-1.3 0-4.3-2.1-8.1-5.4-10.4 4.3 1.1 7.9 3.8 10.2 7.4 6.5 2.5 11 8.8 11 16.1 0 9.7-7.8 17.6-17.5 17.6z"
        fill="#34A853"
      />
    </svg>
  ),
  teams: (
    <svg className="h-10 w-auto" fill="none" viewBox="0 0 110 100" aria-hidden="true">
      <circle cx="76" cy="28" fill="#505AC9" r="14" />
      <path d="M60 48h32c6.6 0 12 5.4 12 12v12c0 2.2-1.8 4-4 4H60V48z" fill="#505AC9" />
      <circle cx="44" cy="32" fill="#7B83EB" r="17" />
      <rect fill="#4B53BC" height="42" rx="8" width="52" x="18" y="52" />
    </svg>
  ),
};

/** Legacy `${logos[i.id] || ''}` — unknown provider ids render nothing. */
export function ProviderLogo({ id }: { id: string }): ReactNode {
  return LOGOS[id] ?? null;
}
