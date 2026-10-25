# DRYFTQ Industrial OS — Plant Operations Dashboard

Nine connected dashboard modules served by a zero-dependency Node.js HTTP server.
No build step, no framework, no `npm install` required.

---

## Quick start

```bash
node server.js
```

Then open **http://localhost:3000**

On Windows PowerShell, `npm` is a `.ps1` script and may be blocked by execution
policy — use `npm.cmd` instead:

```powershell
npm.cmd start     # same as: node server.js
```

If port 3000 is already taken, the server prints how to move it:

```powershell
$env:PORT = 3001; node server.js
```

---

## Arriving from the landing page

The marketing site at the repository root (`../index.html`) links straight into
this folder: the hero **Explore Platform** button opens
`DRYFTQ ALL DASHBOARD/index.html`, which forwards to the primary dashboard.
The hand-off works in every hosting mode, because each one targets what that
host can actually serve:

| Landing page is running… | Explore Platform lands on |
|---|---|
| from disk (`double-click index.html`) | `DRYFTQ DASHBOARD 1/code.html` (`file://`) |
| a plain static host (`npm run serve`) | `DRYFTQ ALL DASHBOARD/DRYFTQ DASHBOARD 1/code.html` |
| this server (`node server.js`, `/index.html`) | `302` → `/dashboard` (clean route) |

Inside a module, links switch mode automatically: on a clean route they stay
clean (`/alerts`), otherwise they resolve to real folder paths
(`../DRYFTQ DASHOARD 4(ALERT)/code.html`). The rule lives in
`usesFolderUrls()` in [`shared/dryftq-state.js`](shared/dryftq-state.js) — no
network probe, no request that could 404.

---

## Routes

| URL | Module |
|-----|--------|
| `/` or `/dashboard` | Dashboard |
| `/analytics` | Analytics |
| `/machines` | Machines |
| `/alerts` | Alerts |
| `/reports` | Reports |
| `/maintenance` | Maintenance |
| `/integrations` | Integrations |
| `/team` | Team Management |
| `/settings` | Settings & Profile |

Routing is **case-insensitive** (`/Dashboard`, `/SETTINGS` → 200), trailing
slashes are tolerated, and unknown URLs return a real **404** with a branded
"Return to Dashboard" control — they are *not* redirected to the dashboard.

Route definitions live in one place: [`shared/dryftq-routes.js`](shared/dryftq-routes.js).
`server.js` consumes it directly, and `shared/dryftq-state.js` mirrors it for the
client, so the sidebar and the server can never disagree about a path.

---

## Two ways to run

### 1. Served (recommended)

```bash
node server.js          # open http://localhost:3000
```

Links use clean routes (`/alerts?tab=critical`).

### 2. Opened straight from disk

Double-click `index.html` or any `code.html`. The shared engine detects the
`file:` protocol and rewrites every link to a real folder path
(`../DRYFTQ DASHOARD 4(ALERT)/code.html`) so navigation still works offline
with no server.

---

## Verification

```bash
node verify_all.js      # or: npm.cmd run verify
```

`verify_all.js` boots the server if it is not already running, then asserts:

- the shared engine evaluates without throwing and exposes the full `Dryftq` API
- all 9 routes return 200 with complete documents and navigation markup
- **every** local `href`/`src` on every page resolves to 200
- every inline `<script>` parses as valid JavaScript
- each page initialises its own page key (active sidebar state)
- `file://` mode produces correct relative paths from a module folder and from root
- the profile picture (`/mine.jpg`) is served as an image and referenced by Settings
- profile name/picture defaults, legacy-state migration, and that a customised
  profile is never overwritten
- unknown URLs return a real 404 (not a redirect) with working recovery controls
- case-variant URLs still resolve

Test suites:

```bash
node static_audit.js        # HTML link + syntax audit across all 10 documents
node test_state_logic.js    # state machine & business workflows
node test_dom_simulation.js # DOM / interactive lifecycle
node test_regressions.js    # regression tests for audited defects (escaping, unique ids, zero values)
node test_all_modules.js    # route + asset HTTP checks (server must be running)
node verify_all.js          # full end-to-end pass (starts server if needed)

npm.cmd test                # runs the first four in sequence
npm.cmd run test:all        # everything
```

Current status: **123/123 checks passing**
(79 end-to-end + 10 static audit + 8 state + 8 DOM + 12 route/asset + 6 regression).

---

## Project layout

```
server.js                     HTTP server, routing, 404 page
shared/dryftq-routes.js       Single source of truth for all routes
shared/dryftq-state.js        Shared client state, navigation, toasts, sidebar
shared/dryftq-common.css      Shared styles
index.html                    Entry point -> forwards to Dashboard
                               (server.js answers it with 302 -> /dashboard)
DRYFTQ DASHBOARD 1/           Dashboard
DRYFTQ DASHBOARD 2 (ANALYTICS)/
DRYFTQ DASHBOARD 3(MACHINES)/
DRYFTQ DASHOARD 4(ALERT)/     (folder name intentionally as-is)
DRYFTQ DASHBOARD 5 (REPORT)/
DRYFTQ DASHBOARD 6 (MAINTENANCE)/
DRYFTQ DASHBOARD 7(INTEGRATIONS)/
DRYFTQ DASHBOARD 8(TEAM MANAGEMENT)/
DRYFTQ DASHBOARD 9(SETTING)/
```

> The `DASHOARD` spelling in folder 4 is intentional and consistent across the
> server, the client engine, and every sidebar link. Renaming it would break
> existing links and bookmarks for no functional gain.

---

## Known limitations

There is no backend API — this is a front-end platform only.

- **Persistence is browser-local.** All data lives in `localStorage` under
  `dryftq_plant_operations_v2`. Different browsers or cleared storage reset to
  the seeded demo state.
- **Integrations "Test Connection" is simulated** on the client. No outbound
  request is made, so it must not be read as a real handshake result.
- **Invitations, password changes, and role edits** validate and persist locally
  but are not transmitted anywhere.
- **Tailwind is loaded from the CDN** (`cdn.tailwindcss.com`). Pages need
  network access the first time they render; without it the layout falls back to
  unstyled HTML.
- **No authentication.** The profile shown is seeded demo data.
