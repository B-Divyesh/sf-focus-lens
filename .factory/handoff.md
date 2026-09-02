# Focus Lens polish round 1 handoff

- Work order: `focus-lens-polish-1`
- Role: repair
- Repaired candidate: `40e564d136bb72b5baf47f9dd3fdb81b62d4a7ff`
- Repair code commit: `ce24e10`
- Live URL: https://focus-lens.sociobot.in
- Demo URL: https://focus-lens.sociobot.in/?demo=1
- Finding map: [`.factory/polish-1.md`](polish-1.md)

## What changed

- Resolved all 29 findings from `.factory/review-1.md`.
- Rebuilt demo waypoints around exact saved control selectors, with removal and reload stability.
- Added independent Atlas and Ledger sample-site state plus demo controls for rail width and color.
- Put Morgan Lee, the visible focus rail, and the reading lane inside the first 390 × 844 demo screen.
- Made sample search and record actions work.
- Added the isolated `/?demo=1` entry, persistent banner, targeted Reset, and installation exit.
- Added `/install`, clear Developer mode instructions, and `INSTALL.txt` inside the public ZIP.
- Added route-specific static and runtime metadata, routed focus/announcements, and a true 404 using the standard shell.
- Rewrote every flagged sentence while retaining the glacial ceramic visual system and original generated art.
- Expanded `.factory/claims.json` to 13 observable claims and committed a packaged MV3 integration harness.
- Upgraded and pinned vulnerable development tools. The full production and development audit is clean.

## How to run

```sh
npm ci
npm run dev
npm run dev:extension
npm test
npm run test:extension
npm run build
npm run test:clean-claims
```

Load `dist/extension` through Chrome's **Load unpacked** action for a manual toolbar check. The public `/install` route and packaged `INSTALL.txt` contain the same steps.

## Verification evidence

- Clean clone: `npm run test:clean-claims` passed all 13 declared commands after `npm ci` and before any manual build.
- Full suite: 11 Vitest unit/regression checks and 22 Playwright browser checks passed.
- Extension integration: the packaged MV3 popup ran in a fresh Chromium profile against a real HTTP tab. It wrote all settings and a selector-backed waypoint to real `chrome.storage.local`.
- Page-agent integration: capture, restore, rail/lane commands, and 80–200% zoom bounds passed.
- Accessibility: Axe reported no serious or critical issue on all routes or the extension popup. Keyboard focus, 44 px targets, reduced motion, and 200% text passed.
- Privacy: the exercised demo flow made zero post-load requests. Reset removed only `demo:focus-lens:settings` and kept a real-data sentinel.
- Routing: each source route has unique metadata. History navigation focuses and announces headings. Unknown routes use the standard shell with HTTP 404.
- Packaging: `npm run build`, `npx tsc --noEmit`, and ZIP integrity passed.
- Dependencies: `npm audit --audit-level=low` reports 0 vulnerabilities.
- Budgets: site JavaScript 21,431 B; CSS 15,541 B; hero 38,506 B.
- Local Lighthouse mobile: 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; FCP 1.1 s, LCP 1.4 s, TBT 70 ms, CLS 0.
- Live Lighthouse mobile: 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; FCP 0.8 s, LCP 1.1 s, TBT 50 ms, CLS 0.
- Local URL verifier: passed title, language, one `h1`, one `main`, alt text, button names, and console checks.
- Visual evidence: `.factory/polish-artifacts/mobile-demo.png`, `desktop-home.png`, `desktop-demo.png`, `extension-popup.png`, and `not-found.png`.
- Offline: not applicable because the extension makes no offline/PWA claim and the site has no service worker.

## Deployment and live recheck

- Pushed `ce24e10` and `e20bef5` to `origin/main`.
- Deployed `dist/site` to the existing in-scope `sf-focus-lens` Static Web App with the factory deployment script.
- Cold-opened https://focus-lens.sociobot.in/?demo=1 at 390 × 844. Morgan Lee, Atlas CRM, Needs review, the 6 px rail, and reading lane are in the first screen.
- Ran all 19 site/browser tests against production; all passed.
- Ran the fleet URL verifier against production; title, language, landmarks, alt text, controls, and console checks passed.
- Confirmed `/`, `/demo`, `/install`, `/privacy`, and `/terms` return 200. Unknown paths return the standard shell with HTTP 404.
- Downloaded the live ZIP, passed its integrity check, and matched every extracted file to `dist/extension`.
- Recorded only same-origin cold requests and zero console/page errors.
- Confirmed immutable cache and security headers on the live hashed JavaScript.
- Evidence is under `.factory/polish-artifacts/verify-live/` plus `live-mobile-demo.png`, `live-install.png`, `live-cold-check.json`, and `lighthouse-live.json`.

## Known gaps

None.
