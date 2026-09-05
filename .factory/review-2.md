# Focus Lens review 2 — Keep keyboard focus visible

- Verdict: **PASS**
- Candidate implementation: `b77546943dd0d92d58a8e702a622cf05011442e9`
- Documentation baseline: `e31f02bc4435be65d0e240c27ea6c880879adbed`
- Live URL: https://focus-lens.sociobot.in
- Reviewed: 2026-09-05
- Review work order: `focus-lens-review-2`

## Result

**PASS.** There are zero findings at every severity and zero untested public claims. Product code was not modified.

The candidate is `b775469`. The later baseline commit `e31f02b` changes only verification documentation and evidence; it contains no product implementation change. Fresh rebuilt JS, CSS, and hero-image SHA-256 values matched the live deployment exactly.

## First read and demo

I opened the live site in fresh desktop (1440 × 900) and phone (390 × 664 CSS px) browser contexts before scrolling.

- Job: **Keep your place in dense web apps.**
- Audience: **low-vision workers who lose keyboard focus in complex browser tools.**
- First action: **Try it with sample data.** Its adjacent text says it opens an isolated demo that cannot change extension data.

At desktop all three facts are above the fold: settings stay in Chrome, no account is needed, and Focus Lens is free. The phone first screen shows the same action and facts without horizontal overflow.

The one-click `/?demo=1` sandbox has the persistent **Demo — sample data, nothing is saved** label, **Reset demo**, and **Install Focus Lens**. The initial phone demo shows the populated Atlas case desk, selected `renewal` search control, coral focus rail, and reading lane. The full sample contains three named access cases and an operational **Open Morgan Lee** record path. I exercised normal controls, sample site changes, focus rail and lane controls, named waypoints, shortcut export, invalid empty waypoint recovery, record close/recovery, reset, and a real-data sentinel. Reset removed only `demo:focus-lens:settings`; it retained the real sentinel. No post-load request or console/page error occurred during this flow.

## Claims

Every exact command declared in `.factory/claims.json` was run independently after `npm ci`. Each passed. `npm run test:clean-claims` then reran all 13 from a newly cloned temporary checkout before any manual build and ended with `All claims passed from a clean clone before any manual build.`

| Claim | Result |
| --- | --- |
| `visible-focus` | PASS — rail, pale halo, and contrast boundaries |
| `reading-lane` | PASS — show and hide behavior |
| `site-view` | PASS — separate Atlas and Ledger settings survive reload |
| `named-waypoints` | PASS — exact stored controls survive remove, reorder, reload |
| `shortcut-export` | PASS — complete text download |
| `demo-isolation` | PASS — isolated key and reset boundary |
| `no-egress` | PASS — no requests after local files load |
| `no-page-text-capture` | PASS — name and structural location only |
| `exact-permissions` | PASS — `activeTab`, `scripting`, `storage`; no hosts |
| `no-account-free` | PASS — no account, payment, or checkout required |
| `install-package` | PASS — public and ZIP install guidance |
| `extension-storage` | PASS — packaged extension writes per-site Chrome storage |
| `keyboard-commands` | PASS — all four commands and 80–200% bounds |

The public landing page, demo, install page, privacy page, terms, README, and popup were cross-checked against the registry. Each material public statement maps to one registered claim; each registered claim has exactly one tagged test. No unlisted or untested claim remains.

## Quality and live checks

- `npm ci`: PASS — 0 vulnerabilities reported on install.
- `npm test`: PASS — 11 unit/regression tests and 22 Playwright tests.
- `npx tsc --noEmit`: PASS.
- `npm run build`: PASS — built `dist/site`, `dist/extension`, and download ZIP.
- `npm audit --audit-level=low`: PASS — 0 vulnerabilities.
- `unzip -t dist/site/downloads/focus-lens-chrome.zip`: PASS.
- Production suite: `PLAYWRIGHT_BASE_URL=https://focus-lens.sociobot.in npx playwright test tests/e2e/site.spec.ts`: PASS — 19 tests.
- `/opt/fleet/lib/verify-url.sh https://focus-lens.sociobot.in /tmp/focus-lens-verify-url`: PASS — title, `lang=en`, one `h1`, `main`, image alts, named buttons, and zero console errors.
- Live Lighthouse 13.0.1 mobile retry: PASS — Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.8 s, LCP 1.1 s, TBT 40 ms, CLS 0.

The fresh live suite includes Axe checks with no serious or critical violations for home, demo, install, privacy, terms, and 404. It also verifies keyboard focus/announcement after How it works navigation, 390 px layout, 200% text, 44 px targets, reduced motion, route-specific metadata, and the complete designed 404. Direct checks confirmed `/`, `/demo`, `/install`, `/privacy`, `/terms`, `robots.txt`, and `sitemap.xml` return 200; an unknown route returns the designed shell with deliberate HTTP 404. CSP, `nosniff`, and referrer-policy headers are present. Hashed live JS/CSS cache immutably. The site has no backend, account, payment, API, offline, or update promise; backend rate-limit, tenant, restart, and health checks are not applicable.

## Earlier findings disposition

All earlier review and verification findings are resolved and were retested:

- Verification 1 clean-command/cache findings: clean-clone commands pass; live hashed assets use immutable one-year caching.
- Verification 2 keyboard-focus, claim-registration, 404-status, and touch-target findings: visible contrast-option focus, complete claims registry, true designed 404, and mobile target suite pass.
- Review 1 `F-1-1` through `F-1-16`: populated mobile demo, exact waypoint selectors, independent per-site settings, contrast proof, extension storage and command harnesses, installation instructions, live sample actions, complete 404, metadata, desktop facts, and route focus are present and pass their tests.
- Review 1 `F-1-17` through `F-1-27`: vague/metaphorical wording, terminology, title/caption, README sentence length, and footer provenance issues are removed or rewritten in the current public copy.
- Review 1 `F-1-28` and `F-1-29`: rail-width/color controls are in the demo and `site-view` coverage; untestable shortcut-conflict/reassignment promises are absent.

## Findings

- Critical: none.
- High: none.
- Medium: none.
- Low: none.
- Untested claims: none.

## Release decision

**PASS for release.**
