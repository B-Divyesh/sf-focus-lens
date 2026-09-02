# Independent verification — FAIL

- Candidate: `f75af070d53947a02477184d1bcd9f1a19fc9e75`
- URL: https://focus-lens.sociobot.in
- Verified: 2026-09-02
- Verifier: independent factory QA (`focus-lens-verify-1`)

## Verdict

**FAIL.** The required claim commands do not run from a clean checkout. This is release-blocking under the claims contract, even though they pass after a build has generated WXT's ignored `.wxt/tsconfig.json`.

## First read

Cold-opening the production page answered the three required questions in plain words. It is a tool that keeps keyboard focus visible in dense web apps, for low-vision workers using complex browser tools. The first action is **Try it with sample data**, and its adjacent text says that it opens a safe sample workspace. The button is one click and routes to `/demo`.

## Release-blocking finding

### High — every required clean-checkout claim command fails

After `npm ci`, before any build or WXT generation, I executed every exact `test` command in `.factory/claims.json`:

| Claim | Command | Result |
| --- | --- | --- |
| `visible-focus` | `npm test -- --grep @claim:visible-focus` | FAIL |
| `reading-lane` | `npm test -- --grep @claim:reading-lane` | FAIL |
| `site-view` | `npm test -- --grep @claim:site-view` | FAIL |
| `named-waypoints` | `npm test -- --grep @claim:named-waypoints` | FAIL |
| `shortcut-export` | `npm test -- --grep @claim:shortcut-export` | FAIL |
| `local-private` | `npm test -- --grep @claim:local-private` | FAIL |
| `no-account-free` | `npm test -- --grep @claim:no-account-free` | FAIL |

Each stops before Playwright starts with the same error:

```text
TSConfckParseError: failed to resolve "extends":"./.wxt/tsconfig.json" in /work/repo/tsconfig.json
Caused by: Error: Cannot find module './.wxt/tsconfig.json'
```

`npm test` starts Vitest before its Playwright web-server command runs the build, while `.wxt/` is ignored and absent in a clean checkout. The remedy is to make the declared test commands self-contained from a clean checkout (or to remove the dependency on generated WXT config for the unit suite), then rerun each claim command clean.

## Other findings

### Medium — hashed production assets have only a 30-second cache lifetime

`/assets/index-vc6LRFAo.js`, CSS, the hero, and the ZIP download are all served with `Cache-Control: public, must-revalidate, max-age=30`. This does not meet the factory performance requirement for long-lived immutable caching of hashed static assets. It is not the cause of the verdict, but should be corrected in the deployment/static-web-app configuration.

### Low — required waypoint input does not explain requiredness or announce its validation error

The extension popup and demo waypoint forms use a bare `required` attribute. There is no visible required-field instruction and the application `role=alert` is not reached when native required validation prevents submission. This falls short of the accessibility contract's required-field explanation and announced error/recovery guidance. The field otherwise has a bound label and works after valid input.

## Evidence from checks that passed

### Local candidate

- `npm ci`: passed (npm reported 11 dependency audit advisories; no source was changed by this verification).
- `npm run build`: passed. It built the MV3 extension and `dist/`.
  - Site JS: 13.78 KB / 4.89 KB gzip.
  - Site CSS: 12.68 KB / 3.76 KB gzip.
  - Hero WebP: 38.5 KB.
  - Extension output: 19.84 KB before ZIP.
- After that build, `npm test` passed: 3 Vitest tests and 9 Chromium tests, including all seven claim-tagged tests. This is supporting evidence only; it does not repair the required clean-checkout failure above.
- `npx tsc --noEmit`: passed.
- The packaged extension loaded in Chromium as MV3. Its manifest has only `activeTab`, `scripting`, and `storage`; all four declared Chrome commands were registered. The downloaded ZIP's extracted contents match the local `dist/extension` contents exactly.

### Live product flow

In a fresh Playwright context at `/demo`, I changed zoom from 120% to 140%, selected Dim contrast, hid the reading lane, created and opened a named waypoint, downloaded `focus-lens-shortcuts.txt`, reloaded, and reset the demo.

- The waypoint focused the sample control.
- The shortcut download contained `Alt+Shift+F`.
- Reload retained 140%, Dim, and the hidden lane using only `demo:focus-lens:settings`.
- Reset restored 120% and the visible lane, then left no demo storage keys.
- The complete request log contained no third-party origin. Console and page error logs were empty.

### Accessibility, responsive, and deployment checks

- Axe found zero serious or critical violations on `/`, `/demo`, `/privacy`, `/terms`, and a missing route.
- Every checked route had one `<h1>` and one `<main>`, with the expected route title. At 390 px, all five routes had `scrollWidth === clientWidth === 390`.
- Keyboard tabbing reached the skip link, navigation, demo controls, waypoint controls, export, and sample controls with a visible coral focus outline.
- In reduced-motion mode, the lane transition computed to effectively zero and scroll behavior was `auto`.
- All links across those routes returned 200, apart from the intentional `mailto:` link.
- Live response headers include HTTPS/HSTS, CSP with `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, Referrer-Policy, and a restrictive Permissions-Policy. There are no server-side product endpoints, accounts, payments, PWA/service-worker claims, or rate-limited APIs to exercise.
- Lighthouse against production recorded Performance 100 and Accessibility 100, FCP 908 ms, LCP 1124 ms, and CLS 0 in this environment.

### Deployment identity

Fresh candidate build output exactly matched the live `index.html`, JS, CSS, and hero asset by SHA-256. The live extension ZIP differed only at the archive container level due to timestamps; `diff -rq` of extracted files against `dist/extension` reported no differences. The live deployment therefore matches candidate `f75af070…`.

## Retest criteria

1. From a new clone, run `npm ci`, then run each of the seven claim commands above before any manual build. All must start their demo tests and pass.
2. Set immutable, long-lived caching for fingerprinted assets and verify the live response headers.
3. Add visible required guidance and an announced validation/recovery message for waypoint naming, then rerun accessibility checks.
