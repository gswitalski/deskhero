import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object dla strony logowania
 * Implementuje wzorzec Page Object Model (POM)
 */
export class LoginPage {
  // Lokatory elementów na stronie
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  /**
   * Konstruktor klasy
   */
  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('[data-testid="email"]');
    this.passwordInput = page.locator('[data-testid="password"]');
    this.loginButton = page.locator('[data-testid="login-button"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
  }

  /**
   * Nawiguje do strony logowania
   */
  async goto() {
    await this.page.goto('/login');
  }

  /**
   * Wykonuje proces logowania
   */
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Weryfikuje czy użytkownik jest zalogowany
   */
  async expectLoggedIn() {
    // Przykład: sprawdzanie czy użytkownik został przekierowany na dashboard
    await expect(this.page).toHaveURL(/.*dashboard/);
  }

  /**
   * Weryfikuje czy pojawił się komunikat błędu
   */
  async expectErrorMessage(message?: string) {
    await expect(this.errorMessage).toBeVisible();
    if (message) {
      await expect(this.errorMessage).toContainText(message);
    }
  }
}
