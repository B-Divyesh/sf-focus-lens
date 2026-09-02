import { defineConfig } from '@playwright/test';

const liveBaseUrl = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  fullyParallel: true,
  reporter: 'line',
  use: {
    baseURL: liveBaseUrl || 'http://127.0.0.1:4173',
    viewport: { width: 1280, height: 800 },
    trace: 'retain-on-failure'
  },
  webServer: liveBaseUrl ? undefined : {
    command: 'npm run build && node scripts/serve-static.mjs',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 120_000
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }]
});
