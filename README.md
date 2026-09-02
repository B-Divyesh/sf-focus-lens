# Focus Lens

Focus Lens is a free Chrome extension for low-vision knowledge workers who use dense browser applications. It adds a large focus rail, a temporary reading lane, per-site zoom and contrast settings, named keyboard waypoints, and an exportable shortcut sheet.

All settings stay in Chrome extension storage. Focus Lens has no account, analytics, server, or runtime third-party request. It does not capture page text.

Try the isolated sample at [focus-lens.sociobot.in/demo](https://focus-lens.sociobot.in/demo). Demo changes use the separate `demo:focus-lens:settings` browser key and can be reset from the banner.

## Install the packaged extension

1. Run `npm ci && npm run build`.
2. Open `chrome://extensions`.
3. Turn on **Developer mode**.
4. Select **Load unpacked**.
5. Choose `dist/extension`.

Open the Focus Lens toolbar button on a regular web page. The extension uses `activeTab`, `scripting`, and `storage`. It does not request access to every site in advance.

## Use Focus Lens

- Set zoom, contrast, focus width, and focus color for the current site.
- Turn the reading lane on while scanning a dense page.
- Focus a useful page control, enter a waypoint name, then select **Save focus**.
- Open a saved waypoint from the panel.
- Export the keyboard shortcut sheet from the panel.

Keyboard commands toggle the focus rail and reading lane or change page zoom. Chrome may reserve some shortcuts. Change extension shortcuts at `chrome://extensions/shortcuts` if needed.

## Develop and test

Requirements: Node.js 20 or later, npm, and Chromium for Playwright.

```sh
npm ci
npm run dev             # landing site
npm run dev:extension   # WXT extension development
npm test
npm run build
```

`npm run build` produces:

- `dist/extension/` — unpacked Manifest V3 extension.
- `dist/site/` — static site with `index.html` at its root.
- `dist/site/downloads/focus-lens-chrome.zip` — packaged extension.

The exact static deployment command is `npm run build:site`, but run `npm run build` when the downloadable extension also needs rebuilding.

## Privacy and limits

See `/privacy` and `/terms` on the deployed site. Focus Lens is not a screen-reader replacement and does not bypass site security. Test it with each workplace application before relying on it.

## License

MIT. See [LICENSE](LICENSE).
