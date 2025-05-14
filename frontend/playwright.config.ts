import { defineConfig, devices } from '@playwright/test';

/**
 * Konfiguracja Playwright dla testów E2E aplikacji DeskHero
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: [['html'], ['list']],

  // Limit czasu testów: 30 sekund na test
  timeout: 30000,

  // Globalny setup i teardown
  globalSetup: './e2e/global-setup.ts',

  use: {
    // Używamy tylko przeglądarki Chromium zgodnie z wytycznymi
    ...devices['Desktop Chrome'],

    // Opcje dla wszystkich testów
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // Konfiguracja projektu testowego
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],

  // Serwer lokalny do uruchamiania podczas testów
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env['CI'],
    timeout: 60000,
  },
});
