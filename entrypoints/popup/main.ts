import './style.css';
import { DEFAULT_SETTINGS, mergeSettings, shortcutsText, storageKey, validateWaypointName, type SiteSettings, type Waypoint } from '../../lib/settings';
import { installFocusLens } from '../../lib/page-agent';

const $ = <T extends HTMLElement>(selector: string): T => document.querySelector(selector) as T;
let tabId = 0;
let origin = '';
let settings: SiteSettings = { ...DEFAULT_SETTINGS, waypoints: [] };

const error = (message: string) => {
  const box = $('#error');
  box.textContent = message;
  box.hidden = !message;
};

const waypointError = (message: string | null) => {
  const input = $('#waypoint-name') as HTMLInputElement;
  const box = $('#waypoint-error');
  input.setAttribute('aria-invalid', String(Boolean(message)));
  box.textContent = message || '';
  box.hidden = !message;
};

const send = async (message: unknown) => {
  try {
    return await chrome.tabs.sendMessage(tabId, message);
  } catch {
    await chrome.scripting.executeScript({ target: { tabId }, func: installFocusLens });
    return chrome.tabs.sendMessage(tabId, message);
  }
};

const save = async () => {
  await chrome.storage.local.set({ [storageKey(origin)]: settings });
  await send({ type: 'FOCUS_LENS_APPLY', settings });
  $('#save-status').textContent = 'Saved for this site.';
};

const render = () => {
  ($('#zoom') as HTMLInputElement).value = String(settings.zoom);
  $('#zoom-output').textContent = `${settings.zoom}%`;
  ($('#focus-visible') as HTMLInputElement).checked = settings.focusVisible;
  ($('#lane-visible') as HTMLInputElement).checked = settings.laneVisible;
  ($('#focus-width') as HTMLInputElement).value = String(settings.focusWidth);
  $('#width-output').textContent = `${settings.focusWidth} px`;
  ($('#focus-color') as HTMLSelectElement).value = settings.focusColor;
  document.querySelector<HTMLInputElement>(`input[name="contrast"][value="${settings.contrast}"]`)!.checked = true;
  const list = $('#waypoint-list');
  list.replaceChildren();
  $('#empty-waypoints').hidden = settings.waypoints.length > 0;
  settings.waypoints.forEach((waypoint) => {
    const li = document.createElement('li');
    const go = document.createElement('button');
    go.textContent = waypoint.name;
    go.addEventListener('click', async () => {
      const result = await send({ type: 'FOCUS_LENS_GOTO', selector: waypoint.selector });
      if (!result?.ok) error(result?.error || 'This waypoint could not be opened.');
      else window.close();
    });
    const remove = document.createElement('button');
    remove.className = 'remove';
    remove.textContent = 'Remove';
    remove.setAttribute('aria-label', `Remove ${waypoint.name}`);
    remove.addEventListener('click', async () => {
      settings.waypoints = settings.waypoints.filter((item) => item.id !== waypoint.id);
      await save();
      render();
    });
    li.append(go, remove);
    list.append(li);
  });
};

const update = async () => {
  settings.zoom = Number(($('#zoom') as HTMLInputElement).value);
  settings.focusVisible = ($('#focus-visible') as HTMLInputElement).checked;
  settings.laneVisible = ($('#lane-visible') as HTMLInputElement).checked;
  settings.focusWidth = Number(($('#focus-width') as HTMLInputElement).value);
  settings.focusColor = ($('#focus-color') as HTMLSelectElement).value;
  settings.contrast = document.querySelector<HTMLInputElement>('input[name="contrast"]:checked')!.value as SiteSettings['contrast'];
  render();
  await save();
};

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab.id || !tab.url?.startsWith('http')) {
    error('Focus Lens works on regular web pages. Open a website and try again.');
    document.querySelectorAll('input, select, button').forEach((node) => (node as HTMLInputElement).disabled = true);
    return;
  }
  tabId = tab.id;
  origin = new URL(tab.url).origin;
  $('#site-label').textContent = `Settings for ${new URL(tab.url).hostname}`;
  const stored = await chrome.storage.local.get(storageKey(origin));
  settings = mergeSettings(stored[storageKey(origin)]);
  render();
  await send({ type: 'FOCUS_LENS_APPLY', settings });

  document.querySelectorAll('#zoom, #focus-visible, #lane-visible, #focus-width, #focus-color, input[name="contrast"]').forEach((control) => control.addEventListener('input', update));
  $('#waypoint-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    error('');
    const input = $('#waypoint-name') as HTMLInputElement;
    const validationMessage = validateWaypointName(input.value);
    waypointError(validationMessage);
    if (validationMessage) {
      input.focus();
      return;
    }
    const result = await send({ type: 'FOCUS_LENS_CAPTURE' });
    if (!result?.ok) return error(result?.error || 'Focus a page control, then try again.');
    const waypoint: Waypoint = { id: crypto.randomUUID(), name: input.value.trim(), selector: result.selector };
    settings.waypoints.push(waypoint);
    input.value = '';
    waypointError(null);
    await save();
    render();
  });
  $('#waypoint-name').addEventListener('input', () => waypointError(null));
  $('#export-shortcuts').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([shortcutsText], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'focus-lens-shortcuts.txt';
    link.click();
    URL.revokeObjectURL(url);
    $('#save-status').textContent = 'Shortcut file exported.';
  });
}

init().catch(() => error('Focus Lens could not connect. Reload the page and try again.'));
