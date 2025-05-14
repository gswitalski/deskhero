import { chromium, FullConfig } from '@playwright/test';

/**
 * Globalny setup dla testów E2E
 *
 * Wykonuje logowanie użytkownika i zapisuje stan sesji,
 * aby mógł być wykorzystany przez testy.
 */
async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Zapisujemy stan przeglądarki do wykorzystania w testach
  // Zakomentowany kod poniżej pokazuje jak zapisać stan po zalogowaniu
  /*
  // Przejdź do strony logowania
  await page.goto(`${baseURL}/login`);

  // Wypełnij formularz logowania
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password123');

  // Kliknij przycisk logowania
  await page.click('[data-testid="login-button"]');

  // Poczekaj na zalogowanie
  await page.waitForNavigation();

  // Zapisz stan jako plik do wykorzystania w testach
  await page.context().storageState({ path: './e2e/storage-state.json' });
  */

  await browser.close();
}

export default globalSetup;
