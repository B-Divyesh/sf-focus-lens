# Focus Lens

Focus Lens is a free Chrome extension for low-vision workers who use dense browser applications.

It adds a focus rail, reading lane, and per-site zoom and contrast settings. You can change the rail width and color. You can also save waypoints and export a shortcut sheet.

Settings and waypoints stay under each site's key in Chrome storage. A waypoint stores your name and the control's structural location. It does not store page text. Focus Lens controls make no network requests after their local files load.

Try the isolated sample at [focus-lens.sociobot.in/?demo=1](https://focus-lens.sociobot.in/?demo=1). Demo changes use only `demo:focus-lens:settings`. **Reset demo** removes that key without changing other browser data.

## Install the packaged extension

The public [installation page](https://focus-lens.sociobot.in/install) provides the current ZIP and the same steps below. The ZIP also contains `INSTALL.txt`.

1. Download and extract `focus-lens-chrome.zip`.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode**.
4. Select **Load unpacked**.
5. Choose the extracted folder that contains `manifest.json`.
6. Pin Focus Lens and open its toolbar button on a regular web page.

The extension requests only `activeTab`, `scripting`, and `storage`. It does not request host permissions.

## Use Focus Lens

- Set zoom, contrast, focus rail width, and focus rail color for the current site.
- Turn the reading lane on while scanning a dense page.
- Focus a page control, enter a waypoint name, then select **Save focus**.
- Open a waypoint to return to that exact control.
- Export the four-command shortcut sheet from the panel.

The packaged commands toggle the focus rail and reading lane or change zoom between 80% and 200%.

## Develop and test

Requirements: Node.js 20 or later, npm, and Chromium for Playwright.

```sh
npm ci
npm run dev
npm run dev:extension
npm test
npm run test:extension
npm run build
npm run test:clean-claims
PLAYWRIGHT_BASE_URL=https://focus-lens.sociobot.in npx playwright test tests/e2e/site.spec.ts
```

`npm test` runs unit, browser, accessibility, privacy, routing, and packaged-extension integration checks. `npm run test:extension` repeats the real-extension harness alone. The final command repeats the site suite against production without starting a local server.

Every command in `.factory/claims.json` runs from a clean clone. The harness supplies a real HTTP tab to the packaged popup. It also exercises the production page agent on that tab.

`npm run build` produces:

- `dist/extension/` — unpacked Manifest V3 extension with `INSTALL.txt`.
- `dist/site/` — static site and route documents.
- `dist/site/downloads/focus-lens-chrome.zip` — packaged extension.

Deploy the static site with the factory configuration. The deployment command is `npm run build:site`, which also rebuilds the downloadable extension.

## Privacy and limits

Read the deployed [privacy page](https://focus-lens.sociobot.in/privacy) and [terms](https://focus-lens.sociobot.in/terms). Focus Lens does not replace a screen reader or an employer accommodation. Test it with each workplace application before relying on it.

## License

MIT. See [LICENSE](LICENSE).
