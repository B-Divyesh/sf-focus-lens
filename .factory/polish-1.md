# Focus Lens polish round 1

- Work order: `focus-lens-polish-1`
- Reviewed candidate: `40e564d136bb72b5baf47f9dd3fdb81b62d4a7ff`
- Review report: `.factory/review-1.md`
- Repair code commit: `ce24e10`
- Local demo: `http://127.0.0.1:4173/?demo=1`
- Live product: `https://focus-lens.sociobot.in`

Every review finding is mapped below. Test names are from the committed Playwright or Vitest suite.

| Finding | Change made | Evidence |
|---|---|---|
| F-1-1 | Put the real sample application before the controls on phones. Morgan Lee, the selected search control, coral rail, and reading lane all appear in 390 × 844. | `mobile first screen shows a named case, focus rail, and reading lane`; `.factory/polish-artifacts/mobile-demo.png`; `/?demo=1` |
| F-1-2 | Replaced index-based targets with stored `{id, name, selector}` waypoints. The last focused sample control is saved and reopened by exact selector. Removal and reload preserve target fidelity. | `@claim:named-waypoints saves exact controls through removal, reordering, and reload` |
| F-1-3 | Added Atlas and Ledger sample-site namespaces with independent zoom, contrast, width, color, lane, and waypoint state. | `@claim:site-view keeps zoom, contrast, focus width, and focus color separate for each site`; `@claim:extension-storage` |
| F-1-4 | Made the demo rail a measured two-boundary treatment: configurable coral rail plus white halo. The claim test calculates both representative contrast ratios. | `@claim:visible-focus adds a large high-contrast focus rail and halo` |
| F-1-5 | Added an exact packaged-extension storage claim and a persistent Chromium test that drives the built popup and inspects real `chrome.storage.local`. | `@claim:extension-storage`; `.factory/polish-artifacts/extension-popup.png` |
| F-1-6 | Registered all four commands and tested focus/lane toggles plus 80–200% zoom bounds against the production page agent and packaged manifest/background. | `@claim:keyboard-commands` |
| F-1-7 | Removed the absolute “never changes the control” marketing sentence. A separate integration regression also snapshots the target before and after capture/restore. | `@extension page agent captures and restores the exact focused control without changing its content`; `.factory/copy-audit.md` |
| F-1-8 | Removed the vague page-security claim from the landing, terms, and README. The unsupported-page behavior remains a concrete popup error state without a public security promise. | `rg` copy audit recorded in `.factory/copy-audit.md`; route copy in `site/src/main.ts` |
| F-1-9 | Upgraded and pinned Vite 7.3.6, Vitest 3.2.7, and WXT 0.21.4. The smaller lockfile has no known advisories. | `npm audit --audit-level=low` → 0 vulnerabilities |
| F-1-10 | Committed a repeatable real-extension path. It loads the packaged MV3 build in a fresh profile, supplies a real HTTP active tab, drives the popup, uses Chrome storage, and separately exercises the production page agent. | `npm run test:extension`; `tests/e2e/extension.spec.ts`; `.factory/polish-artifacts/extension-popup.png` |
| F-1-11 | Added `/install`, labeled the artifact “Download extension ZIP,” disclosed Developer mode, published six load steps, and placed `INSTALL.txt` inside the ZIP. Demo now links to installation instead of implying store installation. | `@claim:install-package`; `unzip -p ... INSTALL.txt`; `/install` |
| F-1-12 | Replaced inert sample navigation buttons with noninteractive list text. Search filters rows, and Open Morgan Lee opens a real record state with focus recovery on close. | `sample search and record controls work` |
| F-1-13 | Deleted the separate 404 markup and CSS. The build now produces `404.html` from the same metadata document and JavaScript shell as every route. | `unknown routes return the complete designed 404 with HTTP 404`; `.factory/polish-artifacts/not-found.png` |
| F-1-14 | Added route-specific source documents and runtime metadata for title, description, canonical, Open Graph URL/title/description, and Twitter title/description. | `every route has its own metadata, one heading, landmarks, and no serious axe finding` |
| F-1-15 | Reduced desktop hero scale/padding and placed the three facts in one row. | `desktop first screen contains all three facts`; `.factory/polish-artifacts/desktop-home.png` |
| F-1-16 | Routed `/#how` through History API navigation, focused `#how-heading`, scrolled it into view, and announced “How it works.” | `How it works navigation moves focus and announces the section` |
| F-1-17 | Replaced “safe sample workspace” with “Opens an isolated demo that cannot change extension data.” | `.factory/copy-audit.md`; `@claim:demo-isolation` |
| F-1-18 | Replaced “Core features are free” with “Focus Lens is free.” | `.factory/copy-audit.md`; `@claim:no-account-free` |
| F-1-19 | Changed hero alt text from “guide rail” to the established term “focus rail.” | `.factory/copy-audit.md`; route accessibility test |
| F-1-20 | Removed the “Glacial tools” figure caption. | `.factory/copy-audit.md`; `.factory/polish-artifacts/desktop-home.png` |
| F-1-21 | Renamed the preview heading to “See the focused control.” | `.factory/copy-audit.md` |
| F-1-22 | Renamed step 2 to “Choose site zoom and contrast.” | `.factory/copy-audit.md` |
| F-1-23 | Renamed step 3 to “Save controls as waypoints.” | `.factory/copy-audit.md` |
| F-1-24 | Renamed the privacy section to “What Focus Lens stores.” | `.factory/copy-audit.md` |
| F-1-25 | Replaced visitor-facing “selector” language with “saved control locations” and “page location.” Selector remains only in developer code/tests. | `.factory/copy-audit.md`; `@claim:no-page-text-capture` |
| F-1-26 | Split the 23-word README feature sentence into short sentences. The complete public copy audit has no sentence over 22 words. | `.factory/copy-audit.md`; `README.md` |
| F-1-27 | Replaced the inaccessible design-notes reference with “Hero image generated for Focus Lens.” | `.factory/copy-audit.md`; footer on all routes |
| F-1-28 | Added focus rail width and color to the isolated demo, applied them to the sample rail, kept them per site, and persisted them. | `@claim:site-view`; `@claim:extension-storage`; `.factory/polish-artifacts/desktop-demo.png` |
| F-1-29 | Removed unsupported conflict/reassignment statements. Registered and proved the useful public statement: what each packaged command does. | `@claim:keyboard-commands`; `.factory/copy-audit.md` |

## Complete verification

- `npm run test:clean-claims`: all 13 exact claim commands passed from a new clone after `npm ci` and before a manual build.
- `npm test`: 11 unit/regression tests and 22 Chromium tests passed.
- `npx tsc --noEmit`: passed.
- `npm run build`: produced `dist/site`, route documents, `dist/extension`, and the ZIP.
- `npm audit --audit-level=low`: 0 vulnerabilities.
- `unzip -t dist/site/downloads/focus-lens-chrome.zip`: passed.
- `/opt/fleet/lib/verify-url.sh` on local build: passed with no console errors.
- Local Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.4 s, TBT 70 ms, CLS 0.
- Initial site payload: 21,431 B JavaScript, 15,541 B CSS, 38,506 B hero WebP.
- Offline suite: not applicable. Focus Lens makes no offline/PWA claim and does not register a service worker.

