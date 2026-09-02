# Independent verification 4 — PASS

- Candidate: `b77546943dd0d92d58a8e702a622cf05011442e9`
- URL: https://focus-lens.sociobot.in
- Verified: 2026-09-02
- Work order: `focus-lens-verify-4`

## Verdict

**PASS.** All 13 declared claims pass from a clean clone, all local quality gates pass, the packaged browser extension works through its production harness, and the live site and downloadable extension match the candidate. No critical, high, medium, or low release defect was found.

## Mandatory first read

The cold first screen passes on desktop and at 390 px. **Keep your place in dense web apps** says what the product does. The next sentence identifies low-vision workers who lose keyboard focus in complex browser tools. **Try it with sample data** is visible without scrolling, and adjacent copy explains that it opens an isolated demo that cannot change extension data.

The action opens `/?demo=1` in one click. Its first phone screen already shows Morgan Lee's sample case, the 6 px coral focus rail, and the reading lane. The persistent banner says that sample data is not saved and provides **Reset demo** plus **Install Focus Lens**, the concrete path to start for real.

Evidence: [desktop first read](verification-4-artifacts/first-read-desktop.png) and [390 px demo](verification-4-artifacts/live-demo-mobile-390.png).

## Claims gate

After `npm ci`, I ran every exact command in `.factory/claims.json` independently before the general QA pass. All exited 0. `npm run test:clean-claims` later repeated the same 13 commands after cloning the tracked candidate into a new temporary directory and installing from the lockfile; it also passed before any manual build.

| Claim | Exact command | Result and evidence |
| --- | --- | --- |
| `visible-focus` | `npm test -- --grep @claim:visible-focus` | PASS — measured 6 px coral rail, pale halo, and representative 3:1 boundaries. |
| `reading-lane` | `npm test -- --grep @claim:reading-lane` | PASS — lane shows and hides. |
| `site-view` | `npm test -- --grep @claim:site-view` | PASS — Atlas and Ledger retain separate zoom, contrast, width, and color values after reload. |
| `named-waypoints` | `npm test -- --grep @claim:named-waypoints` | PASS — two stored selectors reopen the intended controls after removal, reorder, and reload. |
| `shortcut-export` | `npm test -- --grep @claim:shortcut-export` | PASS — `focus-lens-shortcuts.txt` contains all four shortcuts. |
| `demo-isolation` | `npm test -- --grep @claim:demo-isolation` | PASS — only `demo:focus-lens:settings` is removed; an unrelated real-data sentinel remains. |
| `no-egress` | `npm test -- --grep @claim:no-egress` | PASS — control, waypoint, and export actions issue zero post-load requests. |
| `no-page-text-capture` | `npm test -- --grep @claim:no-page-text-capture` | PASS — storage contains the user name and selector, not sample or entered page text. |
| `exact-permissions` | `npm test -- --grep @claim:exact-permissions` | PASS — build and ZIP request only `activeTab`, `scripting`, and `storage`, with no host permissions. |
| `no-account-free` | `npm test -- --grep @claim:no-account-free` | PASS — controls and ZIP are available without account or payment UI. |
| `install-package` | `npm test -- --grep @claim:install-package` | PASS — `/install` and packaged `INSTALL.txt` explain Developer mode and Load unpacked. |
| `extension-storage` | `npm test -- --grep @claim:extension-storage` | PASS — the real packaged popup writes complete per-origin settings and a structural waypoint to `chrome.storage.local`. |
| `keyboard-commands` | `npm test -- --grep @claim:keyboard-commands` | PASS — all commands alter the real page agent and enforce 80–200% extension zoom bounds. |

The landing page, demo, install, privacy, terms, extension panel, shortcut sheet, and README were cross-checked against the registry. No material unlisted public claim was found.

## Local candidate gates

- `npm ci`: PASS; 178 packages installed from the lockfile.
- `npm audit --audit-level=low`: PASS; 0 vulnerabilities.
- `npm test`: PASS; 11 Vitest unit/regression checks and 22 Playwright checks.
- `npx tsc --noEmit`: PASS. No lint script exists.
- `npm run build`: PASS; produced `dist/site`, route documents, `dist/extension`, and the public ZIP.
- `npm run test:clean-claims`: PASS; all 13 exact claim commands from its fresh clone.
- `unzip -t dist/site/downloads/focus-lens-chrome.zip`: PASS.
- Output sizes: JavaScript 21,431 B raw / 6,897 B gzip; CSS 15,541 B raw / 4,360 B gzip; hero WebP 38,506 B. All are below the factory budgets.

## End-to-end and recovery exercise

In fresh live browser contexts I exercised normal, boundary, invalid, and recovery paths:

- changed demo zoom through 80–160%, selected Dim contrast, toggled the focus rail and reading lane, and changed per-site rail settings;
- filtered sample cases, opened and closed Morgan Lee's record, saved/opened/removed exact-control waypoints, exported the shortcut file, reloaded, and reset;
- submitted an empty waypoint name and observed the announced recovery message, `aria-invalid=true`, and focus returned to the input;
- confirmed the 40-character maximum and that HTML-like input renders as text without creating markup;
- confirmed reload retains the demo key and a separate sentinel, while Reset removes only the demo key and restores defaults;
- loaded the packaged MV3 extension in a fresh Chromium profile. Its service worker started, its manifest matched the package, and an unsupported `chrome://` tab produced a clear error while disabling all 11 controls;
- the committed extension harness separately drove the built popup against a real HTTP tab, inspected real Chrome storage, opened the stored selector, ran all commands, and tested the production page agent.

## Accessibility and responsive behavior

- Axe found zero serious or critical violations on `/`, `/demo`, `/install`, `/privacy`, `/terms`, the designed 404, and the packaged popup.
- Each route has `lang="en"`, one `h1`, one `main`, ordered landmarks, route metadata, and no normal-size horizontal overflow.
- Keyboard-only traversal reaches the demo controls without a trap. Focused elements use a visible 4 px coral outline; the sample focus rail is 6 px with a pale halo. The opacity-zero contrast radio exposes its focus on the visible label.
- At 390 px, targets remain at least 44 px. At 200% text, content and controls remain available with no page-level horizontal overflow. Evidence: [200% text capture](verification-4-artifacts/live-demo-mobile-200.png).
- With reduced motion, the lane transition computes to `0.01ms` and page scroll behavior is `auto`.
- `/opt/fleet/lib/verify-url.sh` passes with zero console errors, one heading, one main landmark, named buttons, and complete image alt text. Evidence: [URL verifier report](verification-4-artifacts/verify-url-live/verify.json).

## Privacy, security, routing, and performance

- The live cold request log uses only `https://focus-lens.sociobot.in`. The exercised demo actions make zero requests after local files load. Source and built-output review found no analytics, telemetry, remote model call, runtime third-party script/font, or embedded secret.
- Demo data uses only `demo:focus-lens:settings`; extension data uses per-origin Chrome storage keys. Stored waypoint tests exclude page text.
- Live HTML responses include CSP with `frame-ancestors 'none'`, HSTS, `nosniff`, strict-origin referrer policy, and restrictive camera/microphone/geolocation policy.
- HTML uses a 30-second revalidating cache. Hashed JavaScript, CSS, images, and the ZIP use `public, max-age=31536000, immutable`.
- `/`, `/demo`, `/install`, `/privacy`, and `/terms` return 200. An unknown route returns the designed shell with HTTP 404. All discovered internal links and the public factory link return 200; fragment and email links were checked structurally.
- Lighthouse 13.0.1 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 820 ms, LCP 1,069 ms, TBT 17 ms, CLS 0, total transfer 51,751 B. Evidence: [Lighthouse JSON](verification-4-artifacts/lighthouse-live.json).
- Regular routes and the complete interaction flow produced zero console or page errors.

## Deployment identity and applicability

Fresh local `index.html`, the hashed JavaScript and CSS, and the hero image match production byte-for-byte by SHA-256. The ZIP container differs only because archive timestamps are regenerated; every extracted live file matches `dist/extension` byte-for-byte. The deployed product is therefore candidate `b77546943dd0d92d58a8e702a622cf05011442e9`, not stale output.

This is a static site plus a local browser extension. It has no server-side product endpoint, sign-in, payment, AI feature, service worker, or PWA claim. API rate-limit, Entra tenant, backend concurrency/persistence, and offline-update checks are not applicable.

## Findings by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none.

## Release decision

**PASS for release.** Product code was not modified during verification.
