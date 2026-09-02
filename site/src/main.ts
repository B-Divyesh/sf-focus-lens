import './style.css';
import { validateWaypointName } from '../../lib/settings';

type DemoSettings = {
  zoom: number;
  contrast: 'standard' | 'strong' | 'dim';
  focus: boolean;
  lane: boolean;
  waypoints: string[];
};

const app = document.querySelector<HTMLDivElement>('#app')!;
const DEMO_KEY = 'demo:focus-lens:settings';
const freshDemo: DemoSettings = { zoom: 120, contrast: 'strong', focus: true, lane: true, waypoints: ['Search cases', 'Open record'] };

const route = () => {
  const path = location.pathname.replace(/\/$/, '') || '/';
  if (path === '/demo') return renderDemo();
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
      <a href="/#how">How it works</a>
      <a href="/privacy" data-link ${active === 'privacy' ? 'aria-current="page"' : ''}>Privacy</a>
    </nav>
  </header>
  ${body}
  <footer class="site-footer">
    <p><strong>Focus Lens</strong><br />Visible focus and keyboard orientation for dense web apps.</p>
    <nav aria-label="Footer navigation"><a href="/privacy" data-link>Privacy</a><a href="/terms" data-link>Terms</a><a href="https://sociobot.in" rel="external">Built by Param Factory <span class="sr-only">(external site)</span></a></nav>
    <p>Version 1.0.0 · Generated art disclosed in the design notes.</p>
  </footer>`;

function renderHome() {
  document.title = 'Focus Lens — keep focus visible in web apps';
  setCanonical('/');
  app.innerHTML = shell(`
    <main id="main">
      <section class="hero shell-grid">
        <div class="hero-copy">
          <p class="kicker">Browser support for low vision</p>
          <h1 tabindex="-1">Keep your place in dense web apps</h1>
          <p class="lede">For low-vision workers who lose keyboard focus in complex browser tools.</p>
          <div class="hero-action">
            <a class="button primary" href="/demo" data-link>Try it with sample data</a>
            <span>Opens a safe sample workspace.</span>
          </div>
          <ul class="plain-facts" aria-label="Product facts">
            <li>Settings stay in your browser.</li>
            <li>Works without an account.</li>
            <li>Core features are free.</li>
          </ul>
        </div>
        <figure class="hero-art">
          <img src="/assets/focus-lens-hero.webp" width="1280" height="853" alt="A glass lens, coral guide rail, and blue dial on pale ceramic tiles." fetchpriority="high" decoding="async" />
          <figcaption>Glacial tools represent zoom, focus, and contrast controls.</figcaption>
        </figure>
      </section>

      <section class="preview-section" aria-labelledby="preview-heading">
        <div class="section-intro"><p class="kicker">Live preview</p><h2 id="preview-heading">Find the active control at a glance</h2><p>Focus Lens adds a coral rail outside the page control. It never changes the control itself.</p></div>
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
        <div class="section-intro"><p class="kicker">How it works</p><h2 id="how-heading">Set the view once for each site</h2></div>
        <ol class="steps">
          <li><span>1</span><div><h3>Open Focus Lens</h3><p>Use the toolbar button on the web page you need.</p></div></li>
          <li><span>2</span><div><h3>Set your view</h3><p>Choose zoom, contrast, focus width, and a reading lane.</p></div></li>
          <li><span>3</span><div><h3>Save useful controls</h3><p>Name the focused control so you can return to it later.</p></div></li>
        </ol>
        <a class="button secondary" href="/downloads/focus-lens-chrome.zip" download>Download the Chrome extension</a>
      </section>

      <section class="limits-section" aria-labelledby="limits-heading">
        <div><p class="kicker">Scope and privacy</p><h2 id="limits-heading">Your pages remain yours</h2></div>
        <div class="limits-copy"><p>Focus Lens stores view settings and waypoint selectors in local browser storage.</p><p>Waypoints use the name you enter and a control selector. They never store page text.</p><p>Browser shortcuts can conflict with site shortcuts. You can change them in your extension settings.</p></div>
      </section>
    </main>`);
  finishRoute('Keep your place in dense web apps');
}

function readDemo(): DemoSettings {
  try { return { ...freshDemo, ...JSON.parse(localStorage.getItem(DEMO_KEY) || '{}') }; }
  catch { return { ...freshDemo, waypoints: [...freshDemo.waypoints] }; }
}

function renderDemo() {
  document.title = 'Demo — Focus Lens';
  setCanonical('/demo');
  const state = readDemo();
  app.innerHTML = shell(`
    <div class="demo-banner" role="status"><strong>Demo — sample data, nothing is saved</strong><span><button id="reset-demo" class="text-button">Reset demo</button><a href="/downloads/focus-lens-chrome.zip" download>Start for real</a></span></div>
    <main id="main" class="demo-main">
      <div class="demo-title"><p class="kicker">Sample workspace</p><h1 tabindex="-1">Adjust a busy page without losing focus</h1><p>Change the panel. The sample page updates beside it.</p></div>
      <div class="demo-layout">
        <section class="demo-panel" aria-labelledby="demo-controls-heading">
          <h2 id="demo-controls-heading">Focus Lens controls</h2>
          <label class="control-label" for="demo-zoom"><span>Zoom</span><output id="demo-zoom-output">${state.zoom}%</output></label>
          <input id="demo-zoom" type="range" min="80" max="160" step="10" value="${state.zoom}" />
          <fieldset><legend>Contrast</legend><div class="segment">
            ${(['standard', 'strong', 'dim'] as const).map((value) => `<label><input type="radio" name="demo-contrast" value="${value}" ${state.contrast === value ? 'checked' : ''}/>${value[0].toUpperCase() + value.slice(1)}</label>`).join('')}
          </div></fieldset>
          <label class="check-label"><input id="demo-focus" type="checkbox" ${state.focus ? 'checked' : ''}/>Show the focus rail</label>
          <label class="check-label"><input id="demo-lane" type="checkbox" ${state.lane ? 'checked' : ''}/>Show the reading lane</label>
          <h3>Named waypoints</h3>
          <form id="demo-waypoint-form" novalidate><label for="demo-waypoint">Waypoint name <span aria-hidden="true">(required)</span></label><p id="demo-waypoint-guidance" class="help-text">Required. Enter a name for the focused sample control.</p><div class="input-row"><input id="demo-waypoint" required maxlength="40" aria-describedby="demo-waypoint-guidance demo-waypoint-error"/><button>Save waypoint</button></div><p id="demo-waypoint-error" class="validation-error" role="alert" hidden></p></form>
          <ul id="demo-waypoints" class="demo-waypoints">${state.waypoints.map((name, index) => `<li><button data-waypoint="${index}">${escapeText(name)}</button><button class="remove-waypoint" data-remove="${index}" aria-label="Remove ${escapeText(name)}">Remove</button></li>`).join('')}</ul>
          ${state.waypoints.length ? '' : '<p class="empty-state">Saved sample controls will appear here. Name one above to add it.</p>'}
          <button id="demo-export" class="button secondary">Export shortcuts</button>
          <p id="demo-status" class="status" aria-live="polite">Demo changes use a separate temporary storage key.</p>
        </section>
        <section class="sample-app" aria-labelledby="sample-app-heading">
          <div class="sample-app-bar"><span>Northstar operations</span><span>Sample account</span></div>
          <div class="sample-body" data-contrast="${state.contrast}" data-zoom="${state.zoom}">
            <nav aria-label="Sample application"><strong>Case desk</strong><button>Dashboard</button><button>Queues</button><button>Reports</button></nav>
            <div class="sample-content">
              <p class="micro">Monday queue</p><h2 id="sample-app-heading">Open access cases</h2>
              <div class="search-row"><label for="sample-search">Search cases</label><input id="sample-search" value="renewal" /></div>
              <table><caption>Three sample access cases</caption><thead><tr><th>Person</th><th>System</th><th>Status</th></tr></thead><tbody><tr><td>Morgan Lee</td><td>Atlas CRM</td><td>Needs review</td></tr><tr><td>Sam Rivera</td><td>Ledger</td><td>Waiting</td></tr><tr><td>Rina Patel</td><td>Atlas CRM</td><td>Ready</td></tr></tbody></table>
              <button id="sample-open" class="sample-open">Open record</button>
            </div>
            <div class="demo-reading-lane" ${state.lane ? '' : 'hidden'} aria-hidden="true"></div>
          </div>
        </section>
      </div>
    </main>`, 'demo');
  bindDemo(state);
  finishRoute('Adjust a busy page without losing focus');
}

function bindDemo(state: DemoSettings) {
  const persist = () => localStorage.setItem(DEMO_KEY, JSON.stringify(state));
  const zoom = document.querySelector<HTMLInputElement>('#demo-zoom')!;
  zoom.addEventListener('input', () => { state.zoom = Number(zoom.value); persist(); renderDemo(); });
  document.querySelectorAll<HTMLInputElement>('input[name="demo-contrast"]').forEach((input) => input.addEventListener('change', () => { state.contrast = input.value as DemoSettings['contrast']; persist(); renderDemo(); }));
  document.querySelector<HTMLInputElement>('#demo-focus')!.addEventListener('change', (event) => { state.focus = (event.target as HTMLInputElement).checked; persist(); renderDemo(); });
  document.querySelector<HTMLInputElement>('#demo-lane')!.addEventListener('change', (event) => { state.lane = (event.target as HTMLInputElement).checked; persist(); renderDemo(); });
  const waypointInput = document.querySelector<HTMLInputElement>('#demo-waypoint')!;
  const setWaypointError = (message: string | null) => {
    const error = document.querySelector<HTMLElement>('#demo-waypoint-error')!;
    waypointInput.setAttribute('aria-invalid', String(Boolean(message)));
    error.textContent = message || '';
    error.hidden = !message;
  };
  document.querySelector<HTMLFormElement>('#demo-waypoint-form')!.addEventListener('submit', (event) => {
    event.preventDefault();
    const validationMessage = validateWaypointName(waypointInput.value);
    setWaypointError(validationMessage);
    if (validationMessage) {
      waypointInput.focus();
      return;
    }
    state.waypoints.push(waypointInput.value.trim());
    persist();
    renderDemo();
  });
  waypointInput.addEventListener('input', () => setWaypointError(null));
  document.querySelectorAll<HTMLButtonElement>('[data-remove]').forEach((button) => button.addEventListener('click', () => { state.waypoints.splice(Number(button.dataset.remove), 1); persist(); renderDemo(); }));
  document.querySelectorAll<HTMLButtonElement>('[data-waypoint]').forEach((button) => button.addEventListener('click', () => { const target = Number(button.dataset.waypoint) === 0 ? '#sample-search' : '#sample-open'; document.querySelector<HTMLElement>(target)?.focus(); document.querySelector('#demo-status')!.textContent = `Opened ${button.textContent}.`; }));
  document.querySelector('#reset-demo')!.addEventListener('click', () => { localStorage.removeItem(DEMO_KEY); renderDemo(); });
  document.querySelector('#demo-export')!.addEventListener('click', () => {
    const text = 'Focus Lens keyboard shortcuts\n\nAlt+Shift+F  Toggle the focus rail\nAlt+Shift+L  Toggle the reading lane\nAlt+Shift+.  Increase page zoom\nAlt+Shift+,  Decrease page zoom\n';
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    const link = document.createElement('a'); link.href = url; link.download = 'focus-lens-shortcuts.txt'; link.click(); URL.revokeObjectURL(url);
    document.querySelector('#demo-status')!.textContent = 'Shortcut file exported.';
  });
}

function renderLegal(page: 'privacy' | 'terms') {
  const privacy = page === 'privacy';
  const title = privacy ? 'Privacy — Focus Lens' : 'Terms — Focus Lens';
  document.title = title;
  setCanonical(`/${page}`);
  app.innerHTML = shell(`<main id="main" class="legal-page"><p class="kicker">${privacy ? 'Privacy' : 'Terms'}</p><h1 tabindex="-1">${privacy ? 'Your settings stay in your browser' : 'Use Focus Lens as an assistive tool'}</h1>
    ${privacy ? `<h2>What Focus Lens stores</h2><p>The extension stores zoom, contrast, focus, reading lane, and named waypoint settings in local browser storage.</p><p>A waypoint contains the name you enter and a selector for the page control. It never stores page text.</p><h2>What leaves your browser</h2><p>After its local page loads, Focus Lens controls make no network requests. No data leaves while you use them.</p><h2>How to remove your data</h2><p>Remove the extension or clear its storage in your browser extension settings.</p>` : `<h2>What the extension provides</h2><p>Focus Lens adds visual orientation controls to regular web pages. It is free and provided without a service guarantee.</p><h2>Your responsibility</h2><p>Keep your browser updated. Check important work before you submit it.</p><h2>Limits</h2><p>Focus Lens does not replace a screen reader, employer accommodation, or professional accessibility review. It does not bypass page security.</p>`}
    <h2>Questions</h2><p>Email <a href="mailto:hello@sociobot.in">hello@sociobot.in</a>.</p><p>Effective: September 2, 2026.</p></main>`, page);
  finishRoute(privacy ? 'Your settings stay in your browser' : 'Use Focus Lens as an assistive tool');
}

function renderNotFound() {
  document.title = 'Page not found — Focus Lens';
  setCanonical('/404');
  app.innerHTML = shell(`<main id="main" class="not-found"><div class="lost-lens" aria-hidden="true"></div><p class="kicker">404</p><h1 tabindex="-1">This page is not here</h1><p>The address may have changed. Return to the Focus Lens home page.</p><a class="button primary" href="/" data-link>Return home</a></main>`);
  finishRoute('This page is not here');
}

function setCanonical(path: string) {
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')!.href = `https://focus-lens.sociobot.in${path}`;
}

function finishRoute(name: string) {
  document.querySelector('#route-status')!.textContent = name;
  if (performance.getEntriesByType('navigation')[0] && document.readyState === 'complete') document.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function escapeText(value: string) {
  const el = document.createElement('span'); el.textContent = value; return el.innerHTML;
}

document.addEventListener('click', (event) => {
  const link = (event.target as Element).closest<HTMLAnchorElement>('a[data-link]');
  if (!link || link.origin !== location.origin || event.defaultPrevented) return;
  event.preventDefault(); history.pushState({}, '', link.href); route();
});
window.addEventListener('popstate', route);
route();
