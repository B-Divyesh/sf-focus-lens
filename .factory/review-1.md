# Adversarial first-read review 1 — Focus Lens

- Verdict: **FAIL**
- Work order: `focus-lens-review-1`
- Reviewed commit: `61c43511a201f5205f6443f375b8172fda7c5acd`
- Live URL: https://focus-lens.sociobot.in
- Review date: 2026-09-02
- Viewports: 390 × 844 and 1440 × 900

The first-read message is clear, but the product does not meet the zero-finding standard. The mobile demo does not show sample data on its first screen, its custom waypoint behavior is a hard-coded simulation, claim tests leave advertised behavior unproved, and several structure and copy issues remain.

## Cold first read before scrolling

### 390 px phone

- What it does: keeps keyboard focus visible in dense browser applications and offers view aids.
- For whom: low-vision workers who lose keyboard focus in complex browser tools.
- First click: **Try it with sample data**.

The exact first-screen text that supplied those answers was “Keep your place in dense web apps,” “For low-vision workers who lose keyboard focus in complex browser tools,” and “Try it with sample data.” This passes the three-question blocking gate.

All three fact lines are visible at 390 × 844. The hero image begins below them.

### Desktop

The same three answers are clear from the same text, and the sample-data action is visible. However, only “Settings stay in your browser” is fully visible at 1440 × 900; the other two required facts fall below the fold. See F-1-15.

## Findings

### Blocking

#### F-1-1 — The phone demo does not show sample data on its first screen

- Location: live `/demo`, 390 × 844.
- Exact text in view: “Sample workspace,” “Adjust a busy page without losing focus,” and the beginning of “Focus Lens controls.”
- Evidence: the sample application starts at y=1,388 and its table starts at y=1,699, far below the 844 px viewport. No sample record or sample application control is visible without substantial scrolling.
- Why this fails: the required one-click demo must immediately show the product being used with realistic sample data. A phone visitor instead sees explanation and settings, not the result.
- Concrete fix: put a compact, already-focused sample case directly below the banner on mobile, before the control panel. It should show at least one named record, the coral focus rail, and the reading lane within the first 844 px.

#### F-1-2 — Custom demo waypoints are not tied to the control the visitor chose

- Location: live `/demo`; `site/src/main.ts:121-175`; `tests/e2e/site.spec.ts:100-105`.
- Exact text: “Required. Enter a name for the focused sample control.”
- Evidence: demo storage holds only waypoint names. Opening index 0 always focuses `#sample-search`; every later index always focuses `#sample-open`. Saving “New target” opened **Open record** even though no sample control had been selected. Removing the first seed also changes which control an existing name opens. The tagged test creates a waypoint without choosing a control and explicitly expects the hard-coded **Open record** target.
- Why this fails: the demo does not demonstrate “Saves and opens named keyboard waypoints.” It demonstrates a name list mapped by array position. It also leaves the `no-page-text-capture` claim’s promised stored selector untested.
- Concrete fix: track the last focused sample control, store `{name, selector}` for every demo waypoint, and restore that exact control. Add claim tests for both sample targets, removal/reordering, reload, and stored selector data.

#### F-1-3 — The per-site settings claim is not tested per site

- Location: `.factory/claims.json` claim `site-view`; `tests/e2e/site.spec.ts:89-98`.
- Exact claim: “Saves zoom and contrast settings for each site.”
- Evidence: the tagged test changes and reloads one `/demo` origin. It never opens a second site or site namespace and never verifies that one site cannot read or overwrite another site's settings. The unit test checks one expected key string, not isolation between two sites.
- Why this fails: persistence on one page does not prove the advertised per-site behavior.
- Concrete fix: test two distinct origins or two explicit site namespaces, save different values, reload both, and assert the settings remain independent.

#### F-1-4 — “High-contrast” is not proved by the visible-focus claim test

- Location: `.factory/claims.json` claim `visible-focus`; `tests/e2e/site.spec.ts:11-35`.
- Exact claim: “Adds a large high-contrast focus rail.”
- Evidence: the sample-control assertion checks only that `outlineWidth >= 5`. The color assertion later concerns the demo’s hidden contrast radio label, not the promised focus rail. No contrast ratio or two-tone rail/halo boundary is asserted.
- Why this fails: a wide outline can still have poor contrast. The claim contains an untested quality that a low-vision visitor could rely on.
- Concrete fix: assert the sample focus rail’s computed color and halo, then calculate that at least one boundary meets the required 3:1 non-text contrast against representative light and dark sample backgrounds.

#### F-1-5 — Browser-only storage is an unlisted extension claim

- Locations: landing hero, landing privacy section, privacy route, README lines 5 and 17.
- Exact quotes: “Settings stay in your browser.” “Focus Lens stores view settings and waypoint selectors in local browser storage.” “All settings stay in Chrome extension storage.”
- Evidence: `local-private` tests only the web demo’s `localStorage` key. `site-view` also operates only on `/demo`. No claim entry exercises the packaged extension and verifies its `chrome.storage.local` writes.
- Why this fails: the public promise concerns real extension data, while the registered proof concerns the simulation.
- Concrete fix: add one exact extension-storage claim and a tagged packaged-extension test that changes every stored setting, saves a waypoint, and asserts only namespaced `chrome.storage.local` data is written.

#### F-1-6 — Keyboard command behavior is an unlisted claim

- Location: README line 27.
- Exact quote: “Keyboard commands toggle the focus rail and reading lane or change page zoom.”
- Evidence: no `.factory/claims.json` entry covers command dispatch or its observable effect. The current tests do not invoke the packaged background command path.
- Why this fails: this is a feature promise with no claim gate.
- Concrete fix: add a `keyboard-commands` claim and trigger each command against a test page, asserting focus visibility, lane visibility, and bounded zoom. Otherwise remove the sentence.

#### F-1-7 — The “never changes the control” claim is unlisted

- Location: landing live preview, `site/src/main.ts:69`.
- Exact quote: “It never changes the control itself.”
- Evidence: no claim entry snapshots the focused element before and after Focus Lens applies its rail.
- Why this fails: “never” is an absolute behavior claim and is not covered by the width-only focus test.
- Concrete fix: either remove the sentence or register it and assert that relevant attributes, value, text, classes, and DOM position remain unchanged after applying and removing Focus Lens.

#### F-1-8 — The page-security claim is unlisted

- Locations: README line 54 and live `/terms`.
- Exact quote: “It does not bypass page security.”
- Evidence: no claim entry defines or tests this boundary.
- Why this fails: the sentence is absolute and undefined, so a visitor cannot tell whether it refers to protected browser pages, application permissions, or page authorization.
- Concrete fix: replace it with a specific, testable limit such as “Chrome blocks Focus Lens on browser settings pages,” then add a tagged test; otherwise remove it.

#### F-1-28 — Focus-width and focus-color settings are unlisted and missing from the demo

- Locations: landing How it works section and README line 21.
- Exact quotes: “Choose zoom, contrast, focus width, and a reading lane.” “Set zoom, contrast, focus width, and focus color for the current site.”
- Evidence: no claim entry tests changing focus width or focus color. The demo has no control for either setting.
- Why this fails: these are advertised product controls, but a visitor cannot try them and the claim gate does not prove them.
- Concrete fix: add both controls to the isolated demo, register the behavior, and assert their visual result and persistence. Otherwise remove them from public copy.

#### F-1-29 — Shortcut conflict and reassignment statements are unlisted

- Locations: landing privacy section and README line 27.
- Exact quotes: “Browser shortcuts can conflict with site shortcuts.” “You can change them in your extension settings.” “Chrome may reserve some shortcuts.” “Change extension shortcuts at chrome://extensions/shortcuts if needed.”
- Evidence: no claim entry tests conflict recovery or verifies the documented reassignment path.
- Why this fails: these statements are user-facing behavior and recovery claims.
- Concrete fix: add them to the keyboard-command claim requested in F-1-6 and test the supported reassignment route, or replace the claims with a link to Chrome's own shortcut-management documentation.

#### F-1-9 — The previous handoff’s vulnerable development toolchain remains unresolved

- Location: `.factory/handoff.md`, “Known gaps”; current `npm audit`.
- Exact prior text: “The full development-only dependency audit reports 11 advisories in build/test tooling.”
- Evidence: fresh `npm ci` still reports 11 advisories: 2 moderate, 5 high, and 4 critical. Direct affected packages include Vite, Vitest, and WXT. `npm audit --omit=dev --audit-level=high` does pass with zero production vulnerabilities.
- Why this fails: the earlier gap is still present. The review order requires any unfixed earlier finding to be blocking again.
- Concrete fix: upgrade or replace the affected development packages and lockfile, then make the full `npm audit` pass or document a narrow, time-bound exception with unreachable-path evidence.

#### F-1-10 — The real browser-toolbar flow still has no repeatable end-to-end test

- Location: previous `.factory/handoff.md` known gap; `tests/e2e/site.spec.ts:37-80`.
- Exact prior text: “Headless Chromium cannot generate a real browser-toolbar action click.”
- Evidence: the retained popup regression opens `popup.html` directly, finds itself as the active `chrome-extension:` tab, and manually re-enables controls. No committed test proves a toolbar open, `activeTab` grant, popup-to-page message, setting persistence, and page update as one flow.
- Why this fails: the real job is performed by a browser extension, not the website simulation. The earlier unverified boundary remains.
- Concrete fix: retain a repeatable browser-extension harness that supplies a real HTTP active tab and exercises the packaged popup/background/page-agent/storage flow end to end. If toolbar activation cannot be automated, document and record a reproducible manual release test rather than a one-off assertion in a handoff.

### High

#### F-1-11 — The public download is not an install path for the intended visitor

- Locations: landing “Download the Chrome extension”; demo “Start for real”; downloaded ZIP.
- Evidence: both actions download an unpacked extension archive. The ZIP contains only extension runtime files and no installation instructions. The website does not explain extracting the ZIP, opening `chrome://extensions`, enabling Developer mode, or loading the folder. Those steps exist only in the repository README and first require rebuilding from source.
- Why this fails: a low-vision knowledge worker who arrived at the public site cannot get from the public CTA to a running product.
- Concrete fix: publish a store install link. Until then, label the action **Download extension ZIP**, link an accessible installation page, include the instructions in the archive, and state that Developer mode is required.

#### F-1-12 — The sample application exposes inert controls

- Location: live `/demo`, sample application.
- Exact labels: “Dashboard,” “Queues,” “Reports,” and “Open record.”
- Evidence: the buttons have no click handlers. **Open record** can receive focus but does not open anything.
- Why this fails: enabled buttons promise results. Dead controls make the sample look broken and obscure which behavior belongs to Focus Lens.
- Concrete fix: make the controls update a small sample state, or render nonessential chrome as noninteractive text. At minimum, **Open record** must show the selected sample record.

#### F-1-13 — The real HTTP 404 does not use the site’s standard skeleton

- Location: live unknown URL such as `/definitely-missing`; `site/public/404.html`.
- Evidence: HTTP status 404 and the designed heading pass, but the served 404 has no skip link, main navigation, Privacy link, Terms link, version, canonical, Open Graph metadata, Twitter metadata, theme color, or apple-touch icon. Its header and footer differ from every app route.
- Why this fails: the site-structure contract requires the consistent header/footer and metadata on every route, including the designed 404.
- Concrete fix: generate `404.html` from the same shell and metadata helper as other routes while retaining the true HTTP 404 response.

### Medium

#### F-1-14 — Route metadata stays on the home-page identity

- Locations: live `/demo`, `/privacy`, `/terms`, and SPA `/404`; `site/index.html:6-19`; `site/src/main.ts:103-105,185-204`.
- Evidence: titles and canonicals change, but every SPA route keeps the home meta description, `og:title`, `og:description`, `og:url`, and Twitter title/description. For example, `/privacy` reports `og:url=https://focus-lens.sociobot.in/` and “Focus Lens — keep focus visible in web apps.”
- Why this fails: shared or crawled route previews mislabel legal and demo pages.
- Concrete fix: set every route’s description, Open Graph title/description/URL, and Twitter title/description together with the title and canonical. Prefer prerendered route documents so non-JavaScript crawlers receive the correct metadata.

#### F-1-15 — Two of the three required facts fall below the desktop first screen

- Location: live home at 1440 × 900.
- Exact facts: “Works without an account.” and “Core features are free.”
- Evidence: their top positions are y=884 and y=915; the second is clipped and the third is outside the 900 px viewport.
- Why this fails: the standard first-screen shape requires all three privacy/account/price facts before scrolling.
- Concrete fix: reduce desktop hero type/padding or arrange the facts horizontally so all three finish above the fold at 1366 × 768 and 1440 × 900.

#### F-1-16 — The How it works cross-route link does not move focus

- Location: header link `/demo` → `/#how`.
- Evidence: it scrolls the section to y=108, but `document.activeElement` remains `BODY`. SPA navigation to Privacy and browser Back correctly focus the new `h1`.
- Why this fails: a keyboard or screen-reader visitor gets visual movement without a focus or announcement target.
- Concrete fix: make the link a routed in-page navigation that focuses `#how-heading` after rendering and announces “How it works.”

### Minor copy findings

#### F-1-17 — “safe” is vague

- Location: hero helper text.
- Exact quote: “Opens a safe sample workspace.”
- Why this fails: “safe” does not name the isolation behavior.
- Rewrite: “Opens an isolated demo that cannot change extension data.”

#### F-1-18 — The price fact implies undisclosed non-core charges

- Location: hero facts.
- Exact quote: “Core features are free.”
- Why this fails: the brief says the product is free; “core” implies other paid features without naming them.
- Rewrite: “Focus Lens is free.”

#### F-1-19 — The hero asset uses an inconsistent term

- Location: hero image alt text.
- Exact quote: “A glass lens, coral guide rail, and blue dial on pale ceramic tiles.”
- Why this fails: the product calls this element a “focus rail” everywhere else.
- Rewrite: “A glass lens, coral focus rail, and blue dial on pale ceramic tiles.”

#### F-1-20 — The image caption is brand-lore copy

- Location: hero figure caption.
- Exact quote: “Glacial tools represent zoom, focus, and contrast controls.”
- Why this fails: “Glacial tools” is an invented mood label and does not help a visitor use the product.
- Concrete fix: remove the caption. The image alt already describes the asset.

#### F-1-21 — The preview heading makes a subjective speed claim

- Location: live preview heading.
- Exact quote: “Find the active control at a glance.”
- Why this fails: “at a glance” is subjective and untested; the heading should name the section.
- Rewrite: “See the focused control.”

#### F-1-22 — “Set your view” is vague out of context

- Location: How it works, step 2 heading.
- Exact quote: “Set your view.”
- Why this fails: a heading list does not reveal what is being set.
- Rewrite: “Choose site zoom and contrast.”

#### F-1-23 — “Save useful controls” is vague out of context

- Location: How it works, step 3 heading.
- Exact quote: “Save useful controls.”
- Why this fails: it omits the product term and result.
- Rewrite: “Save controls as waypoints.”

#### F-1-24 — The privacy heading is a metaphor

- Location: privacy section heading.
- Exact quote: “Your pages remain yours.”
- Why this fails: it does not name storage, page capture, or network behavior.
- Rewrite: “What Focus Lens stores.”

#### F-1-25 — “selector” is developer jargon in visitor copy

- Locations: landing privacy text and README.
- Exact quotes: “waypoint selectors” and “a control selector.”
- Why this fails: the reader should not need DOM terminology to understand saved data.
- Rewrites: “Focus Lens stores each site's view settings and saved control locations in your browser.” “A waypoint stores the name you enter and the page location needed to find that control again.”

#### F-1-26 — One README sentence exceeds 22 words

- Location: README line 3.
- Exact quote, 23 words: “It adds a large focus rail, a temporary reading lane, per-site zoom and contrast settings, named keyboard waypoints, and an exportable shortcut sheet.”
- Rewrite: “It adds a focus rail, reading lane, and per-site zoom and contrast settings. You can save waypoints and export a shortcut sheet.”

#### F-1-27 — The footer points to design notes a visitor cannot open

- Location: site footer.
- Exact quote: “Generated art disclosed in the design notes.”
- Why this fails: the text names no result and provides no link to the repository-only notes.
- Rewrite: “Hero image generated for Focus Lens.” Or link **Image provenance** to a public provenance page.

## Copy audit

Counts treat a hyphenated expression as one word and omit punctuation-only marks. Sample record values are included because they are visible interface copy. No banned word from the attached plain-words list appears.

### Landing page

| Location | Copy | Words | Flag |
| --- | --- | ---: | --- |
| Skip link | Skip to main content | 4 | — |
| Wordmark | Focus Lens | 2 | — |
| Header | Demo | 1 | — |
| Header | How it works | 3 | — |
| Header | Privacy | 1 | — |
| Hero label | Browser support for low vision | 5 | — |
| Hero h1 | Keep your place in dense web apps | 8 | — |
| Hero | For low-vision workers who lose keyboard focus in complex browser tools. | 10 | — |
| Hero action | Try it with sample data | 5 | — |
| Hero helper | Opens a safe sample workspace. | 5 | F-1-17 |
| Hero fact | Settings stay in your browser. | 5 | F-1-5 |
| Hero fact | Works without an account. | 4 | — |
| Hero fact | Core features are free. | 4 | F-1-18 |
| Image alt | A glass lens, coral guide rail, and blue dial on pale ceramic tiles. | 13 | F-1-19 |
| Image caption | Glacial tools represent zoom, focus, and contrast controls. | 8 | F-1-20 |
| Section label | Live preview | 2 | — |
| Preview h2 | Find the active control at a glance | 8 | F-1-21 |
| Preview | Focus Lens adds a coral rail outside the page control. | 10 | — |
| Preview | It never changes the control itself. | 6 | F-1-7 |
| Sample address | work.example.test | 1 | — |
| Sample menu | Records | 1 | — |
| Sample menu | Overview | 1 | — |
| Sample menu | Access review | 2 | — |
| Sample menu | Reports | 1 | — |
| Sample label | Quarterly review | 2 | — |
| Sample h3 | Access requests | 2 | — |
| Sample field | Search requests | 2 | — |
| Sample value | Morgan Lee | 2 | — |
| Sample button | Open record | 2 | — |
| Section label | How it works | 3 | — |
| How-to h2 | Set the view once for each site | 8 | — |
| Step h3 | Open Focus Lens | 3 | — |
| Step | Use the toolbar button on the web page you need. | 10 | — |
| Step h3 | Set your view | 3 | F-1-22 |
| Step | Choose zoom, contrast, focus width, and a reading lane. | 9 | F-1-28 |
| Step h3 | Save useful controls | 3 | F-1-23 |
| Step | Name the focused control so you can return to it later. | 11 | — |
| Action | Download the Chrome extension | 4 | F-1-11 |
| Section label | Scope and privacy | 3 | — |
| Privacy h2 | Your pages remain yours | 4 | F-1-24 |
| Privacy | Focus Lens stores view settings and waypoint selectors in local browser storage. | 11 | F-1-5, F-1-25 |
| Privacy | Waypoints use the name you enter and a control selector. | 10 | F-1-25 |
| Privacy | They never store page text. | 5 | — |
| Privacy | Browser shortcuts can conflict with site shortcuts. | 7 | F-1-29 |
| Privacy | You can change them in your extension settings. | 8 | F-1-29 |
| Footer name | Focus Lens | 2 | — |
| Footer | Visible focus and keyboard orientation for dense web apps. | 9 | — |
| Footer links | Privacy / Terms / Built by Param Factory | 1 / 1 / 4 | — |
| External-link notice | (external site) | 2 | — |
| Footer | Version 1.0.0. | 2 | — |
| Footer | Generated art disclosed in the design notes. | 7 | F-1-27 |

Landing actions mostly name their result. **Try it with sample data** and **Download the Chrome extension** are clear labels, but the demo banner’s **Start for real** label is not; that issue is included in F-1-11.

### README

| Copy | Words | Flag |
| --- | ---: | --- |
| Focus Lens | 2 | — |
| Focus Lens is a free Chrome extension for low-vision knowledge workers who use dense browser applications. | 16 | — |
| It adds a large focus rail, a temporary reading lane, per-site zoom and contrast settings, named keyboard waypoints, and an exportable shortcut sheet. | 23 | F-1-26 |
| All settings stay in Chrome extension storage. | 7 | F-1-5; “extension storage” is technical |
| After its local page loads, Focus Lens controls make no network requests, so no data leaves while you use them. | 20 | — |
| A waypoint stores the name you enter and a control selector, never page text. | 14 | F-1-25 |
| Try the isolated sample at focus-lens.sociobot.in/demo. | 9 | — |
| Demo changes use the separate demo:focus-lens:settings browser key and can be reset from the banner. | 17 | Technical but needed for verification |
| Install the packaged extension | 4 | — |
| Run npm ci && npm run build. | 6 | — |
| Open chrome://extensions. | 3 | — |
| Turn on Developer mode. | 4 | — |
| Select Load unpacked. | 3 | — |
| Choose dist/extension. | 3 | — |
| Open the Focus Lens toolbar button on a regular web page. | 11 | — |
| The extension uses activeTab, scripting, and storage. | 7 | Exact permission names are appropriate here |
| It does not request access to every site in advance. | 10 | — |
| Use Focus Lens | 3 | — |
| Set zoom, contrast, focus width, and focus color for the current site. | 12 | F-1-28 |
| Turn the reading lane on while scanning a dense page. | 10 | — |
| Focus a useful page control, enter a waypoint name, then select Save focus. | 13 | — |
| Open a saved waypoint from the panel. | 7 | — |
| Export the keyboard shortcut sheet from the panel. | 8 | — |
| Keyboard commands toggle the focus rail and reading lane or change page zoom. | 13 | F-1-6 |
| Chrome may reserve some shortcuts. | 5 | F-1-29 |
| Change extension shortcuts at chrome://extensions/shortcuts if needed. | 9 | F-1-29 |
| Develop and test | 3 | — |
| Requirements: Node.js 20 or later, npm, and Chromium for Playwright. | 11 | — |
| Every command listed in .factory/claims.json runs immediately after npm ci; it does not require WXT's ignored generated files. | 20 | Developer terminology is appropriate here |
| npm run build produces: | 4 | — |
| dist/extension/ — unpacked Manifest V3 extension. | 6 | Developer terminology is appropriate here |
| dist/site/ — static site with index.html at its root. | 10 | — |
| dist/site/downloads/focus-lens-chrome.zip — packaged extension. | 7 | — |
| The exact static deployment command is npm run build:site, but run npm run build when the downloadable extension also needs rebuilding. | 22 | — |
| Privacy and limits | 3 | — |
| See /privacy and /terms on the deployed site. | 8 | — |
| Focus Lens is not a screen-reader replacement and does not bypass site security. | 13 | F-1-8 |
| Test it with each workplace application before relying on it. | 10 | — |
| License | 1 | — |
| MIT. | 1 | — |
| See LICENSE. | 2 | — |

## Demo and sandbox evidence

- One-click entry: **PASS** from the home hero to `/demo`.
- Persistent banner: **PASS**; it shows “Demo — sample data, nothing is saved,” **Reset demo**, and **Start for real**.
- Realistic seed: **PASS in the document**, with Morgan Lee / Atlas CRM / Needs review, Sam Rivera / Ledger / Waiting, and Rina Patel / Atlas CRM / Ready.
- First demo screen: **FAIL on phone**; see F-1-1.
- Waypoint fidelity: **FAIL**; see F-1-2.
- Reset: **PASS**; it removes `demo:focus-lens:settings` and restores defaults.
- Isolation: **PASS in the exercised page-storage boundary**. A sentinel key named `focus-lens:real-sentinel` remained unchanged through demo changes and Reset.
- Requests: **PASS**. The initial page load requested only same-origin HTML, JS, CSS, and hero art. Changing settings, saving/opening a waypoint, and exporting shortcuts generated zero requests.
- Offline: no offline claim is made, so no offline claim was tested.

## Claims gate

All ten exact commands were run after `npm ci` in fresh clone `/tmp/focus-lens-review-claims.8tanHL`. Every command exited 0. “Command pass” below does not override a coverage failure.

| Claim | Command result | Review result |
| --- | --- | --- |
| `visible-focus` | PASS | **UNTESTED PART** — high contrast is not measured; F-1-4 |
| `reading-lane` | PASS | PASS — visible then hidden |
| `site-view` | PASS | **UNTESTED PART** — one origin only; F-1-3 |
| `named-waypoints` | PASS | **FALSE POSITIVE** — hard-coded index target; F-1-2 |
| `shortcut-export` | PASS | PASS — filename and shortcut content inspected |
| `local-private` | PASS | PASS for the demo key and Reset; extension-storage copy remains unlisted in F-1-5 |
| `no-egress` | PASS | PASS — zero post-load requests |
| `no-page-text-capture` | PASS | **UNTESTED PART** — demo stores no selector; F-1-2 |
| `exact-permissions` | PASS | PASS — manifest and ZIP have only `activeTab`, `scripting`, and `storage`, with no host permissions |
| `no-account-free` | PASS | PASS — no account gate and ZIP downloads |

Unlisted claim findings are F-1-5 through F-1-8 and F-1-28 through F-1-29. Because claims remain untested, the claims gate is not accepted despite green command exits.

## History recheck

No `.factory/review-*.md` or `.factory/polish-*.md` existed before this review. I read the current handoff and all three retained verification reports.

| Earlier issue or gap | Current result |
| --- | --- |
| Clean-checkout claim commands failed | Fixed; all ten exact commands pass from a fresh clone |
| Hashed assets lacked immutable caching | Fixed; live assets and download return one-year immutable caching |
| Required waypoint errors were not visible/announced | Fixed; visible guidance, `role="alert"`, `aria-invalid`, and focus recovery are present |
| Contrast radios had invisible keyboard focus | Fixed in demo and popup; computed visible label outline is 4 px coral |
| Privacy and permission claims were absent | Partly fixed; entries were added, but F-1-2 through F-1-8 remain |
| Unknown routes returned HTTP 200 | Fixed; unknown routes return 404 |
| Standalone touch targets were under 44 px | Fixed in tested routes |
| Development dependency advisories | Not fixed; re-raised as F-1-9 |
| Real toolbar action could not be exercised | Not fixed in the retained suite; re-raised as F-1-10 |

Earlier reports did not assign finding IDs, so the unresolved items receive review-1 IDs here.

## Structure, accessibility, and visual identity

- Route titles: pass in the rendered browser for `/`, `/demo`, `/privacy`, `/terms`, `/404`, and an unknown route.
- One `h1`, one `main`, `lang="en"`, favicon, and home canonical: pass.
- Route-specific metadata: fail; see F-1-14.
- True HTTP 404: pass. Standard 404 shell: fail; see F-1-13.
- Deep links and reload: pass for `/demo`, `/privacy`, and `/terms`.
- SPA navigation and Back: pass; route `h1` receives focus. The cross-route How it works link fails focus handling; see F-1-16.
- Link crawl: all HTTP links returned 200; `mailto:` was intentionally exempt. No dead link was found.
- Axe: zero violations on live `/` and `/demo`; the repository suite also reports zero serious/critical issues on public routes.
- 200% text at 390 px: no horizontal overflow or off-screen interactive target was detected.
- Reduced motion: covered by the passing suite and CSS fallback.
- `verify-url.sh`: pass after providing its required evidence directory; title, language, one `h1`, main, alt text, labeled buttons, and console checks passed.
- Visual identity: pass. The glacial ceramic palette, serif/sans pairing, asymmetric tiles, coral rail, original hero art, and reserved motion are distinct from a generic SaaS template and are documented in `.factory/design.md`.
- Initial live payload: 14,342 B JavaScript, 13,000 B CSS, and 38,506 B hero art. The JavaScript budget passes.

## Local quality gates

- `npm test`: PASS — 10 Vitest tests and 15 Playwright tests.
- `npx tsc --noEmit`: PASS.
- `npm run build`: PASS; `dist/site`, `dist/extension`, and the ZIP were produced.
- `unzip -t dist/site/downloads/focus-lens-chrome.zip`: PASS.
- `npm audit --omit=dev --audit-level=high`: PASS with zero production vulnerabilities.
- Full `npm audit`: FAIL as a zero-finding gate; see F-1-9.
- No console or page errors occurred on normal live routes.

## Missed leverage

No AI feature is warranted. The brief is a local assistive browser tool, and an AI call would add privacy and network cost without helping its core orientation job. Cloud sync would conflict with the local-only constraint. Shortcut export exists. The obvious missing completion path is public installation, recorded as F-1-11; import/export of settings is not clearly implied by the brief.

## What would make this perfect

Resolve every finding above, then repeat the review from a fresh context and clone. The acceptance run must show the seeded sample and active focus treatment in the first phone viewport; store and reopen real selector-backed demo waypoints; prove per-site, high-contrast, extension-storage, keyboard, non-mutation, and security statements with exact claim tests; provide a usable install path; remove inert demo controls; unify 404 and route metadata; fix focus navigation and desktop hero fit; clear the copy flags; remove the development advisories; and retain a repeatable packaged-extension end-to-end check. A new verdict can be `PASS` only if that full rerun produces zero findings and no untested claim.
