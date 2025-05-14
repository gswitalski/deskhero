import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/login.page';

test.describe('Proces logowania', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('powinien zalogować użytkownika z poprawnymi danymi', async () => {
    // Gdy wprowadzam poprawne dane logowania
    await loginPage.login('test@example.com', 'password123');

    // Wtedy powinienem zostać przekierowany na stronę główną
    await loginPage.expectLoggedIn();
  });

  test('powinien wyświetlić błąd dla niepoprawnych danych', async () => {
    // Gdy wprowadzam niepoprawne dane logowania
    await loginPage.login('wrong@example.com', 'wrongpassword');

    // Wtedy powinienem zobaczyć komunikat o błędzie
    await loginPage.expectErrorMessage('Niepoprawne dane logowania');
  });
});
