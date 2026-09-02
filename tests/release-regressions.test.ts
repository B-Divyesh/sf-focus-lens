import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('release regression guards', () => {
  it('keeps claim tests independent from ignored WXT-generated configuration', async () => {
    const tsconfig = JSON.parse(await readFile('tsconfig.json', 'utf8'));
    const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
    const claims = JSON.parse(await readFile('.factory/claims.json', 'utf8'));

    expect(JSON.stringify(tsconfig)).not.toContain('.wxt/tsconfig.json');
    expect(tsconfig.include).not.toContain('.wxt/**/*.d.ts');
    expect(packageJson.scripts.test).toContain('vitest run');
    expect(claims).toHaveLength(13);
    for (const claim of claims) {
      expect(claim.test).toBe(`npm test -- --grep @claim:${claim.id}`);
    }
  });

  it('sets immutable caching for deployed static assets and the extension download', async () => {
    const config = JSON.parse(await readFile('site/public/staticwebapp.config.json', 'utf8'));
    const immutable = 'public, max-age=31536000, immutable';
    expect(config.routes).toEqual(expect.arrayContaining([
      expect.objectContaining({ route: '/assets/*', headers: { 'Cache-Control': immutable } }),
      expect.objectContaining({ route: '/downloads/*', headers: { 'Cache-Control': immutable } })
    ]));
  });

  it('routes only known app pages through the SPA and leaves unknown paths for HTTP 404', async () => {
    const config = JSON.parse(await readFile('site/public/staticwebapp.config.json', 'utf8'));
    const routes = config.routes.filter((route: { rewrite?: string }) => route.rewrite === '/index.html').map((route: { route: string }) => route.route);

    expect(config.navigationFallback).toBeUndefined();
    expect(routes).toEqual([]);
    expect(config.routes).toEqual(expect.arrayContaining([
      { route: '/demo', rewrite: '/demo/index.html' },
      { route: '/install', rewrite: '/install/index.html' },
      { route: '/privacy', rewrite: '/privacy/index.html' },
      { route: '/terms', rewrite: '/terms/index.html' },
      { route: '/404', rewrite: '/404.html' }
    ]));
    expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html' });
  });

  it('keeps waypoint capture structural so page text cannot enter extension storage', async () => {
    const pageAgent = await readFile('lib/page-agent.ts', 'utf8');
    const captureHandler = pageAgent.slice(pageAgent.indexOf("if (message.type === 'FOCUS_LENS_CAPTURE')"), pageAgent.indexOf("if (message.type === 'FOCUS_LENS_GOTO')"));

    expect(captureHandler).toContain('selector: selectorFor(active)');
    expect(captureHandler).not.toContain('textContent');
    expect(captureHandler).not.toContain('innerText');
    expect(captureHandler).not.toContain('aria-label');
  });

  it('keeps visible focus rules on both opacity-zero contrast control labels', async () => {
    const siteStyles = await readFile('site/src/style.css', 'utf8');
    const popupStyles = await readFile('entrypoints/popup/style.css', 'utf8');

    expect(siteStyles).toContain('.segment label:has(input:focus-visible)');
    expect(popupStyles).toContain('.segmented label:has(input:focus-visible)');
    for (const styles of [siteStyles, popupStyles]) {
      expect(styles).toContain('outline: 4px solid');
    }
  });

  it('keeps both waypoint forms visibly required and able to announce recovery', async () => {
    const popup = await readFile('entrypoints/popup/index.html', 'utf8');
    const popupCode = await readFile('entrypoints/popup/main.ts', 'utf8');
    const demo = await readFile('site/src/main.ts', 'utf8');

    for (const source of [popup, demo]) {
      expect(source).toContain('novalidate');
      expect(source).toContain('required');
      expect(source).toContain('role="alert"');
      expect(source).toContain('Required.');
    }
    expect(popupCode).toContain('validateWaypointName');
    expect(demo).toContain('validateWaypointName');
  });

  it('builds route-specific source metadata and one shared 404 shell', async () => {
    const generator = await readFile('scripts/create-route-pages.mjs', 'utf8');
    const main = await readFile('site/src/main.ts', 'utf8');
    expect(generator).toContain("['demo', 'Demo — Focus Lens'");
    expect(generator).toContain("['privacy', 'Privacy — Focus Lens'");
    expect(generator).toContain("['404', 'Page not found — Focus Lens'");
    expect(main).toContain('const shell =');
    expect(main).toContain("app.innerHTML = shell(`<main id=\"main\" class=\"not-found\"");
  });
});
