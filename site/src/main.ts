import './style.css';
import { shortcutsText, validateWaypointName, type ContrastMode, type Waypoint } from '../../lib/settings';

type DemoSiteSettings = {
  zoom: number;
  contrast: ContrastMode;
  focusVisible: boolean;
  focusWidth: number;
  focusColor: string;
  laneVisible: boolean;
  waypoints: Waypoint[];
};

type DemoSiteId = 'atlas.work.test' | 'ledger.work.test';
type DemoStore = { version: 2; currentSite: DemoSiteId; sites: Record<DemoSiteId, DemoSiteSettings> };
type RouteMetadata = { title: string; description: string; path: string };

const app = document.querySelector<HTMLDivElement>('#app')!;
const DEMO_KEY = 'demo:focus-lens:settings';
const SITE_URL = 'https://focus-lens.sociobot.in';
let selectedDemoControl = '#sample-search';

const demoSiteLabels: Record<DemoSiteId, string> = {
  'atlas.work.test': 'Atlas case desk',
  'ledger.work.test': 'Ledger approvals'
};

const defaultSite = (overrides: Partial<DemoSiteSettings> = {}): DemoSiteSettings => ({
  zoom: 120,
  contrast: 'strong',
  focusVisible: true,
  focusWidth: 6,
  focusColor: '#c63d2f',
  laneVisible: true,
  waypoints: [
    { id: 'seed-search', name: 'Search cases', selector: '#sample-search' },
    { id: 'seed-open', name: 'Open first record', selector: '#sample-open' }
  ],
  ...overrides
});

const freshDemo = (): DemoStore => ({
  version: 2,
  currentSite: 'atlas.work.test',
  sites: {
    'atlas.work.test': defaultSite(),
    'ledger.work.test': defaultSite({ zoom: 90, contrast: 'standard', focusWidth: 4, focusColor: '#075d72', laneVisible: false, waypoints: [] })
  }
});

const metadata: Record<string, RouteMetadata> = {
  '/': { title: 'Focus Lens — Keep keyboard focus visible', description: 'Keep keyboard focus visible in dense web apps with per-site view settings, a reading lane, and named waypoints.', path: '/' },
  '/demo': { title: 'Demo — Focus Lens', description: 'Try Focus Lens controls with isolated sample cases. Demo changes cannot affect extension data.', path: '/demo' },
  '/install': { title: 'Install — Focus Lens', description: 'Download the Focus Lens extension ZIP and follow the Chrome Developer mode installation steps.', path: '/install' },
  '/privacy': { title: 'Privacy — Focus Lens', description: 'Read what Focus Lens stores in Chrome and how to remove your local settings.', path: '/privacy' },
  '/terms': { title: 'Terms — Focus Lens', description: 'Read the terms and practical limits for using the Focus Lens browser extension.', path: '/terms' },
  '/404': { title: 'Page not found — Focus Lens', description: 'The requested Focus Lens page was not found.', path: '/404' }
};

const route = () => {
  const path = location.pathname.replace(/\/$/, '') || '/';
  if (path === '/' && new URLSearchParams(location.search).get('demo') === '1') return renderDemo();
  if (path === '/demo') return renderDemo();
  if (path === '/install') return renderInstall();
  if (path === '/privacy') return renderLegal('privacy');
  if (path === '/terms') return renderLegal('terms');
  if (path === '/404') return renderNotFound();
  if (path !== '/') return renderNotFound();
  renderHome();
};

const shell = (body: string, active = '') => `
  <header class="site-header">
    <a class="wordmark" href="/" data-link aria-label="Focus Lens home"><span class="wordmark-mark" aria-hidden="true"></span><span>Focus Lens</span></a>
    <nav aria-label="Main navigation">
      <a href="/demo" data-link ${active === 'demo' ? 'aria-current="page"' : ''}>Demo</a>
      <a href="/#how" data-link>How it works</a>
      <a href="/install" data-link ${active === 'install' ? 'aria-current="page"' : ''}>Install</a>
      <a href="/privacy" data-link ${active === 'privacy' ? 'aria-current="page"' : ''}>Privacy</a>
    </nav>
  </header>
  ${body}
  <footer class="site-footer">
    <p><strong>Focus Lens</strong><br />Visible focus and keyboard orientation for dense web apps.</p>
    <nav aria-label="Footer navigation"><a href="/privacy" data-link>Privacy</a><a href="/terms" data-link>Terms</a><a href="https://sociobot.in" rel="external">Built by Param Factory <span class="sr-only">(external site)</span></a></nav>
    <p>Version 1.0.0 · Hero image generated for Focus Lens.</p>
  </footer>`;

function renderHome() {
  setMetadata(metadata['/']);
  app.innerHTML = shell(`
    <main id="main">
      <section class="hero shell-grid">
        <div class="hero-copy">
          <p class="kicker">Browser support for low vision</p>
          <h1 tabindex="-1">Keep your place in dense web apps</h1>
          <p class="lede">For low-vision workers who lose keyboard focus in complex browser tools.</p>
          <div class="hero-action"><a class="button primary" href="/?demo=1" data-link>Try it with sample data</a><span>Opens an isolated demo that cannot change extension data.</span></div>
          <ul class="plain-facts" aria-label="Product facts"><li>Settings stay in Chrome.</li><li>Works without an account.</li><li>Focus Lens is free.</li></ul>
        </div>
        <figure class="hero-art"><img src="/assets/focus-lens-hero.webp" width="1280" height="853" alt="A glass lens, coral focus rail, and blue dial on pale ceramic tiles." fetchpriority="high" decoding="async" /></figure>
      </section>

      <section class="preview-section" aria-labelledby="preview-heading">
        <div class="section-intro"><p class="kicker">Live preview</p><h2 id="preview-heading">See the focused control</h2><p>Focus Lens adds a coral rail and pale halo around the page control.</p></div>
        <div class="browser-frame">
          <div class="browser-top" aria-hidden="true"><i></i><i></i><i></i><span>work.example.test</span></div>
          <div class="preview-workspace">
            <aside aria-label="Sample app menu"><strong>Records</strong><span>Overview</span><span class="selected">Access review</span><span>Reports</span></aside>
            <div class="preview-content"><p class="micro">Quarterly review</p><h3>Access requests</h3><label for="preview-search">Search requests</label><input id="preview-search" value="Morgan Lee" /><button class="sample-focus">Open record <span aria-hidden="true">→</span></button></div>
            <div class="preview-lane" aria-hidden="true"></div>
          </div>
        </div>
      </section>

      <section id="how" class="how-section" aria-labelledby="how-heading">
        <div class="section-intro"><p class="kicker">How it works</p><h2 id="how-heading" tabindex="-1">Set the view once for each site</h2></div>
        <ol class="steps">
          <li><span>1</span><div><h3>Open Focus Lens</h3><p>Use the toolbar button on the web page you need.</p></div></li>
          <li><span>2</span><div><h3>Choose site zoom and contrast</h3><p>Set zoom, contrast, focus rail width, color, and reading lane.</p></div></li>
          <li><span>3</span><div><h3>Save controls as waypoints</h3><p>Focus a control and name it so you can return later.</p></div></li>
        </ol>
        <div class="install-actions"><a class="button secondary" href="/downloads/focus-lens-chrome.zip" download>Download extension ZIP</a><a href="/install" data-link>Read installation steps</a></div>
      </section>

      <section class="limits-section" aria-labelledby="limits-heading">
        <div><p class="kicker">Scope and privacy</p><h2 id="limits-heading">What Focus Lens stores</h2></div>
        <div class="limits-copy"><p>Focus Lens stores each site's view settings and saved control locations in Chrome.</p><p>A waypoint stores your name and the page location needed to find that control again. It does not store page text.</p><p>Focus Lens controls make no network requests after their local files load.</p></div>
      </section>
    </main>`);
  const toHow = location.hash === '#how';
  finishRoute(toHow ? 'How it works' : 'Keep your place in dense web apps', toHow ? '#how-heading' : 'h1');
}

function readDemo(): DemoStore {
  const fallback = freshDemo();
  try {
    const parsed = JSON.parse(localStorage.getItem(DEMO_KEY) || '{}') as Partial<DemoStore>;
    if (parsed.version !== 2 || !parsed.sites || !parsed.currentSite || !(parsed.currentSite in parsed.sites)) return fallback;
    return {
      version: 2,
      currentSite: parsed.currentSite,
      sites: {
        'atlas.work.test': { ...fallback.sites['atlas.work.test'], ...parsed.sites['atlas.work.test'], waypoints: Array.isArray(parsed.sites['atlas.work.test']?.waypoints) ? parsed.sites['atlas.work.test'].waypoints : fallback.sites['atlas.work.test'].waypoints },
        'ledger.work.test': { ...fallback.sites['ledger.work.test'], ...parsed.sites['ledger.work.test'], waypoints: Array.isArray(parsed.sites['ledger.work.test']?.waypoints) ? parsed.sites['ledger.work.test'].waypoints : fallback.sites['ledger.work.test'].waypoints }
      }
    };
  } catch { return fallback; }
}

function renderDemo() {
  setMetadata(metadata['/demo']);
  const store = readDemo();
  const state = store.sites[store.currentSite];
  app.innerHTML = shell(`
    <div class="demo-banner" role="status"><strong>Demo — sample data, nothing is saved</strong><span><button id="reset-demo" class="text-button">Reset demo</button><a href="/install" data-link>Install Focus Lens</a></span></div>
    <main id="main" class="demo-main">
      <div class="demo-title"><p class="kicker">Sample workspace</p><h1 tabindex="-1">Adjust a busy page without losing focus</h1><p>Choose a sample control, then save its exact location as a waypoint.</p></div>
      <div class="demo-layout">
        <section class="sample-app" aria-labelledby="sample-app-heading">
          <div class="sample-app-bar"><span>${escapeText(demoSiteLabels[store.currentSite])}</span><span>Sample account</span></div>
          <div class="sample-body" data-contrast="${state.contrast}" data-zoom="${state.zoom}" data-focus-visible="${state.focusVisible}" data-focus-width="${state.focusWidth}" data-focus-color="${state.focusColor}">
            <nav aria-label="Sample application"><strong>Case desk</strong><ul><li aria-current="page">Queues</li><li>Dashboard</li><li>Reports</li></ul></nav>
            <div class="sample-content">
              <p class="micro">Monday queue</p><h2 id="sample-app-heading">Open access cases</h2>
              <div class="search-row"><label for="sample-search">Search cases</label><input id="sample-search" class="sample-control" data-demo-selector="#sample-search" data-selected="true" value="renewal" /></div>
              <table><caption>Three sample access cases</caption><thead><tr><th>Person</th><th>System</th><th>Status</th></tr></thead><tbody><tr><td>Morgan Lee</td><td>Atlas CRM</td><td>Needs review</td></tr><tr><td>Sam Rivera</td><td>Ledger</td><td>Waiting</td></tr><tr><td>Rina Patel</td><td>Atlas CRM</td><td>Ready</td></tr></tbody></table>
              <button id="sample-open" class="sample-open sample-control" data-demo-selector="#sample-open">Open Morgan Lee</button>
              <section id="sample-record" class="sample-record" aria-labelledby="sample-record-heading" hidden><h3 id="sample-record-heading" tabindex="-1">Morgan Lee</h3><p>Atlas CRM renewal · Needs review</p><button id="sample-close">Close record</button></section>
            </div>
            <div class="demo-reading-lane" ${state.laneVisible ? '' : 'hidden'} aria-hidden="true"></div>
          </div>
        </section>

        <section class="demo-panel" aria-labelledby="demo-controls-heading">
          <h2 id="demo-controls-heading">Focus Lens controls</h2>
          <label class="site-picker" for="demo-site"><span>Sample site</span><select id="demo-site">${(Object.keys(demoSiteLabels) as DemoSiteId[]).map((id) => `<option value="${id}" ${store.currentSite === id ? 'selected' : ''}>${escapeText(demoSiteLabels[id])}</option>`).join('')}</select></label>
          <label class="control-label" for="demo-zoom"><span>Zoom</span><output id="demo-zoom-output">${state.zoom}%</output></label><input id="demo-zoom" type="range" min="80" max="160" step="10" value="${state.zoom}" />
          <fieldset><legend>Contrast</legend><div class="segment">${(['standard', 'strong', 'dim'] as const).map((value) => `<label><input type="radio" name="demo-contrast" value="${value}" ${state.contrast === value ? 'checked' : ''}/>${value[0].toUpperCase() + value.slice(1)}</label>`).join('')}</div></fieldset>
          <label class="check-label"><input id="demo-focus" type="checkbox" ${state.focusVisible ? 'checked' : ''}/>Show the focus rail</label>
          <label class="control-label" for="demo-focus-width"><span>Focus rail width</span><output id="demo-width-output">${state.focusWidth} px</output></label><input id="demo-focus-width" type="range" min="3" max="10" step="1" value="${state.focusWidth}" />
          <label class="site-picker" for="demo-focus-color"><span>Focus rail color</span><select id="demo-focus-color"><option value="#c63d2f" ${state.focusColor === '#c63d2f' ? 'selected' : ''}>Coral</option><option value="#075d72" ${state.focusColor === '#075d72' ? 'selected' : ''}>Mineral blue</option><option value="#7b2cbf" ${state.focusColor === '#7b2cbf' ? 'selected' : ''}>Violet</option><option value="#111111" ${state.focusColor === '#111111' ? 'selected' : ''}>Black</option></select></label>
          <label class="check-label"><input id="demo-lane" type="checkbox" ${state.laneVisible ? 'checked' : ''}/>Show the reading lane</label>
          <h3>Named waypoints</h3><p id="selected-control" class="selected-control">Selected control: Search cases</p>
          <form id="demo-waypoint-form" novalidate><label for="demo-waypoint">Waypoint name <span aria-hidden="true">(required)</span></label><p id="demo-waypoint-guidance" class="help-text">Required. Focus a sample control, enter a name, then save it.</p><div class="input-row"><input id="demo-waypoint" required maxlength="40" aria-describedby="selected-control demo-waypoint-guidance demo-waypoint-error"/><button>Save waypoint</button></div><p id="demo-waypoint-error" class="validation-error" role="alert" hidden></p></form>
          <ul id="demo-waypoints" class="demo-waypoints">${state.waypoints.map((waypoint) => `<li><button data-waypoint="${escapeText(waypoint.id)}">${escapeText(waypoint.name)}</button><button class="remove-waypoint" data-remove="${escapeText(waypoint.id)}" aria-label="Remove ${escapeText(waypoint.name)}">Remove</button></li>`).join('')}</ul>
          ${state.waypoints.length ? '' : '<p class="empty-state">Saved sample controls will appear here. Focus one above to add it.</p>'}
          <button id="demo-export" class="button secondary">Export shortcuts</button><p id="demo-status" class="status" aria-live="polite">Demo changes use a separate temporary storage key.</p>
        </section>
      </div>
    </main>`, 'demo');
  bindDemo(store);
  finishRoute('Adjust a busy page without losing focus');
}

function bindDemo(store: DemoStore) {
  const state = store.sites[store.currentSite];
  const sampleBody = document.querySelector<HTMLElement>('.sample-body')!;
  const persist = () => localStorage.setItem(DEMO_KEY, JSON.stringify(store));
  const visual = () => {
    sampleBody.dataset.zoom = String(state.zoom); sampleBody.dataset.contrast = state.contrast; sampleBody.dataset.focusVisible = String(state.focusVisible);
    sampleBody.dataset.focusWidth = String(state.focusWidth); sampleBody.dataset.focusColor = state.focusColor;
    document.querySelector('#demo-zoom-output')!.textContent = `${state.zoom}%`; document.querySelector('#demo-width-output')!.textContent = `${state.focusWidth} px`;
    document.querySelector<HTMLElement>('.demo-reading-lane')!.hidden = !state.laneVisible;
  };
  document.querySelector<HTMLSelectElement>('#demo-site')!.addEventListener('change', (event) => { store.currentSite = (event.target as HTMLSelectElement).value as DemoSiteId; selectedDemoControl = '#sample-search'; persist(); renderDemo(); });
  const zoom = document.querySelector<HTMLInputElement>('#demo-zoom')!;
  zoom.addEventListener('input', () => { state.zoom = Number(zoom.value); persist(); visual(); });
  document.querySelectorAll<HTMLInputElement>('input[name="demo-contrast"]').forEach((input) => input.addEventListener('change', () => { state.contrast = input.value as ContrastMode; persist(); visual(); }));
  document.querySelector<HTMLInputElement>('#demo-focus')!.addEventListener('change', (event) => { state.focusVisible = (event.target as HTMLInputElement).checked; persist(); visual(); });
  const width = document.querySelector<HTMLInputElement>('#demo-focus-width')!;
  width.addEventListener('input', () => { state.focusWidth = Number(width.value); persist(); visual(); });
  document.querySelector<HTMLSelectElement>('#demo-focus-color')!.addEventListener('change', (event) => { state.focusColor = (event.target as HTMLSelectElement).value; persist(); visual(); });
  document.querySelector<HTMLInputElement>('#demo-lane')!.addEventListener('change', (event) => { state.laneVisible = (event.target as HTMLInputElement).checked; persist(); visual(); });

  const waypointInput = document.querySelector<HTMLInputElement>('#demo-waypoint')!;
  const setWaypointError = (message: string | null) => {
    const error = document.querySelector<HTMLElement>('#demo-waypoint-error')!;
    waypointInput.setAttribute('aria-invalid', String(Boolean(message))); error.textContent = message || ''; error.hidden = !message;
  };
  const selectControl = (control: HTMLElement) => {
    selectedDemoControl = control.dataset.demoSelector || '#sample-search';
    document.querySelectorAll<HTMLElement>('[data-demo-selector]').forEach((item) => { item.dataset.selected = String(item === control); });
    document.querySelector('#selected-control')!.textContent = `Selected control: ${selectedDemoControl === '#sample-open' ? 'Open Morgan Lee' : 'Search cases'}`;
  };
  document.querySelectorAll<HTMLElement>('[data-demo-selector]').forEach((control) => control.addEventListener('focus', () => selectControl(control)));
  document.querySelector<HTMLFormElement>('#demo-waypoint-form')!.addEventListener('submit', (event) => {
    event.preventDefault(); const validationMessage = validateWaypointName(waypointInput.value); setWaypointError(validationMessage);
    if (validationMessage) return waypointInput.focus();
    state.waypoints.push({ id: crypto.randomUUID(), name: waypointInput.value.trim(), selector: selectedDemoControl }); persist(); renderDemo();
  });
  waypointInput.addEventListener('input', () => setWaypointError(null));
  document.querySelectorAll<HTMLButtonElement>('[data-remove]').forEach((button) => button.addEventListener('click', () => { state.waypoints = state.waypoints.filter((item) => item.id !== button.dataset.remove); persist(); renderDemo(); }));
  document.querySelectorAll<HTMLButtonElement>('[data-waypoint]').forEach((button) => button.addEventListener('click', () => {
    const waypoint = state.waypoints.find((item) => item.id === button.dataset.waypoint); const target = waypoint ? document.querySelector<HTMLElement>(waypoint.selector) : null;
    if (!target) { document.querySelector('#demo-status')!.textContent = 'That sample control is no longer available.'; return; }
    target.focus(); selectControl(target); document.querySelector('#demo-status')!.textContent = `Opened ${waypoint!.name}.`;
  }));
  document.querySelector('#reset-demo')!.addEventListener('click', () => { localStorage.removeItem(DEMO_KEY); selectedDemoControl = '#sample-search'; renderDemo(); });
  document.querySelector('#demo-export')!.addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([shortcutsText], { type: 'text/plain' })); const link = document.createElement('a'); link.href = url; link.download = 'focus-lens-shortcuts.txt'; link.click(); URL.revokeObjectURL(url);
    document.querySelector('#demo-status')!.textContent = 'Shortcut file exported.';
  });
  document.querySelector('#sample-open')!.addEventListener('click', () => { document.querySelector<HTMLElement>('#sample-record')!.hidden = false; document.querySelector<HTMLElement>('#sample-record-heading')!.focus(); });
  document.querySelector('#sample-close')!.addEventListener('click', () => { document.querySelector<HTMLElement>('#sample-record')!.hidden = true; document.querySelector<HTMLElement>('#sample-open')!.focus(); });
  const search = document.querySelector<HTMLInputElement>('#sample-search')!;
  search.addEventListener('input', () => { const query = search.value.toLowerCase(); document.querySelectorAll<HTMLTableRowElement>('tbody tr').forEach((row) => { row.hidden = !row.textContent!.toLowerCase().includes(query); }); });
}

function renderInstall() {
  setMetadata(metadata['/install']);
  app.innerHTML = shell(`<main id="main" class="legal-page install-page"><p class="kicker">Chrome installation</p><h1 tabindex="-1">Install Focus Lens in Chrome</h1><p>The current release is an unpacked extension ZIP. Chrome Developer mode is required until a store release is available.</p><a class="button primary" href="/downloads/focus-lens-chrome.zip" download>Download extension ZIP</a><h2>Load the extension</h2><ol class="install-steps"><li>Extract the downloaded ZIP to a folder you will keep.</li><li>Open <code>chrome://extensions</code> in Chrome.</li><li>Turn on <strong>Developer mode</strong>.</li><li>Select <strong>Load unpacked</strong>.</li><li>Choose the extracted folder that contains <code>manifest.json</code>.</li><li>Pin Focus Lens, then open a regular web page and select its toolbar button.</li></ol><p>The ZIP also includes <code>INSTALL.txt</code> with these steps.</p><h2>Update or remove it</h2><p>Return to <code>chrome://extensions</code>. Use Reload after replacing the folder, or Remove to delete Focus Lens and its settings.</p></main>`, 'install');
  finishRoute('Install Focus Lens in Chrome');
}

function renderLegal(page: 'privacy' | 'terms') {
  const privacy = page === 'privacy'; setMetadata(metadata[`/${page}`]);
  app.innerHTML = shell(`<main id="main" class="legal-page"><p class="kicker">${privacy ? 'Privacy' : 'Terms'}</p><h1 tabindex="-1">${privacy ? 'Your settings stay in Chrome' : 'Use Focus Lens as an assistive tool'}</h1>
    ${privacy ? `<h2>What Focus Lens stores</h2><p>The extension stores each site's zoom, contrast, focus rail, reading lane, and waypoint settings in Chrome storage.</p><p>A waypoint contains your name and the page location needed to find the control again. It does not store page text.</p><h2>What Focus Lens sends</h2><p>Focus Lens controls make no network requests after their local files load.</p><h2>How to remove your data</h2><p>Remove the extension or clear its data from the Chrome extension settings page.</p>` : `<h2>What the extension provides</h2><p>Focus Lens adds visual orientation controls to regular web pages. It is free and provided without a service guarantee.</p><h2>Your responsibility</h2><p>Keep Chrome updated. Check important work before you submit it.</p><h2>Limits</h2><p>Focus Lens does not replace a screen reader, employer accommodation, or professional accessibility review.</p>`}
    <h2>Questions</h2><p>Email <a href="mailto:hello@sociobot.in">hello@sociobot.in</a>.</p><p>Effective: September 2, 2026.</p></main>`, page);
  finishRoute(privacy ? 'Your settings stay in Chrome' : 'Use Focus Lens as an assistive tool');
}

function renderNotFound() {
  setMetadata(metadata['/404']);
  app.innerHTML = shell(`<main id="main" class="not-found"><div class="lost-lens" aria-hidden="true"></div><p class="kicker">404</p><h1 tabindex="-1">This page is not here</h1><p>The address may have changed. Return to the Focus Lens home page.</p><a class="button primary" href="/" data-link>Return home</a></main>`);
  finishRoute('This page is not here');
}

function setMetadata(routeMetadata: RouteMetadata) {
  document.title = routeMetadata.title;
  setMeta('meta[name="description"]', 'content', routeMetadata.description); setMeta('meta[property="og:title"]', 'content', routeMetadata.title);
  setMeta('meta[property="og:description"]', 'content', routeMetadata.description); setMeta('meta[property="og:url"]', 'content', `${SITE_URL}${routeMetadata.path}`);
  setMeta('meta[name="twitter:title"]', 'content', routeMetadata.title); setMeta('meta[name="twitter:description"]', 'content', routeMetadata.description);
  setMeta('link[rel="canonical"]', 'href', `${SITE_URL}${routeMetadata.path}`);
}

function setMeta(selector: string, attribute: string, value: string) { document.querySelector(selector)?.setAttribute(attribute, value); }

function finishRoute(name: string, focusSelector = 'h1') {
  document.querySelector('#route-status')!.textContent = name;
  requestAnimationFrame(() => {
    const target = document.querySelector<HTMLElement>(focusSelector);
    if (focusSelector === '#how-heading') target?.scrollIntoView({ block: 'start', behavior: 'auto' }); else window.scrollTo({ top: 0, behavior: 'auto' });
    target?.focus({ preventScroll: focusSelector !== '#how-heading' });
  });
}

function escapeText(value: string) { const el = document.createElement('span'); el.textContent = value; return el.innerHTML; }

document.addEventListener('click', (event) => {
  const link = (event.target as Element).closest<HTMLAnchorElement>('a[data-link]');
  if (!link || link.origin !== location.origin || event.defaultPrevented) return;
  event.preventDefault(); history.pushState({}, '', link.href); route();
});
window.addEventListener('popstate', route);
route();
