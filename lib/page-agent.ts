export type LensMessage =
  | { type: 'FOCUS_LENS_APPLY'; settings: Record<string, unknown> }
  | { type: 'FOCUS_LENS_CAPTURE' }
  | { type: 'FOCUS_LENS_GOTO'; selector: string }
  | { type: 'FOCUS_LENS_COMMAND'; command: string };

export function installFocusLens(): void {
  const win = window as typeof window & { __focusLensInstalled?: boolean };
  if (win.__focusLensInstalled) return;
  win.__focusLensInstalled = true;

  const state = {
    zoom: 100,
    contrast: 'standard',
    focusVisible: true,
    focusWidth: 5,
    focusColor: '#c63d2f',
    laneVisible: false
  };

  const style = document.createElement('style');
  style.id = 'focus-lens-styles';
  (document.head || document.documentElement).append(style);
  const lane = document.createElement('div');
  lane.id = 'focus-lens-reading-lane';
  lane.setAttribute('aria-hidden', 'true');
  document.documentElement.append(lane);

  const render = () => {
    const contrast = state.contrast === 'strong' ? 'contrast(1.28) saturate(.8)' : state.contrast === 'dim' ? 'brightness(.78) contrast(1.12)' : 'none';
    document.documentElement.style.setProperty('zoom', `${state.zoom}%`);
    document.documentElement.style.setProperty('filter', contrast);
    style.textContent = `
      :root { --focus-lens-color: ${state.focusColor}; --focus-lens-width: ${state.focusWidth}px; }
      ${state.focusVisible ? `*:focus { outline: var(--focus-lens-width) solid var(--focus-lens-color) !important; outline-offset: 4px !important; box-shadow: 0 0 0 calc(var(--focus-lens-width) + 2px) rgba(255,255,255,.94) !important; }` : ''}
      #focus-lens-reading-lane { position: fixed !important; z-index: 2147483646 !important; left: 0 !important; right: 0 !important; top: 38vh; height: 104px !important; pointer-events: none !important; border-top: 3px solid ${state.focusColor} !important; border-bottom: 3px solid ${state.focusColor} !important; box-shadow: 0 0 0 9999px rgba(15,29,28,.48) !important; display: ${state.laneVisible ? 'block' : 'none'} !important; transition: top 180ms ease-out !important; }
      @media (prefers-reduced-motion: reduce) { #focus-lens-reading-lane { transition: none !important; } }
    `;
  };

  const moveLane = (target: Element | null) => {
    if (!state.laneVisible || !target) return;
    const rect = target.getBoundingClientRect();
    const y = Math.max(0, Math.min(innerHeight - 110, rect.top + rect.height / 2 - 52));
    lane.style.setProperty('top', `${y}px`, 'important');
  };

  document.addEventListener('focusin', (event) => moveLane(event.target as Element), true);
  document.addEventListener('pointermove', (event) => {
    if (state.laneVisible) lane.style.setProperty('top', `${Math.max(0, Math.min(innerHeight - 110, event.clientY - 52))}px`, 'important');
  }, { passive: true });

  const selectorFor = (element: Element): string => {
    if (element.id) return `#${CSS.escape(element.id)}`;
    const bits: string[] = [];
    let current: Element | null = element;
    while (current && current !== document.body && bits.length < 5) {
      let bit = current.tagName.toLowerCase();
      const parentElement: Element | null = current.parentElement;
      if (parentElement) {
        const siblings: Element[] = Array.from(parentElement.children).filter((item: Element) => item.tagName === current!.tagName);
        if (siblings.length > 1) bit += `:nth-of-type(${siblings.indexOf(current) + 1})`;
      }
      bits.unshift(bit);
      current = parentElement;
    }
    return bits.join(' > ');
  };

  chrome.runtime.onMessage.addListener((message: LensMessage, _sender, sendResponse) => {
    if (message.type === 'FOCUS_LENS_APPLY') {
      Object.assign(state, message.settings);
      render();
      moveLane(document.activeElement);
      sendResponse({ ok: true });
    }
    if (message.type === 'FOCUS_LENS_CAPTURE') {
      const active = document.activeElement;
      if (!active || active === document.body || active === document.documentElement) {
        sendResponse({ ok: false, error: 'Focus a control on the page, then try again.' });
      } else {
        // A waypoint deliberately contains only a structural selector. Its name
        // comes from the person using Focus Lens, never from page text.
        sendResponse({ ok: true, selector: selectorFor(active) });
      }
    }
    if (message.type === 'FOCUS_LENS_GOTO') {
      const target = document.querySelector(message.selector) as HTMLElement | null;
      if (!target) sendResponse({ ok: false, error: 'That waypoint is no longer on this page.' });
      else {
        target.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        target.focus({ preventScroll: true });
        moveLane(target);
        sendResponse({ ok: true });
      }
    }
    if (message.type === 'FOCUS_LENS_COMMAND') {
      if (message.command === 'toggle-focus') state.focusVisible = !state.focusVisible;
      if (message.command === 'toggle-lane') state.laneVisible = !state.laneVisible;
      if (message.command === 'zoom-in') state.zoom = Math.min(200, state.zoom + 10);
      if (message.command === 'zoom-out') state.zoom = Math.max(80, state.zoom - 10);
      render();
      sendResponse({ ok: true, state });
    }
    return true;
  });
  render();
}
