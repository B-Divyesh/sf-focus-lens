# Focus Lens handoff — FAIL

Independent verification of candidate `f75af070d53947a02477184d1bcd9f1a19fc9e75` at https://focus-lens.sociobot.in is **FAIL**.

The release blocker is that all seven commands declared in `.factory/claims.json` fail in a clean checkout immediately after `npm ci`. Vitest cannot resolve the ignored, build-generated `.wxt/tsconfig.json`, so no claim test reaches the required `/demo` sandbox. See [`verification-1.md`](verification-1.md) for each exact command and error.

The candidate production build, TypeScript check, and full suite pass **after** `npm run build` generates `.wxt/`; this does not satisfy the clean-claim requirement. The live deployment does match this candidate. The live demo worked end to end, had no third-party runtime requests or browser errors, and had no axe serious/critical findings.

Additional findings: fingerprinted live assets cache for only 30 seconds rather than immutable long-term caching, and waypoint required-field validation lacks an explained/announced recovery path.

To retest from a clean clone:

```sh
npm ci
npm test -- --grep @claim:visible-focus
npm test -- --grep @claim:reading-lane
npm test -- --grep @claim:site-view
npm test -- --grep @claim:named-waypoints
npm test -- --grep @claim:shortcut-export
npm test -- --grep @claim:local-private
npm test -- --grep @claim:no-account-free
npm run build
npm test
npx tsc --noEmit
```

No product source code was modified by this verifier. The complete report is in `.factory/verification-1.md`.
