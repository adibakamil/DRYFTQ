# Module migration contract

Every console module is migrated into **one page component** that follows these rules.
Read this file plus the referenced sources before writing code.

## Where things go

| Concern | Import from | Notes |
|---|---|---|
| State | `../../store/context` | `usePlantState()` → `PlantState`; `useActions()` → bound actions; `useStore()` → both + toasts |
| Actions | (via `useActions()`) | `acknowledgeAlert`, `resolveAlert`, `createMaintenanceTask`, `updateMaintenanceStatus`, `removeMaintenanceTask`, `addMachine`, `updateMachine`, `inviteTeamMember`, `removeTeamMember`, `updateTeamMemberRole`, `updateTeamMember`, `toggleIntegration`, `saveIntegrationConfig`, `updateUser`, `updateSettings`, `resetToDefaults` |
| UI kit | `../../components/ui` | `Button, Modal, ConfirmDialog, Field, TextInput, Select, TextArea, Badge, StatusBadge, statusTone, Table, Thead, Tr, Th, Td, EmptyState, Spinner, ProgressBar, SearchInput, Tabs` |
| Icons | `../../components/Icon` | `<Icon name="wrench" className="h-4 w-4" />` — names: grid, chart, machine, server, bars, bell, report, file, wrench, plug, users, cog, gear, search, plus, refresh, download, edit, trash, check, close, arrow, info, warn, clock, pulse, down, up, target, bolt, send, logout |
| Helpers | `../../lib/utils` | `cx, nextId, numOr, hasValue, averageHealth, computeOee, clockNow, dateNow, downloadCsv, matchesQuery` |
| Types | `../../lib/types` | `Machine, Alert, MaintenanceTask, TeamMember, Integration, PlantState, …` |

## Data rules (do NOT reimplement)

- Never mutate state yourself — call an action. If a behaviour you need is missing,
  implement it in `src/store/actions.ts` (pure function + test) instead of touching state in a page.
- Every action already emits its own toast; do not add "Saved" toasts on top.
- Validation errors come back as `error` toasts from the action (duplicate machine id, missing name/email…).

## Visual rules (dark console)

- Page background is provided by `AppShell` (`bg-brand-console` = #031B30). Do **not** render your own page background, sidebar, topbar, or footer — only the module's content.
- Cards: `console-card` (translucent border) or `console-card-solid` (#07243E). Labels: `console-label`.
- Headings: page `<h1>` is already rendered by the shell top bar. Inside the page start with an `<h2 className="text-lg font-bold text-white">` section heading or a toolbar.
- Text colours: headings `text-white`, body `text-slate-300`, muted `text-slate-400`.
- Tables: `<Table tone="dark">` + `Thead/Th/Td tone="dark"` — borders use #0d3459 automatically. Wrap headers in `<Thead tone="dark">`.
- Status/severity: always `<StatusBadge value={row.status} dark />` (colour mapping already canonical).
- Buttons: `Button variant="primary"` renders #CC4310 (AA-contrast). For the console accent #FF3D0A use
  `className="btn btn-sm rounded-lg bg-[#FF3D0A] text-white hover:bg-[#e03405]"` on `<Button>`/`<button>`.
  Secondary on dark: `className="btn btn-sm rounded-lg bg-white/10 text-white hover:bg-white/20"`.
- Modals: `<Modal tone="dark" panelClassName="!bg-[#07243e]" size="…">` and put a close affordance only if `hideClose` (the shell modal already renders the corner close).
- Charts: inline SVG (preserve the legacy paths/labels) or CSS bars — no chart library.
- Empty states: `<EmptyState tone="dark" …>` with the copy from the legacy page.

## Behaviour rules

- Filters/search: local `useState`, derive with `useMemo`. Use `matchesQuery(q, a, b, c)` for text matching.
- Filtering must preserve `0` values — use `hasValue()`, never truthiness, for numeric fields.
- Destructive actions (remove member, delete task, reset data) require `<ConfirmDialog>`.
- Modals close on Esc/backdrop automatically; manage `open` with `useState`.
- After mutations that depend on ids, compute from state returned by `usePlantState()` (no stale closures: read state inside the handler).
- Keep every string/copy/aria-label from the legacy page unless it contradicts honesty rules (never claim an email was sent or a connection verified when it wasn't — the legacy audit already fixed those strings; keep them fixed).

## Structure

```tsx
export default function MachinesPage() {
  const state = usePlantState();
  const actions = useActions();
  // local UI state (filters, modal open flags, form drafts)
  return ( … );
}
```

- One default-exported component matching the file name (`MachinesPage.tsx` → `MachinesPage`).
- Split large sections into local subcomponents **in the same file** (or a `features/<module>/` folder if > ~400 lines).
- TypeScript strict: no `any`, no `@ts-ignore`, no `dangerouslySetInnerHTML`. Non-null assertions only where the data shape guarantees it (e.g. `.find()!` after an existence check).
- `noUnusedLocals` is on — remove unused imports.
- Verify with `npm.cmd run typecheck` from the project root; only fix errors in your own file(s) and report any that are not yours.
