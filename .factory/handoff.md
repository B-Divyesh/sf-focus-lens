# Focus Lens repair handoff

Repaired the release blockers recorded in `verification-1.md` for candidate `f75af070d53947a02477184d1bcd9f1a19fc9e75`.

## Repairs

- Replaced the root TypeScript configuration that extended ignored, build-generated `.wxt/tsconfig.json` with a checked-in standalone configuration. `entrypoints/background.ts` now imports WXT's background helper explicitly, so the stable config type-checks without generated declarations.
- Added `npm run test:clean-claims`. It creates a temporary local clone, runs `npm ci`, then runs each exact command in `.factory/claims.json` before any manual build. Regression tests also assert that the root config cannot regain the `.wxt` dependency.
- Added long-lived immutable cache headers for `/assets/*` and `/downloads/*` in `staticwebapp.config.json`, with regression coverage for the deployed policy.
- Made both waypoint forms visibly explain requiredness and use `novalidate` plus an announced, recoverable `role="alert"` error. The shared `validateWaypointName` helper is unit-tested; the demo is browser-tested for empty submission, live error, recovery, and successful save.

## Verification

All commands below passed on 2026-09-02:

```sh
npm ci
# With .wxt absent:
npm test -- --grep @claim:visible-focus
npm test
npx tsc --noEmit
npm run build
npm run test:clean-claims
```

`npm test` passed 7 Vitest checks and 10 Chromium checks, including all seven declared claims, desktop and 390 px coverage, keyboard-accessible controls, privacy-request checking, reduced-motion behavior, and Axe serious/critical checks on `/`, `/demo`, `/privacy`, `/terms`, and the 404 route. The clean-clone harness ran every exact claim command after its own `npm ci`.

`/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173 <evidence-dir>` reported a valid title, `lang="en"`, one `h1`, a main landmark, no missing image alt text, no unlabeled buttons, and no browser console errors. The standalone Axe CLI could not run because this container has no system Chrome binary; the installed Playwright Axe integration completed successfully with the preinstalled Chromium browser.

`npm run build` produced `dist/site` and the MV3 `dist/extension`. `unzip -t` passed for the downloadable ZIP, extracted ZIP contents exactly matched `dist/extension`, and the manifest was checked as MV3 with only `activeTab`, `scripting`, and `storage` permissions plus all four declared commands. The site bundle is 14.36 KB JS (5.10 KB gzip) and 12.79 KB CSS (3.80 KB gzip).

After deployment, the custom-domain demo passed a 390 px Playwright smoke check for its route title, one heading and main landmark, empty-waypoint recovery, no horizontal overflow, and zero console errors. Its live JavaScript SHA-256 exactly matched the built `index-DXkHJVdR.js`. Live `/assets/index-DXkHJVdR.js` and `/downloads/focus-lens-chrome.zip` both return `Cache-Control: public, max-age=31536000, immutable`.

## Deployment and follow-up

The repair is committed as `fee2247` (plus this handoff update), pushed to `main`, and deployed to the existing `sf-focus-lens` Static Web App on 2026-09-02.

There are no known product gaps. The product remains a local-first MV3 browser extension with a static landing site; no accounts, remote product APIs, analytics, or third-party runtime requests were added.
