import { chromium, expect, test, type BrowserContext, type Worker } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { installFocusLens } from '../../lib/page-agent';

type ExtensionSession = {
  context: BrowserContext;
  profile: string;
  worker: Worker;
};

async function launchExtension(): Promise<ExtensionSession> {
  const profile = await mkdtemp(join(tmpdir(), 'focus-lens-extension-'));
  const extension = resolve('dist/extension');
  const context = await chromium.launchPersistentContext(profile, {
    headless: false,
    args: ['--headless=new', `--disable-extensions-except=${extension}`, `--load-extension=${extension}`]
  });
  const worker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
  return { context, profile, worker };
}

async function closeExtension(session: ExtensionSession) {
  await session.context.close();
  await rm(session.profile, { recursive: true, force: true });
}

test('@claim:extension-storage @extension stores every site setting and waypoint in namespaced Chrome storage', async () => {
  const session = await launchExtension();
  try {
    const sample = await session.context.newPage();
    await sample.goto('http://127.0.0.1:4173/demo');
    const activeUrl = sample.url();
    await session.context.addInitScript((url) => {
      const api = globalThis.chrome as typeof chrome & { tabs: typeof chrome.tabs; scripting: typeof chrome.scripting };
      if (location.protocol !== 'chrome-extension:' || !api?.tabs) return;
      const messages: unknown[] = [];
      (globalThis as typeof globalThis & { __focusLensMessages?: unknown[] }).__focusLensMessages = messages;
      api.tabs.query = async () => [{ id: 73, url }] as chrome.tabs.Tab[];
      api.tabs.sendMessage = async (_tabId: number, message: unknown) => {
        messages.push(message);
        const request = message as { type?: string; selector?: string };
        if (request.type === 'FOCUS_LENS_CAPTURE') return { ok: true, selector: '#sample-open' };
        return { ok: true };
      };
      api.scripting.executeScript = async () => [];
      window.close = () => { (globalThis as typeof globalThis & { __focusLensClosed?: boolean }).__focusLensClosed = true; };
    }, activeUrl);

    const extensionId = new URL(session.worker.url()).host;
    const popup = await session.context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await expect(popup.locator('#site-label')).toHaveText('Settings for 127.0.0.1');
    await popup.getByLabel('Zoom').fill('150');
    await popup.getByLabel('Dim').check();
    await popup.getByLabel('Show the focus rail').uncheck();
    await popup.getByLabel('Show the reading lane').check();
    await popup.getByLabel('Focus rail width').fill('10');
    await popup.getByLabel('Focus rail color').selectOption('#7b2cbf');
    await popup.getByLabel('Waypoint name').fill('Open sample record');
    await popup.getByRole('button', { name: 'Save focus' }).click();
    await expect(popup.getByRole('button', { name: 'Open sample record', exact: true })).toBeVisible();

    const storage = await session.worker.evaluate(async () => chrome.storage.local.get(null));
    expect(Object.keys(storage)).toEqual(['site:http://127.0.0.1:4173']);
    expect(storage['site:http://127.0.0.1:4173']).toMatchObject({
      zoom: 150,
      contrast: 'dim',
      focusVisible: false,
      focusWidth: 10,
      focusColor: '#7b2cbf',
      laneVisible: true,
      waypoints: [{ name: 'Open sample record', selector: '#sample-open' }]
    });
    expect(JSON.stringify(storage)).not.toContain('Morgan Lee');
    await popup.getByRole('button', { name: 'Open sample record', exact: true }).click();
    const messages = await popup.evaluate(() => (globalThis as typeof globalThis & { __focusLensMessages: Array<{ type?: string; selector?: string }> }).__focusLensMessages);
    expect(messages).toEqual(expect.arrayContaining([expect.objectContaining({ type: 'FOCUS_LENS_APPLY' }), { type: 'FOCUS_LENS_CAPTURE' }, { type: 'FOCUS_LENS_GOTO', selector: '#sample-open' }]));

    const axe = await new AxeBuilder({ page: popup as never }).analyze();
    expect(axe.violations.filter((item) => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);
    await popup.locator('main').screenshot({ path: '.factory/polish-artifacts/extension-popup.png' });
  } finally {
    await closeExtension(session);
  }
});

test('@claim:keyboard-commands @extension applies every packaged keyboard command with zoom bounds', async ({ page }) => {
  await page.goto('/demo');
  await page.evaluate(() => {
    const listeners: Array<(message: unknown, sender: unknown, respond: (value: unknown) => void) => void> = [];
    Object.defineProperty(globalThis, 'chrome', { configurable: true, value: { runtime: { onMessage: { addListener: (listener: typeof listeners[number]) => listeners.push(listener) } } } });
    (globalThis as typeof globalThis & { __dispatchFocusLens?: (message: unknown) => Promise<unknown> }).__dispatchFocusLens = (message) => new Promise((resolve) => listeners[0](message, {}, resolve));
  });
  await page.evaluate(installFocusLens);
  const dispatch = (command: string) => page.evaluate((value) => (globalThis as typeof globalThis & { __dispatchFocusLens: (message: unknown) => Promise<{ state: Record<string, unknown> }> }).__dispatchFocusLens({ type: 'FOCUS_LENS_COMMAND', command: value }), command);

  let response = await dispatch('toggle-focus');
  expect(response.state.focusVisible).toBe(false);
  response = await dispatch('toggle-lane');
  expect(response.state.laneVisible).toBe(true);
  await expect(page.locator('#focus-lens-reading-lane')).toBeVisible();
  for (let index = 0; index < 15; index += 1) response = await dispatch('zoom-in');
  expect(response.state.zoom).toBe(200);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).zoom)).toBe('2');
  for (let index = 0; index < 20; index += 1) response = await dispatch('zoom-out');
  expect(response.state.zoom).toBe(80);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).zoom)).toBe('0.8');

  const manifest = JSON.parse(await readFile('dist/extension/manifest.json', 'utf8'));
  expect(Object.keys(manifest.commands)).toEqual(['toggle-focus', 'toggle-lane', 'zoom-in', 'zoom-out']);
  const background = await readFile('dist/extension/background.js', 'utf8');
  for (const command of Object.keys(manifest.commands)) expect(background).toContain(command);
});

test('@extension page agent captures and restores the exact focused control without changing its content', async ({ page }) => {
  await page.goto('/demo');
  await page.evaluate(() => {
    const listeners: Array<(message: unknown, sender: unknown, respond: (value: unknown) => void) => void> = [];
    Object.defineProperty(globalThis, 'chrome', { configurable: true, value: { runtime: { onMessage: { addListener: (listener: typeof listeners[number]) => listeners.push(listener) } } } });
    (globalThis as typeof globalThis & { __dispatchFocusLens?: (message: unknown) => Promise<unknown> }).__dispatchFocusLens = (message) => new Promise((resolve) => listeners[0](message, {}, resolve));
  });
  await page.evaluate(installFocusLens);
  const before = await page.locator('#sample-search').evaluate((node) => ({ value: (node as HTMLInputElement).value, className: node.className, parent: node.parentElement?.className }));
  await page.locator('#sample-search').focus();
  const captured = await page.evaluate(() => (globalThis as typeof globalThis & { __dispatchFocusLens: (message: unknown) => Promise<unknown> }).__dispatchFocusLens({ type: 'FOCUS_LENS_CAPTURE' }));
  expect(captured).toEqual({ ok: true, selector: '#sample-search' });
  await page.locator('#sample-open').focus();
  await page.evaluate(() => (globalThis as typeof globalThis & { __dispatchFocusLens: (message: unknown) => Promise<unknown> }).__dispatchFocusLens({ type: 'FOCUS_LENS_GOTO', selector: '#sample-search' }));
  await expect(page.locator('#sample-search')).toBeFocused();
  const after = await page.locator('#sample-search').evaluate((node) => ({ value: (node as HTMLInputElement).value, className: node.className, parent: node.parentElement?.className }));
  expect(after).toEqual(before);
});
