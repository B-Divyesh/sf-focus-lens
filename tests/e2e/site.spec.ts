import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('@claim:visible-focus adds a high-contrast rail to the focused sample control', async ({ page }) => {
  await page.goto('/demo');
  const search = page.locator('#sample-search');
  await search.focus();
  const outline = await search.evaluate((node) => getComputedStyle(node).outlineWidth);
  expect(Number.parseFloat(outline)).toBeGreaterThanOrEqual(5);
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

test('@claim:shortcut-export downloads a readable shortcut sheet', async ({ page }) => {
  await page.goto('/demo');
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export shortcuts' }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('focus-lens-shortcuts.txt');
  const content = await (await import('node:fs/promises')).readFile(await download.path() as string, 'utf8');
  expect(content).toContain('Alt+Shift+F  Toggle the focus rail');
});

test('@claim:local-private makes no third-party request during the complete demo flow', async ({ page }) => {
  const otherOrigins: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') otherOrigins.push(request.url());
  });
  await page.goto('/demo');
  await page.getByLabel('Show the focus rail').uncheck();
  await page.getByLabel('Waypoint name').fill('Local control');
  await page.getByRole('button', { name: 'Save waypoint' }).click();
  expect(otherOrigins).toEqual([]);
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
    ['/terms', 'Terms — Focus Lens'],
    ['/missing-page', 'Page not found — Focus Lens']
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

test('the landing page works at 390px and every internal link resolves', async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  const paths = await page.locator('a[href^="/"]').evaluateAll((links) => [...new Set(links.map((link) => (link as HTMLAnchorElement).getAttribute('href')!))]);
  for (const path of paths) expect((await request.get(path)).status()).toBeLessThan(400);
});
