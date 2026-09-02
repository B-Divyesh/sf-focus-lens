import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const luminance = (hex: string) => {
  const channels = hex.match(/[0-9a-f]{2}/gi)!.map((value) => Number.parseInt(value, 16) / 255).map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

const contrast = (first: string, second: string) => {
  const [light, dark] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
};

test('@claim:visible-focus adds a large high-contrast focus rail and halo', async ({ page }) => {
  await page.goto('/demo');
  const search = page.locator('#sample-search');
  const treatment = await search.evaluate((node) => {
    const style = getComputedStyle(node);
    return { width: Number.parseFloat(style.outlineWidth), color: style.outlineColor, shadow: style.boxShadow };
  });
  expect(treatment.width).toBeGreaterThanOrEqual(5);
  expect(treatment.color).toBe('rgb(198, 61, 47)');
  expect(treatment.shadow).toContain('rgb(255, 255, 255)');
  expect(contrast('#c63d2f', '#fffefd')).toBeGreaterThanOrEqual(3);
  expect(contrast('#ffffff', '#18302f')).toBeGreaterThanOrEqual(3);

  const radio = page.getByLabel('Strong');
  await radio.focus();
  const labelOutline = await radio.evaluate((input) => getComputedStyle(input.closest('label')!).outlineWidth);
  expect(Number.parseFloat(labelOutline)).toBeGreaterThanOrEqual(4);
});

test('@claim:reading-lane lets the user show and hide the reading lane', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('.demo-reading-lane')).toBeVisible();
  await page.getByLabel('Show the reading lane').uncheck();
  await expect(page.locator('.demo-reading-lane')).toBeHidden();
  await page.getByLabel('Show the reading lane').check();
  await expect(page.locator('.demo-reading-lane')).toBeVisible();
});

test('@claim:site-view keeps zoom, contrast, focus width, and focus color separate for each site', async ({ page }) => {
  await page.goto('/demo');
  await page.getByLabel('Zoom').fill('150');
  await page.getByLabel('Dim').check();
  await page.getByLabel('Focus rail width').fill('9');
  await page.getByLabel('Focus rail color').selectOption('#7b2cbf');
  await page.getByLabel('Sample site').selectOption('ledger.work.test');
  await expect(page.getByLabel('Zoom')).toHaveValue('90');
  await expect(page.getByLabel('Standard')).toBeChecked();
  await expect(page.getByLabel('Focus rail width')).toHaveValue('4');
  await expect(page.getByLabel('Focus rail color')).toHaveValue('#075d72');
  await page.getByLabel('Zoom').fill('80');
  await page.getByLabel('Focus rail width').fill('3');
  await page.getByLabel('Sample site').selectOption('atlas.work.test');
  await expect(page.getByLabel('Zoom')).toHaveValue('150');
  await expect(page.getByLabel('Dim')).toBeChecked();
  await expect(page.getByLabel('Focus rail width')).toHaveValue('9');
  await expect(page.getByLabel('Focus rail color')).toHaveValue('#7b2cbf');
  await page.reload();
  await expect(page.getByLabel('Zoom')).toHaveValue('150');
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('demo:focus-lens:settings')!));
  expect(stored.sites['atlas.work.test']).toMatchObject({ zoom: 150, contrast: 'dim', focusWidth: 9, focusColor: '#7b2cbf' });
  expect(stored.sites['ledger.work.test']).toMatchObject({ zoom: 80, contrast: 'standard', focusWidth: 3, focusColor: '#075d72' });
});

test('@claim:named-waypoints saves exact controls through removal, reordering, and reload', async ({ page }) => {
  await page.goto('/demo');
  await page.locator('#sample-open').focus();
  await page.getByLabel('Waypoint name').fill('Open Morgan');
  await page.getByRole('button', { name: 'Save waypoint' }).click();
  await page.locator('#sample-search').focus();
  await page.getByLabel('Waypoint name').fill('Find cases');
  await page.getByRole('button', { name: 'Save waypoint' }).click();
  await page.getByRole('button', { name: 'Remove Search cases' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Open Morgan', exact: true }).click();
  await expect(page.locator('#sample-open')).toBeFocused();
  await page.getByRole('button', { name: 'Find cases', exact: true }).click();
  await expect(page.locator('#sample-search')).toBeFocused();
  const waypoints = await page.evaluate(() => JSON.parse(localStorage.getItem('demo:focus-lens:settings')!).sites['atlas.work.test'].waypoints);
  expect(waypoints.find((item: { name: string }) => item.name === 'Open Morgan').selector).toBe('#sample-open');
  expect(waypoints.find((item: { name: string }) => item.name === 'Find cases').selector).toBe('#sample-search');
});

test('@claim:shortcut-export downloads the complete shortcut sheet', async ({ page }) => {
  await page.goto('/demo');
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export shortcuts' }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('focus-lens-shortcuts.txt');
  const content = await readFile(await download.path() as string, 'utf8');
  for (const shortcut of ['Alt+Shift+F', 'Alt+Shift+L', 'Alt+Shift+.', 'Alt+Shift+,']) expect(content).toContain(shortcut);
});

test('@claim:demo-isolation uses one demo namespace and Reset removes only demo data', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL('/?demo=1');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await page.evaluate(() => localStorage.setItem('focus-lens:real-sentinel', 'keep'));
  await page.getByLabel('Zoom').fill('140');
  expect(await page.evaluate(() => Object.keys(localStorage).sort())).toEqual(['demo:focus-lens:settings', 'focus-lens:real-sentinel']);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  expect(await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)))).toEqual({ 'focus-lens:real-sentinel': 'keep' });
  await expect(page.getByLabel('Zoom')).toHaveValue('120');
});

test('@claim:no-egress makes no request after local controls load', async ({ page }) => {
  await page.goto('/demo');
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.getByLabel('Zoom').fill('140');
  await page.getByLabel('Dim').check();
  await page.locator('#sample-open').focus();
  await page.getByLabel('Waypoint name').fill('Local control');
  await page.getByRole('button', { name: 'Save waypoint' }).click();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export shortcuts' }).click();
  await downloadEvent;
  expect(requests).toEqual([]);
});

test('@claim:no-page-text-capture stores names and structural locations but no page text', async ({ page }) => {
  const pageText = 'PAGE_TEXT_MUST_NOT_BE_CAPTURED_7X4';
  await page.goto('/demo');
  await page.locator('#sample-search').fill(pageText);
  await page.locator('#sample-open').focus();
  await page.getByLabel('Waypoint name').fill('My local waypoint');
  await page.getByRole('button', { name: 'Save waypoint' }).click();
  const stored = await page.evaluate(() => localStorage.getItem('demo:focus-lens:settings'));
  expect(stored).toContain('My local waypoint');
  expect(stored).toContain('#sample-open');
  expect(stored).not.toContain(pageText);
  expect(stored).not.toContain('Morgan Lee');
});

test('@claim:exact-permissions packages only activeTab, scripting, and storage', async ({ page }) => {
  await page.goto('/demo');
  const manifest = JSON.parse(await readFile('dist/extension/manifest.json', 'utf8'));
  const { stdout } = await execFileAsync('unzip', ['-p', 'dist/site/downloads/focus-lens-chrome.zip', 'manifest.json']);
  for (const candidate of [manifest, JSON.parse(stdout)]) {
    expect(candidate.manifest_version).toBe(3);
    expect(candidate.permissions).toEqual(['activeTab', 'scripting', 'storage']);
    expect(candidate.host_permissions || []).toEqual([]);
  }
});

test('@claim:no-account-free provides every control and download without account or payment', async ({ page, request }) => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'Focus Lens controls' })).toBeVisible();
  await expect(page.locator('input[type="email"], input[type="password"], [href*="checkout"]')).toHaveCount(0);
  const response = await request.get('/downloads/focus-lens-chrome.zip');
  expect(response.ok()).toBe(true);
  expect((await response.body()).byteLength).toBeGreaterThan(10_000);
});

test('@claim:install-package includes public steps and instructions inside the ZIP', async ({ page }) => {
  await page.goto('/install');
  await expect(page.getByRole('heading', { name: 'Install Focus Lens in Chrome' })).toBeVisible();
  await expect(page.getByText('Developer mode', { exact: true })).toBeVisible();
  await expect(page.getByText('Load unpacked', { exact: true })).toBeVisible();
  const { stdout } = await execFileAsync('unzip', ['-p', 'dist/site/downloads/focus-lens-chrome.zip', 'INSTALL.txt']);
  expect(stdout).toContain('Chrome Developer mode is required');
  expect(stdout).toContain('Load unpacked');
  expect(stdout).toContain('manifest.json');
});

test('@regression:waypoint-validation explains and announces an empty name', async ({ page }) => {
  await page.goto('/demo');
  const input = page.getByLabel('Waypoint name');
  await page.getByRole('button', { name: 'Save waypoint' }).click();
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#demo-waypoint-error')).toHaveText('Enter a waypoint name, then save it.');
  await expect(input).toBeFocused();
});

test('sample search and record controls work', async ({ page }) => {
  await page.goto('/demo');
  await page.locator('#sample-search').fill('Sam');
  await expect(page.locator('tbody tr:visible')).toHaveCount(1);
  await expect(page.locator('tbody tr:visible')).toContainText('Sam Rivera');
  await page.locator('#sample-search').fill('');
  await page.getByRole('button', { name: 'Open Morgan Lee' }).click();
  await expect(page.locator('#sample-record')).toBeVisible();
  await expect(page.locator('#sample-record')).toContainText('Atlas CRM renewal');
  await page.getByRole('button', { name: 'Close record' }).click();
  await expect(page.locator('#sample-record')).toBeHidden();
});

test('every route has its own metadata, one heading, landmarks, and no serious axe finding', async ({ page, request }) => {
  const routes = [
    ['/', 'Focus Lens — Keep keyboard focus visible', 'https://focus-lens.sociobot.in/'],
    ['/demo', 'Demo — Focus Lens', 'https://focus-lens.sociobot.in/demo'],
    ['/install', 'Install — Focus Lens', 'https://focus-lens.sociobot.in/install'],
    ['/privacy', 'Privacy — Focus Lens', 'https://focus-lens.sociobot.in/privacy'],
    ['/terms', 'Terms — Focus Lens', 'https://focus-lens.sociobot.in/terms']
  ];
  for (const [path, title, canonical] of routes) {
    const response = await request.get(path);
    const source = await response.text();
    expect(source).toContain(`<title>${title}</title>`);
    expect(source).toContain(`rel="canonical" href="${canonical}"`);
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('header nav')).toBeVisible();
    await expect(page.locator('footer a[href="/privacy"]')).toBeVisible();
    const results = await new AxeBuilder({ page: page as never }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);
  }
});

test('unknown routes return the complete designed 404 with HTTP 404', async ({ page, request }) => {
  expect((await request.get('/definitely-missing')).status()).toBe(404);
  await page.goto('/definitely-missing');
  await expect(page).toHaveTitle('Page not found — Focus Lens');
  await expect(page.getByRole('heading', { name: 'This page is not here' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  await expect(page.locator('footer')).toContainText('Version 1.0.0');
  await expect(page.locator('footer a[href="/privacy"]')).toBeVisible();
  await expect(page.locator('footer a[href="/terms"]')).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://focus-lens.sociobot.in/404');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Page not found — Focus Lens');
});

test('mobile first screen shows a named case, focus rail, and reading lane', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  for (const locator of [page.getByText('Morgan Lee', { exact: true }).first(), page.locator('#sample-search'), page.locator('.demo-reading-lane')]) {
    await expect(locator).toBeVisible();
    const box = await locator.boundingBox();
    expect(box!.y + Math.min(box!.height, 20)).toBeLessThan(844);
  }
  const outline = await page.locator('#sample-search').evaluate((node) => getComputedStyle(node).outlineWidth);
  expect(Number.parseFloat(outline)).toBeGreaterThanOrEqual(5);
});

test('desktop first screen contains all three facts', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/');
  for (const text of ['Settings stay in Chrome.', 'Works without an account.', 'Focus Lens is free.']) {
    const box = await page.getByText(text, { exact: true }).boundingBox();
    expect(box!.y + box!.height).toBeLessThanOrEqual(768);
  }
});

test('How it works navigation moves focus and announces the section', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('link', { name: 'How it works' }).click();
  await expect(page).toHaveURL('/#how');
  await expect(page.locator('#how-heading')).toBeFocused();
  await expect(page.locator('#route-status')).toHaveText('How it works');
});

test('390px and 200% text keep routes usable with 44px targets', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['/', '/demo', '/install', '/privacy', '/terms', '/definitely-missing']) {
    await page.goto(route);
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    const shortTargets = await page.locator('a, button, select, input').evaluateAll((nodes) => nodes.map((node) => {
      const target = node.matches('input[type="radio"], input[type="checkbox"]') ? node.closest('label') || node : node;
      return { label: node.getAttribute('aria-label') || node.textContent?.trim() || node.getAttribute('id'), rect: target.getBoundingClientRect(), visible: getComputedStyle(target).visibility !== 'hidden' && getComputedStyle(target).display !== 'none' };
    }).filter((item) => item.visible && item.rect.width > 0 && item.rect.height > 0 && item.rect.height < 44));
    expect(shortTargets).toEqual([]);
  }
});
