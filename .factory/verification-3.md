# Independent verification 3 — PASS

- Candidate: `40e564d136bb72b5baf47f9dd3fdb81b62d4a7ff`
- URL: https://focus-lens.sociobot.in
- Verified: 2026-09-02
- Work order: `focus-lens-verify-3`

## Verdict

**PASS.** All ten declared claims pass from a clean clone, the complete local suite and production build pass, the deployed site and extension package match the candidate, and the previous accessibility, claim-coverage, touch-target, cache, and 404 defects are repaired. No critical, high, or medium product defect was found.

## Mandatory first read

The cold first screen passes on desktop and at 390 px. It says what the product does — **“Keep your place in dense web apps”** — and identifies **low-vision workers who lose keyboard focus in complex browser tools**. The first primary action is **Try it with sample data**, with adjacent copy explaining that it opens a safe sample workspace. It opens `/demo` in one click without setup or sign-in.

Evidence: [desktop first read](verification-artifacts/verification-3-live-first-read-desktop.png) and [390 px first read](verification-artifacts/verification-3-live-first-read-mobile-390.png).

## Claim gate

I started from the clean candidate checkout, ran `npm ci`, and then ran every exact command in `.factory/claims.json` independently before the general QA pass. All exited 0. `npm run test:clean-claims` later repeated all ten commands from its own fresh temporary clone and also passed.

| Claim | Exact command | Result and observed evidence |
| --- | --- | --- |
| `visible-focus` | `npm test -- --grep @claim:visible-focus` | PASS — focused sample control has a 6 px coral rail and white halo. |
| `reading-lane` | `npm test -- --grep @claim:reading-lane` | PASS — the reading lane shows and hides. |
| `site-view` | `npm test -- --grep @claim:site-view` | PASS — zoom and contrast survive reload in the demo namespace. |
| `named-waypoints` | `npm test -- --grep @claim:named-waypoints` | PASS — a named waypoint moves focus to the sample control. |
| `shortcut-export` | `npm test -- --grep @claim:shortcut-export` | PASS — `focus-lens-shortcuts.txt` downloads with the four documented shortcuts. |
| `local-private` | `npm test -- --grep @claim:local-private` | PASS — only `demo:focus-lens:settings` is written, and Reset demo removes it. |
| `no-egress` | `npm test -- --grep @claim:no-egress` | PASS — the complete post-load control flow issued zero network requests. |
| `no-page-text-capture` | `npm test -- --grep @claim:no-page-text-capture` | PASS — stored waypoint data contains the entered name and structural selector, not page text. |
| `exact-permissions` | `npm test -- --grep @claim:exact-permissions` | PASS — the production manifest and ZIP request only `activeTab`, `scripting`, and `storage`, with no host permissions. |
| `no-account-free` | `npm test -- --grep @claim:no-account-free` | PASS — the full demo and extension ZIP are available without account or payment gates. |

The landing page, privacy page, terms page, extension panel, and README were cross-checked against the registry. No material unlisted public claim was found.

## Local candidate gates

- `npm ci`: PASS.
- `npm test`: PASS — 10 Vitest unit/regression tests and 15 Chromium tests.
- `npx tsc --noEmit`: PASS.
- `npm run build`: PASS — produced `dist/site`, `dist/extension`, and the extension ZIP.
- `npm run test:clean-claims`: PASS — all ten claim commands in a newly cloned temporary checkout.
- `npm audit --omit=dev --audit-level=high`: PASS — zero production vulnerabilities.
- No lint script is provided.
- `unzip -t dist/site/downloads/focus-lens-chrome.zip`: PASS.

Production sizes are 14,342 B JavaScript (5.08 KB gzip), 13,000 B CSS (3.83 KB gzip), and 38,506 B for the hero WebP. These are well below the 200 KB JS, 50 KB CSS, and 300 KB hero budgets.

## End-to-end product exercise

In fresh live browser contexts I exercised the sample at desktop and 390 px:

- changed zoom at both boundaries, 80% and 160%;
- selected Dim contrast and toggled both focus rail and reading lane;
- submitted an empty/whitespace waypoint, received the announced recovery message, `aria-invalid=true`, and focus returned to the field;
- confirmed the 40-character name limit and that HTML-like input renders as text rather than markup;
- saved and opened a waypoint, which focused the intended sample control;
- exported and inspected the shortcut text file;
- reloaded and confirmed only the isolated demo key persisted;
- reset the demo and confirmed defaults returned and local storage became empty;
- seeded malformed JSON and confirmed the demo recovered to its defaults.

Screenshots: [desktop demo](verification-artifacts/verification-3-live-demo-desktop.png), [390 px demo](verification-artifacts/verification-3-live-demo-mobile-390.png), and [390 px at 200% text](verification-artifacts/verification-3-live-demo-mobile-text-200.png).

The production MV3 extension was unpacked into a fresh Chromium profile and its service worker started. The packaged popup has one `h1`, one `main`, labels for every control, a safe unsupported-page error state, and zero serious/critical Axe findings. A deterministic Chrome-API harness exercised the actual bundled popup at a representative site: it loaded site-specific settings, rejected an empty waypoint, saved/opened a named waypoint, persisted a 200% zoom and reading-lane state under `site:https://work.example`, and exported shortcuts. The actual `lib/page-agent.ts` bundle independently applied zoom/contrast/focus/lane styles, captured structural selectors, recovered from a stale selector, and enforced the 80–200% command boundaries.

Headless Chromium cannot synthesize a real click on the browser toolbar action. The clean-profile service-worker load, packaged-popup exercise, real page-agent exercise, package inspection, and required `/demo` sandbox cover that browser-UI boundary without changing the candidate.

## Accessibility and responsive behavior

- Axe: zero serious or critical findings on `/`, `/demo`, `/privacy`, `/terms`, and the designed 404 at desktop and 390 px; zero on the packaged extension popup.
- Each public route has `lang="en"`, one `h1`, one `main`, an appropriate title, and no normal-size horizontal overflow.
- Keyboard-only traversal reaches the skip link, navigation, demo banner, every control, waypoints, sample controls, and footer without a trap. All interactive elements have a visible focus indicator. The formerly invisible contrast-radio focus now appears as a 4 px coral outline on its visible label in both demo and popup.
- Standalone links and controls are at least 44 px high at 390 px. Checkbox inputs themselves are 22 px but sit inside 44 px labels.
- Reduced motion computes the reading-lane transition to `0.01ms` and scroll behavior to `auto`.
- At 200% text, controls and content remain available; no interactive control is clipped.
- `/opt/fleet/lib/verify-url.sh` passes with no console errors, missing alt text, or unnamed buttons. Evidence: [verify-url output](verification-artifacts/verification-3-verify-url/verify.json).

## Privacy, security, deployment, and performance

- The live cold-load request log contains only the site HTML, same-origin JS/CSS, and same-origin hero image. After load, changing all controls, saving/opening a waypoint, and exporting shortcuts causes zero requests.
- Source and built-output review found no `fetch`, XHR, beacon, WebSocket, analytics, third-party script/font, API key, or secret.
- Responses provide HSTS, `nosniff`, strict-origin referrer policy, restrictive camera/microphone/geolocation policy, and CSP with `frame-ancestors 'none'`.
- HTML uses a 30-second revalidating cache. JS, CSS, images, and the extension download use `public, max-age=31536000, immutable`.
- All crawled internal links and the factory link return 200; the intentional email link is `mailto:`. An unknown path returns the designed document with HTTP 404.
- Regular routes produced no console or page errors. Chromium reports the expected failed-resource console entry when the deliberate HTTP 404 URL is loaded.
- Lighthouse 13.4.1 mobile: Performance 98, Accessibility 100, Best Practices 100, SEO 100; FCP 797 ms, LCP 1,061 ms, TBT 150 ms, CLS 0, and 49,382 B total transfer. Evidence: [Lighthouse JSON](verification-artifacts/verification-3-lighthouse-live.json).
- The live `index.html`, hashed JS, hashed CSS, and hero asset match the fresh local build byte-for-byte. Extracted live ZIP contents match `dist/extension` with no differences. Candidate `40e564d136bb72b5baf47f9dd3fdb81b62d4a7ff` is deployed.

There are no product APIs, server-side endpoints, accounts, payment, AI integration, site service worker, or PWA. Rate-limit, Entra, backend concurrency/persistence, and offline-update checks are not applicable.

## Findings by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: the full development dependency audit reports 11 advisories (2 moderate, 5 high, 4 critical) in Vite/Vitest/WXT and transitive development tooling. None is in the shipped browser assets or production dependency set; `npm audit --omit=dev` reports zero. Update the build/test toolchain in routine maintenance.

## Release decision

**PASS for release.** No product code was modified during verification.
