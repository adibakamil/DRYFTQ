# DRYFTQ — Web

Industrial process-drift intelligence: **marketing site + nine-module plant operations dashboard**, rebuilt as a single React application.

```
/                    → marketing site (hero, services, platform preview, contact)
/dashboard           → Plant overview          /reports      → Yield & performance audits
/analytics           → Drift & anomaly charts  /maintenance  → Work orders & scheduling
/machines            → Asset registry          /integrations → Connectors & webhooks
/alerts              → Incident feed           /team         → Roles & members
                                           /settings      → Profile & preferences
```

All console URLs are unchanged from the legacy site, so existing bookmarks keep working.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173  — Vite dev server with HMR
```

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server (port 5173) |
| `npm run build` | Type-check (`tsc -b`) + production bundle into `dist/` |
| `npm run preview` | Serve the production build (port 4173) |
| `npm run serve` | Zero-dependency static server for `dist/` with SPA fallback (port 8080) |
| `npm run typecheck` | TypeScript project build, no emit |
| `npm run lint` | ESLint (typescript-eslint + react-hooks) |
| `npm test` | Vitest unit tests (store/domain logic) |
| `npm run start:legacy` | Old static dashboard server (port 3000) — for comparison only |

## Architecture

```
src/
├─ main.tsx                 React root
├─ App.tsx                  Providers + route table (lazy per-module code splitting)
├─ index.css                Design tokens + component layer (Tailwind entry)
├─ app/
│  ├─ routes.ts             Single source of truth for module paths/titles/icons
│  └─ AppShell.tsx          Console chrome: sidebar, topbar, global search,
│                           notifications, operator pill, <Outlet/>
├─ components/
│  ├─ Icon.tsx              SVG icon set as typed React components
│  ├─ NotFound.tsx          Branded 404 (ported from the legacy server)
│  └─ ui/                   Kit: Button, Modal(+ConfirmDialog), Field/Input/Select/
│                           TextArea, Badge/StatusBadge, Table, Tabs, ToastHost,
│                           EmptyState, Spinner, ProgressBar, SearchInput
├─ store/
│  ├─ types.ts (lib/)       Domain model — mirrors the persisted schema
│  ├─ defaultState.ts       Seed data (identical to the legacy DEFAULT_STATE)
│  ├─ actions.ts            Pure domain operations: (state, …) → {state, notice?}
│  ├─ persistence.ts        localStorage load/save + legacy-state migration
│  ├─ context.ts            Typed context, `useStore` / `usePlantState` / `useActions`
│  └─ StoreProvider.tsx     Applies results atomically, persists, owns toasts
├─ features/landing/        Marketing site (sections, modals, hooks)
└─ pages/                   The nine console modules (one file each)
```

**State.** One typed `PlantState` (user, settings, machines, alerts, maintenance tasks, team, integrations, recent events) persisted under `dryftq_plant_operations_v2` — the same key the legacy build used, so saved operator data carries over and both builds can even stay in sync across tabs. Domain rules (alert → machine coupling, health boosts on completed work, id generation, validation) live in **pure functions** in `store/actions.ts`, which is what the unit tests exercise. Toasts are a side effect of applying an action result.

**Design system.** `src/index.css` keeps the original token sheet (`.btn`, `.card`, `.container-x`, `.field`, `.modal`…); Tailwind is compiled locally from `src/**` (no CDN). Brand colours, including the console's navy/orange palette, are in `tailwind.config.js`. Orange text-bearing surfaces use `--orange-action` (#CC4310) for WCAG AA contrast; motion honours `prefers-reduced-motion`.

**Accessibility.** Focus-trapped dialogs with scroll lock and focus restoration, `role="status"` live-region toasts, skip-to-content link, labelled icon buttons, real semantic tables, `aria-pressed`/`aria-selected` on all toggles.

## Migration notes

- The previous implementation (static HTML + `shared/dryftq-state.js` imperative DOM engine) is kept for reference:
  - `legacy/landing/` — original landing page (`index.html`, `main.js`, `styles.css`, `input.css`).
  - `DRYFTQ ALL DASHBOARD/` — original nine modules + their regression tests (`npm run start:legacy` still runs it).
- Behaviour ported 1:1 unless noted: the login form still simulates authentication, then routes into `/dashboard`; everything else (alert/maintenance/machine/team/integration rules, CSV export, search, notifications) follows the legacy semantics.
- Copy, section ids and clean URLs were preserved deliberately — tests, bookmarks and SEO anchors depend on them.
