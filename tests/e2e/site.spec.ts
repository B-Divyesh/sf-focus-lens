import { chromium, expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

test('@claim:visible-focus adds a high-contrast rail to the focused sample control', async ({ page }) => {
  await page.goto('/demo');
  const search = page.locator('#sample-search');
  await search.focus();
  const outline = await search.evaluate((node) => getComputedStyle(node).outlineWidth);
  expect(Number.parseFloat(outline)).toBeGreaterThanOrEqual(5);

  // Regression for the reported opacity-zero radio failure: the focus ring is
  // rendered on the label people can see, rather than the hidden input.
  const contrast = page.getByLabel('Strong');
  await contrast.focus();
  const visibleFocus = await contrast.evaluate((input) => {
    const label = input.closest('label');
    return {
      inputFocusVisible: input.matches(':focus-visible'),
      inputOpacity: getComputedStyle(input).opacity,
      labelOutlineWidth: label ? getComputedStyle(label).outlineWidth : '0px',
      labelOutlineColor: label ? getComputedStyle(label).outlineColor : 'transparent'
    };
  });
  expect(visibleFocus.inputFocusVisible).toBe(true);
  expect(visibleFocus.inputOpacity).toBe('0');
  expect(Number.parseFloat(visibleFocus.labelOutlineWidth)).toBeGreaterThanOrEqual(4);
  expect(visibleFocus.labelOutlineColor).toBe('rgb(198, 61, 47)');
});

test('@regression:popup-contrast-radio-focus renders the focus ring on the extension label', async () => {
  const profile = await mkdtemp(join(tmpdir(), 'focus-lens-popup-'));
  let context: Awaited<ReturnType<typeof chromium.launchPersistentContext>> | undefined;
  try {
    const extension = resolve('dist/extension');
    context = await chromium.launchPersistentContext(profile, {
      // Chromium enables extension service workers in its modern headless mode.
      headless: false,
      args: ['--headless=new', `--disable-extensions-except=${extension}`, `--load-extension=${extension}`]
    });
    const worker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
    const extensionId = new URL(worker.url()).host;
    const sample = await context.newPage();
    await sample.goto('http://127.0.0.1:4173/demo');
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    // A test tab is not the browser toolbar popup, so the production guard
    // disables controls after seeing its own chrome-extension URL. Re-enable
    // just the rendered controls to exercise the packaged keyboard styling.
    await popup.locator('input').evaluateAll((inputs) => inputs.forEach((input) => { (input as HTMLInputElement).disabled = false; }));
    const radio = popup.getByLabel('Standard');
    await popup.evaluate(() => document.body.focus());
    await popup.keyboard.press('Tab'); // Skip to controls
    await popup.keyboard.press('Tab'); // Page zoom
    await popup.keyboard.press('Tab'); // Selected radio in the contrast group
    await expect(radio).toBeFocused();
    const visibleFocus = await radio.evaluate((input) => {
      const label = input.closest('label');
      return {
        inputFocusVisible: input.matches(':focus-visible'),
        inputOpacity: getComputedStyle(input).opacity,
        labelOutlineWidth: label ? getComputedStyle(label).outlineWidth : '0px',
        labelOutlineColor: label ? getComputedStyle(label).outlineColor : 'transparent'
      };
    });
    expect(visibleFocus.inputFocusVisible).toBe(true);
    expect(visibleFocus.inputOpacity).toBe('0');
    expect(Number.parseFloat(visibleFocus.labelOutlineWidth)).toBeGreaterThanOrEqual(4);
    expect(visibleFocus.labelOutlineColor).toBe('rgb(198, 61, 47)');
  } finally {
    await context?.close();
    await rm(profile, { recursive: true, force: true });
  }
});

test('@claim:reading-lane lets the user show and hide the reading lane', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('.demo-reading-lane')).toBeVisible();
  await page.getByLabel('Show the reading lane').uncheck();
  await expect(page.locator('.demo-reading-lane')).toBeHidden();
});

test('@claim:site-view saves zoom and contrast in the demo sandbox', async ({ page }) => {
  await page.goto('/demo');
  await page.getByLabel('Zoom').fill('140');
  await page.getByLabel('Dim').check();
  await page.reload();
  await expect(page.getByLabel('Zoom')).toHaveValue('140');
  await expect(page.getByLabel('Dim')).toBeChecked();
  const keys = await page.evaluate(() => Object.keys(localStorage));
  expect(keys).toEqual(['demo:focus-lens:settings']);
});

test('@claim:named-waypoints saves and opens a named control', async ({ page }) => {
  await page.goto('/demo');
  await page.getByLabel('Waypoint name').fill('Review search');
  await page.getByRole('button', { name: 'Save waypoint' }).click();
  await page.getByRole('button', { name: 'Review search', exact: true }).click();
  await expect(page.locator('#sample-open')).toBeFocused();
});

test('@regression:waypoint-validation explains and announces a missing waypoint name', async ({ page }) => {
  await page.goto('/demo');
  const input = page.getByLabel('Waypoint name');
  await page.getByRole('button', { name: 'Save waypoint' }).click();
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#demo-waypoint-error')).toHaveText('Enter a waypoint name, then save it.');
  await input.fill('Queue filter');
  await expect(input).toHaveAttribute('aria-invalid', 'false');
  await page.getByRole('button', { name: 'Save waypoint' }).click();
  await expect(page.getByRole('button', { name: 'Queue filter', exact: true })).toBeVisible();
});

test('@claim:shortcut-export downloads a readable shortcut sheet', async ({ page }) => {
  await page.goto('/demo');
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export shortcuts' }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('focus-lens-shortcuts.txt');
  const content = await (await import('node:fs/promises')).readFile(await download.path() as string, 'utf8');
  expect(content).toContain('Alt+Shift+F  Toggle the focus rail');
});

test('@claim:local-private isolates demo storage and reset removes it', async ({ page }) => {
  await page.goto('/demo');
  await page.getByLabel('Zoom').fill('140');
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual(['demo:focus-lens:settings']);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
});

test('@claim:no-egress makes no network request after its local page loads', async ({ page }) => {
  await page.goto('/demo');
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.getByLabel('Show the focus rail').uncheck();
  await page.getByLabel('Dim').check();
  await page.getByLabel('Waypoint name').fill('Local control');
  await page.getByRole('button', { name: 'Save waypoint' }).click();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export shortcuts' }).click();
  await downloadEvent;
  expect(requests).toEqual([]);
});

test('@claim:no-page-text-capture stores only the waypoint name and selector', async ({ page }) => {
  const pageText = 'PAGE_TEXT_MUST_NOT_BE_CAPTURED_7X4';
  await page.goto('/demo');
  await page.locator('#sample-search').fill(pageText);
  await page.getByLabel('Waypoint name').fill('My local waypoint');
  await page.getByRole('button', { name: 'Save waypoint' }).click();
  const stored = await page.evaluate(() => localStorage.getItem('demo:focus-lens:settings'));
  expect(stored).toContain('My local waypoint');
  expect(stored).not.toContain(pageText);
});

test('@claim:exact-permissions packages only activeTab, scripting, and storage', async ({ page }) => {
  await page.goto('/demo');
  const manifest = JSON.parse(await readFile('dist/extension/manifest.json', 'utf8'));
  const { stdout } = await execFileAsync('unzip', ['-p', 'dist/site/downloads/focus-lens-chrome.zip', 'manifest.json']);
  const packagedManifest = JSON.parse(stdout);
  for (const candidate of [manifest, packagedManifest]) {
    expect(candidate.manifest_version).toBe(3);
    expect(candidate.permissions).toEqual(['activeTab', 'scripting', 'storage']);
    expect(candidate.host_permissions || []).toEqual([]);
  }
});

test('@claim:no-account-free provides the complete demo and extension download without account or payment', async ({ page, request }) => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'Focus Lens controls' })).toBeVisible();
  await expect(page.locator('input[type="email"], input[type="password"]')).toHaveCount(0);
  const response = await request.get('/downloads/focus-lens-chrome.zip');
  expect(response.ok()).toBe(true);
  expect((await response.body()).byteLength).toBeGreaterThan(10_000);
});

test('all routes have one heading, correct titles, and no serious accessibility issues', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  const routes = [
    ['/', 'Focus Lens — keep focus visible in web apps'],
    ['/demo', 'Demo — Focus Lens'],
    ['/privacy', 'Privacy — Focus Lens'],
    ['/terms', 'Terms — Focus Lens']
  ];
  for (const [path, title] of routes) {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    const results = await new AxeBuilder({ page: page as never }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);
  }
  expect(errors).toEqual([]);
});

test('unknown routes return the designed 404 document with HTTP 404', async ({ page, request }) => {
  const response = await request.get('/definitely-missing');
  expect(response.status()).toBe(404);
  await page.goto('/definitely-missing');
  await expect(page).toHaveTitle('Page not found — Focus Lens');
  await expect(page.getByRole('heading', { name: 'This page is not here' })).toBeVisible();
});

test('the landing page works at 390px and standalone links meet the touch target', async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['/', '/demo', '/privacy', '/terms', '/definitely-missing']) {
    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    const shortLinks = await page.locator('a').evaluateAll((links) => links
      .map((link) => ({ text: link.textContent?.trim(), height: link.getBoundingClientRect().height, visible: getComputedStyle(link).display !== 'none' }))
      .filter((link) => link.visible && link.height < 44));
    expect(shortLinks).toEqual([]);
  }
  await page.goto('/');
  const paths = await page.locator('a[href^="/"]').evaluateAll((links) => [...new Set(links.map((link) => (link as HTMLAnchorElement).getAttribute('href')!))]);
  for (const path of paths) expect((await request.get(path)).status()).toBeLessThan(400);
});
