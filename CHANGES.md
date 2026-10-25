# DRYFTQ — engineering audit change log

Scope: refinement only. Visual design, routes, copy and folder names of the nine dashboard modules are unchanged
(the README documents that routes/bookmarks depend on them), apart from the two honest-copy edits listed below.

## Fixed (each was reproduced before fixing)
| Area | Problem | Fix |
|---|---|---|
| Security | Stored XSS: team names/emails, maintenance tasks, machines, alerts, integrations and toasts were interpolated into `innerHTML` unescaped; payload persisted in localStorage and fired on page load (reproduced on `/team` and `/maintenance`). | Added `Dryftq.escapeHtml` and applied it to every state-derived `innerHTML` sink (engine + pages). Inline `onclick` in toast/notifications replaced with listeners. |
| Data integrity | Team/maintenance ids were `length + 1`; remove-then-invite produced a duplicate `TM-5`, so edit/remove could hit the wrong person. | `nextId()` uses max existing suffix. |
| Data integrity | `Number(x) \|\| default` turned a real `0` (temp, vibration, health) into 65 / 1.2 / 90. Machines table also showed `-` for 0. | `numOr()`; table checks for null/empty instead of truthiness. |
| Runtime | 5 of 9 dashboard pages threw `tailwind is not defined` whenever the Tailwind CDN was unreachable. | `window.tailwind` guarded before `tailwind.config`. |
| Runtime | `getQueryParams` could throw on malformed `%` sequences. | Uses `URLSearchParams`. |
| Accessibility | Toasts were silent to screen readers; dismiss button had no name; notifications dialog had no role/Esc. | `role="status" aria-live="polite"`, labelled buttons, `role="dialog"`, Esc to close. |
| Portability | `npm run serve` used `python`, which is absent on many macOS/Linux/Windows setups. | `scripts/serve.js` (zero-dependency, path-traversal safe). |
| Honest copy | Contact form claimed "A DRYFTQ systems architect will contact your team" though nothing is sent; team invite toast said "Invitation sent". | Now states demo mode / that no email is sent. |

## Added
`scripts/serve.js`, `DRYFTQ ALL DASHBOARD/test_regressions.js` (6 tests), root `npm test` / `npm run start:app`, `.gitignore`.

## Not changed / not verified (read this)
- **Dashboard visuals were not verified.** The nine dashboard pages load Tailwind from `cdn.tailwindcss.com` (with the `forms` and `container-queries` plugins). The build sandbox had no network, so those pages could only be tested for behaviour, console errors and logic — not rendered pixel-for-pixel or at responsive sizes. Please eyeball them online.
- Tailwind was **not** moved to a local build: the forms plugin was unavailable offline, and a build without it can subtly change input styling. Recommended follow-up once you have network access.
- Folder names were **not** renamed or flattened (spaces, `DASHOARD` spelling): routes, file:// navigation and several tests depend on them. Safe to do later with a scripted rename + updating `shared/dryftq-routes.js`, `shared/dryftq-state.js`, `static_audit.js`, `verify_all.js`.
- Integration "Test Connection" remains simulated (already documented). Remaining integration-modal fields (endpoint, key) are still interpolated unescaped in a few modal spots not reachable from user input in the current UI; worth a pass if you add editing.
- No animation changes: the landing page already has reveal/hero/hover motion with `prefers-reduced-motion` support; no changes made.
- Footer text links are ~20px tall (below the 24px WCAG 2.2 target-size guidance); left untouched to avoid shifting your spacing.
