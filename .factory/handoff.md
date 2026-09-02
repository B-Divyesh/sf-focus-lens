# Focus Lens repair handoff

- Repair commit: `a22b8a4`
- Product: local-first MV3 browser extension with a static landing site
- Deployment target: `https://focus-lens.sociobot.in`

## Release blockers repaired

- Reproduced the verifier's exact radio defect before changing code: the focused demo radio reported `:focus-visible=true` and `opacity: 0`, while its visible label had a `0px` outline. Both the demo and packaged popup now put a 4 px coral focus ring and pale halo on the visible contrast label using `label:has(input:focus-visible)`.
- Added browser regression coverage for both locations. The popup test loads the production MV3 package, tabs to its contrast group, and verifies the visible label focus ring.
- Registered and proved the exact privacy and permission promises in `.factory/claims.json`: isolated demo storage/reset, no post-load egress during a complete demo flow, no page-text capture, and exact packaged permissions.
- Removed an unused `textContent` read from the extension waypoint capture path. A waypoint now returns only a structural selector; its human-readable name is always entered by the user.
- Replaced the broad Static Web Apps navigation fallback with explicit rewrites for `/demo`, `/privacy`, `/terms`, and `/404`. Unknown paths now reach the designed `404.html` response with HTTP 404.
- Raised standalone site links, including the wordmark, demo banner link, footer, legal links, and static 404 link, to at least 44 px. The 390 px browser test covers every public route.

## Verification

All completed on 2026-09-02:

```sh
npm ci
npx tsc --noEmit
npm test                         # 10 Vitest + 15 Chromium tests
npm run build                    # dist/site and dist/extension
unzip -t dist/site/downloads/focus-lens-chrome.zip
npm run test:clean-claims        # all 10 exact claim commands in a clean clone
```

- The browser suite covers desktop and 390 px mobile layouts, keyboard-only focus in the demo and packaged popup, route history, reduced motion, waypoint validation/recovery, privacy requests, local storage, ZIP manifest permissions, HTTP 404, and touch-target sizes.
- Playwright Axe found zero serious or critical issues across `/`, `/demo`, `/privacy`, `/terms`, and the designed unknown-route 404. The standalone Axe CLI could not create a ChromeDriver session in this container; the browser-native Axe integration is the passing accessibility gate.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173` passed: no console errors, title/lang, one h1, main landmark, image alt text, and named buttons all verified. Local static responses were `200` for `/demo` and `404` for `/definitely-missing`.
- Lighthouse local mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1,355 ms, TBT 14 ms, CLS 0.
- Production build: JavaScript 14.34 KB (5.08 KB gzip) and CSS 13.00 KB (3.83 KB gzip). `npm audit --omit=dev --audit-level=high` reported 0 production vulnerabilities.

## Deployment and follow-up

Deployed to the existing `sf-focus-lens` Static Web App on 2026-09-02. Live checks at `https://focus-lens.sociobot.in` confirmed:

- `/demo` returns HTTP 200 and an unknown path returns the designed static document with HTTP 404.
- The live demo's opacity-zero Strong radio has `:focus-visible=true`; its visible label computes a 4 px `rgb(198, 61, 47)` outline. There were no browser console errors.
- At 390 px, the demo has no horizontal overflow and every visible standalone link is at least 44 px high.
- Live JS, CSS, and the downloadable ZIP have exact SHA-256 matches with the local production build. The deployed CSP, referrer policy, nosniff header, and immutable asset caching are present.

There are no known product gaps. Offline/update checks do not apply because this remains a non-PWA static landing site and extension with no site service worker.
