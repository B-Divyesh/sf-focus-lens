# Focus Lens handoff

## What was built

- A WXT and TypeScript Manifest V3 extension with only `activeTab`, `scripting`, and `storage` permissions.
- A configurable focus rail, keyboard-following reading lane, zoom from 80% to 200%, three contrast modes, and four rail colors.
- Per-origin local settings and named waypoints that return focus to user-selected controls.
- Exportable plain-text keyboard shortcut sheet and four Chrome keyboard commands.
- A responsive static product site with an isolated one-click demo, real extension download, privacy, terms, 404, sitemap, robots, social metadata, and security headers.
- Original generated hero art and a product-specific glacial minimal ceramics visual system.
- Unit and Playwright coverage for every claim, accessibility, route metadata, downloads, links, privacy requests, and 390 px layout.

## Run and verify

```sh
npm ci
npm run build:site
npm test
npx tsc --noEmit
```

`npm run build:site` builds the extension and site. Outputs are `dist/extension`, `dist/site`, and `dist/site/downloads/focus-lens-chrome.zip`.

The demo is `/demo`. Reset it with **Reset demo**. It uses only the `demo:focus-lens:settings` localStorage key.

## Verification results

- `npm test`: 3 unit tests and 9 Chromium tests passed.
- Claim checks: 7 of 7 passed in fresh demo contexts.
- Axe: no serious or critical findings on home, demo, privacy, terms, or not-found routes.
- TypeScript: `npx tsc --noEmit` passed.
- Production build: passed. Site JS is 4.89 KB gzip; CSS is 3.76 KB gzip. Extension output is 19.84 KB before ZIP.
- Hero WebP: 38 KB at 1280 × 853. Social WebP: 30 KB at 1200 × 630.
- Lighthouse mobile, local production preview: Performance 100, Accessibility 100, Best Practices 100, SEO 100.
- Lighthouse metrics: FCP 0.9 s, LCP 1.4 s, CLS 0, total blocking time 40 ms, total transfer 49 KiB.
- Visual checks: desktop landing page and 390 × 844 demo inspected from captured Chromium screenshots.
- Runtime console: no errors across the five routed pages in Playwright.

## Privacy and permissions

The extension stores settings in `chrome.storage.local`. It stores no page text and sends no runtime request. The demo uses its own storage namespace. There are no analytics, external fonts, CDN scripts, AI calls, accounts, or payment flows.

## Known gaps and next steps

- The extension is packaged for Chromium. Firefox packaging has not been validated.
- Site settings apply after the user opens Focus Lens on a page. This is the tradeoff for avoiding broad host permissions.
- Some sites can override page zoom or use closed shadow roots that block waypoint targeting.
- No benefit claim has been made. The planned two-week usability pilot with low-vision knowledge workers remains the next research step.
