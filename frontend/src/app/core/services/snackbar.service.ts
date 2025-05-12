import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef } from '@angular/material/snack-bar';

/**
 * Serwis do zarządzania powiadomieniami (toastami) przy użyciu MatSnackBar
 * Zapewnia spójny wygląd i zachowanie powiadomień w całej aplikacji
 */
@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  private snackBar = inject(MatSnackBar);

  /** Konfiguracja domyślna dla wszystkich powiadomień */
  private defaultConfig: MatSnackBarConfig = {
    duration: 5000,
    horizontalPosition: 'center',
    verticalPosition: 'bottom',
  };

  /**
   * Wyświetla powiadomienie o sukcesie
   * @param message Treść powiadomienia
   * @param action Opcjonalny tekst przycisku akcji
   * @returns Referencja do utworzonego SnackBar
   */
  success(message: string, action: string = 'OK'): MatSnackBarRef<any> {
    return this.snackBar.open(message, action, {
      ...this.defaultConfig,
      panelClass: 'success-snackbar',
    });
  }

  /**
   * Wyświetla powiadomienie o błędzie
   * @param message Treść powiadomienia
   * @param action Opcjonalny tekst przycisku akcji
   * @returns Referencja do utworzonego SnackBar
   */
  error(message: string, action: string = 'Zamknij'): MatSnackBarRef<any> {
    return this.snackBar.open(message, action, {
      ...this.defaultConfig,
      panelClass: 'error-snackbar',
    });
  }

  /**
   * Wyświetla powiadomienie informacyjne
   * @param message Treść powiadomienia
   * @param action Opcjonalny tekst przycisku akcji
   * @returns Referencja do utworzonego SnackBar
   */
  info(message: string, action: string = 'OK'): MatSnackBarRef<any> {
    return this.snackBar.open(message, action, {
      ...this.defaultConfig,
      panelClass: 'info-snackbar',
    });
  }

  /**
   * Wyświetla powiadomienie z ostrzeżeniem
   * @param message Treść powiadomienia
   * @param action Opcjonalny tekst przycisku akcji
   * @returns Referencja do utworzonego SnackBar
   */
  warning(message: string, action: string = 'OK'): MatSnackBarRef<any> {
    return this.snackBar.open(message, action, {
      ...this.defaultConfig,
      panelClass: 'warning-snackbar',
    });
  }
}
