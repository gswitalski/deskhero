import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  /**
   * Wyświetla powiadomienie typu sukces
   * @param message Treść wiadomości
   * @param duration Czas trwania powiadomienia w milisekundach (domyślnie 3000ms)
   */
  showSuccess(message: string, duration = 3000): void {
    this.snackBar.open(message, 'Zamknij', {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Wyświetla powiadomienie typu błąd
   * @param message Treść wiadomości o błędzie
   * @param duration Czas trwania powiadomienia w milisekundach (domyślnie 5000ms dla błędów)
   */
  showError(message: string, duration = 5000): void {
    this.snackBar.open(message, 'Zamknij', {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Wyświetla powiadomienie typu informacja
   * @param message Treść wiadomości informacyjnej
   * @param duration Czas trwania powiadomienia w milisekundach (domyślnie 3000ms)
   */
  showInfo(message: string, duration = 3000): void {
    this.snackBar.open(message, 'Zamknij', {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['info-snackbar']
    });
  }
}
