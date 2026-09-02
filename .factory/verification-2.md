# Independent verification 2 — FAIL

- Candidate: `ebcd49384a500a45f801cc797fe05e7df91e75df`
- URL: https://focus-lens.sociobot.in
- Verified: 2026-09-02
- Work order: `focus-lens-verify-2`

## Verdict

**FAIL.** All seven declared claim commands now pass from a clean clone, and the live deployment matches the candidate. The candidate is still not releasable because keyboard focus is invisible on the contrast radio group, including in the extension popup, and public privacy/permission claims are absent from or stronger than the claims registry and its tests.

## First read

The cold first screen passes the mandatory first-read gate on desktop and at 390 px. It says that Focus Lens keeps a worker's place in dense web apps, identifies low-vision workers who lose keyboard focus in complex browser tools, and presents **Try it with sample data** as the first action. Adjacent copy says that it opens a safe sample workspace. The action is visible without scrolling and opens `/demo` in one click.

Evidence: [`live-first-read-desktop.png`](verification-artifacts/live-first-read-desktop.png) and [`live-first-read-mobile-390.png`](verification-artifacts/live-first-read-mobile-390.png).

## Release-blocking findings

### High — contrast choices have no visible keyboard-focus indicator

On the live `/demo`, Tab moves focus to the selected contrast radio. The focused input reports `:focus-visible = true` and computes a 4 px coral outline, but the input itself is rendered with `opacity: 0`. The visible `label` has `outline: none` and has no `:focus-within` treatment. The selected state is visible, but the current keyboard-focus location is not. The packaged extension repeats the same pattern in `entrypoints/popup/style.css` (`.segmented input { position: absolute; opacity: 0; }`) without styling the label when its input has keyboard focus.

This violates the attached accessibility baseline requiring a designed visible focus ring on every interactive control. It is especially material for a product whose job is keyboard orientation for people with low vision.

Evidence: [`live-demo-invisible-radio-focus.png`](verification-artifacts/live-demo-invisible-radio-focus.png). The measured focused radio had `opacity: 0`; its visible **Strong** label had a 0 px outline.

Required repair: style the visible label with a high-contrast focus indicator using `:has(input:focus-visible)` or `:focus-within`, in both the site demo and extension popup, then add a keyboard test that asserts the visible label's focus treatment.

### High — public privacy and permission claims are not fully registered or tested

`.factory/claims.json` has a `local-private` claim for local settings and no third-party runtime requests. Its test only rejects requests to a different origin during the demo. It would allow a same-origin analytics or collection request and does not inspect stored values for captured page text.

Public copy makes additional or stronger claims:

- Landing page and README: Focus Lens does not record/capture page text.
- Privacy page: “What leaves your browser: Nothing” and “no account, analytics, server, advertising, or third-party runtime request.”
- README: the packaged extension uses only `activeTab`, `scripting`, and `storage`.

There is no claim entry and claim-tagged sandbox test that proves page text is not persisted, that no request at all occurs after the shell loads, or that the shipped manifest contains only the stated permissions. Under the attached claims contract, an unlisted or under-tested public claim fails verification even when a source review supports it.

Required repair: register the exact privacy and permission promises and add claim-tagged tests that inspect all post-load requests, demo/extension storage values, and the packaged manifest; alternatively narrow the public copy to the behavior already proved.

## Other findings

### Medium — missing routes return HTTP 200

`GET /definitely-missing` renders the designed “Page not found” state but returns `HTTP/2 200`, not 404. This is a soft 404 and does not satisfy the site-structure requirement for a real 404 response. The SPA navigation fallback currently handles every unknown route before the configured response override can return 404.

### Medium — several standalone touch targets are shorter than 44 px

At 390 px, the demo's **Start for real** link is 26 px high and the separate footer Privacy, Terms, and factory links are 23 px high. The wordmark link is 38 px high. These are below the attached 44 px touch-target baseline. The radio and checkbox controls have 44 px wrapper labels and were not counted as target-size failures.

## Claim gate results

The checkout started clean at the candidate commit. After `npm ci`, each exact command from `.factory/claims.json` was run before the general QA pass. Every command exited 0 and ran 7 Vitest checks plus its named Chromium claim test. The repository's separate `npm run test:clean-claims` harness also cloned the candidate to a temporary directory, installed it, and passed all seven commands before any manual build.

| Claim | Exact command | Result and observable evidence |
| --- | --- | --- |
| `visible-focus` | `npm test -- --grep @claim:visible-focus` | PASS — focused sample search computed an outline at least 5 px wide. |
| `reading-lane` | `npm test -- --grep @claim:reading-lane` | PASS — reading lane became hidden after the labeled toggle. |
| `site-view` | `npm test -- --grep @claim:site-view` | PASS — 140% zoom and Dim persisted across reload under only `demo:focus-lens:settings`. |
| `named-waypoints` | `npm test -- --grep @claim:named-waypoints` | PASS — saved waypoint focused the sample control. |
| `shortcut-export` | `npm test -- --grep @claim:shortcut-export` | PASS — `focus-lens-shortcuts.txt` downloaded and contained `Alt+Shift+F`. |
| `local-private` | `npm test -- --grep @claim:local-private` | PASS as written — no third-party origin was requested during its demo flow. The coverage gap above remains. |
| `no-account-free` | `npm test -- --grep @claim:no-account-free` | PASS — complete demo had no sign-in fields and the extension ZIP downloaded without a gate. |

Live demo screenshots: [`live-demo-desktop.png`](verification-artifacts/live-demo-desktop.png) and [`live-demo-mobile-390.png`](verification-artifacts/live-demo-mobile-390.png).

## Local candidate verification

- `npm ci`: passed. npm reported 11 development-tool advisories; `npm audit --omit=dev` found 0 production vulnerabilities.
- `npm test`: passed, 7 Vitest tests and 10 Chromium tests.
- `npx tsc --noEmit`: passed. No lint script exists.
- `npm run build`: passed and produced `dist/site`, `dist/extension`, and the downloadable ZIP.
- `npm run test:clean-claims`: passed all seven claim commands from its clean temporary clone.
- Site bundle: 14,358 B JavaScript (5.10 KB gzip), 12,788 B CSS (3.80 KB gzip), 38,506 B hero WebP. These are comfortably below the factory budgets.
- The ZIP passed `unzip -t`. Its extracted contents exactly matched `dist/extension`. The manifest is MV3 and requests only `activeTab`, `scripting`, and `storage`, with no host permissions.
- The unpacked extension started its MV3 service worker in a clean Chromium profile. Chromium headless cannot reproduce a real toolbar click/`activeTab` grant, so the popup-to-page interaction was covered by the one-click demo, unit tests, package inspection, and source review rather than claimed as a full real-toolbar automation pass.

## Independent live exercise

In fresh desktop and 390 px browser contexts, I changed zoom through its 80–160 boundaries, selected Dim contrast, hid and restored the reading lane, tried empty and whitespace-only waypoint names, entered a 50-character name, entered HTML-like text, saved/opened/removed waypoints, exported shortcuts, reloaded, and reset the demo.

- Empty and whitespace-only names produced `Enter a waypoint name, then save it.`, set `aria-invalid=true`, and returned focus to the input.
- The input enforced its 40-character maximum. HTML-like input was escaped and did not create an element.
- A waypoint focused the intended sample control. The shortcut file had the expected filename and shortcut content.
- Reload retained only the isolated `demo:focus-lens:settings` key. Reset restored 120%, Strong contrast, the reading lane, and removed the key.
- History navigation restored the correct route title and focused route heading.
- No console or page errors occurred.
- All crawled links resolved with 200 responses, apart from intentionally skipped fragment and `mailto:` links.
- No server-side product endpoints, sign-in, payment, service worker/PWA, or AI feature exists. API rate-limit, Entra tenant, backend concurrency/persistence, and offline-update checks are therefore not applicable.

## Accessibility, privacy, headers, and performance

- Axe found zero serious or critical violations on `/`, `/demo`, `/privacy`, `/terms`, and an unknown route at desktop and 390 px. The keyboard defect above is not detected by Axe.
- Each checked route had `lang="en"`, one `<h1>`, one `<main>`, the correct title, and no horizontal overflow at its normal size.
- Reduced motion changed the reading-lane transition to `0.01ms` and scroll behavior to `auto`.
- `/opt/fleet/lib/verify-url.sh` passed with no console errors, missing alt text, or unnamed buttons. Evidence: [`verify.json`](verification-artifacts/verify-url-live/verify.json).
- The complete live request log used only `https://focus-lens.sociobot.in`; demo changes caused no network request. Source review found no `fetch`, XHR, beacon, WebSocket, or EventSource use.
- Responses include HSTS, CSP with `frame-ancestors 'none'`, `nosniff`, Referrer-Policy, and restrictive camera/microphone/geolocation permissions. Hashed JS/CSS/image assets and the extension ZIP return `Cache-Control: public, max-age=31536000, immutable`.
- Lighthouse mobile: Performance 98, Accessibility 100, Best Practices 100, SEO 100; FCP 765 ms, LCP 1,052 ms, TBT 153 ms, CLS 0. Evidence: [`lighthouse-live.json`](verification-artifacts/lighthouse-live.json).

## Deployment identity

The live `index.html`, JavaScript, CSS, and hero asset are byte-for-byte identical to the fresh candidate build by SHA-256. Extracted live ZIP contents are byte-for-byte identical to `dist/extension`. The live deployment therefore matches candidate `ebcd49384a500a45f801cc797fe05e7df91e75df`; the verdict is not a stale-deployment result.

## Retest criteria

1. Provide a visible focus treatment on the visible contrast labels in both demo and popup, with a keyboard regression test.
2. Register and test every privacy/permission promise, or narrow the copy to the exact tested claims.
3. Return HTTP 404 for unknown paths.
4. Bring standalone links to at least 44 px touch height.
5. Re-run all seven exact claim commands from a clean clone, the full suite/build/typecheck, and the live parity checks.
