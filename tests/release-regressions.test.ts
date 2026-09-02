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
    expect(claims).toHaveLength(7);
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
});
