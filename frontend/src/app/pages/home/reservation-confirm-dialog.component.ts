import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DeskAvailabilityViewModel } from '../../shared/models/reservation.model';

/**
 * Interfejs danych wejściowych dla dialogu potwierdzenia rezerwacji
 */
export interface ReservationConfirmDialogData {
  desk: DeskAvailabilityViewModel;
  date: Date;
}

/**
 * Komponent dialogu potwierdzającego rezerwację biurka
 */
@Component({
  selector: 'dehe-reservation-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  template: `
    <div class="reservation-confirm-dialog">
      <h2 mat-dialog-title>Potwierdź rezerwację</h2>

      <mat-dialog-content>
        <p>Czy na pewno chcesz zarezerwować to biurko?</p>

        <div class="desk-details">
          <div class="detail-row">
            <span class="label">Pomieszczenie:</span>
            <span class="value">{{ data.desk.roomName }}</span>
          </div>

          <div class="detail-row">
            <span class="label">Biurko:</span>
            <span class="value">{{ data.desk.deskNumber }}</span>
          </div>

          <div class="detail-row">
            <span class="label">Data:</span>
            <span class="value">{{ formatDate(data.date) }}</span>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button
          mat-button
          mat-dialog-close
          aria-label="Anuluj rezerwację"
        >
          Anuluj
        </button>
        <button
          mat-raised-button
          color="primary"
          (click)="confirmReservation()"
          aria-label="Potwierdź rezerwację"
        >
          Potwierdź
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .reservation-confirm-dialog {
      padding: 16px;
      max-width: 500px;
    }

    .desk-details {
      margin: 24px 0;
      border: 1px solid #eee;
      border-radius: 4px;
      padding: 16px;
      background-color: #f9f9f9;
    }

    .detail-row {
      display: flex;
      margin-bottom: 8px;
    }

    .label {
      font-weight: 500;
      flex: 0 0 120px;
    }

    .value {
      flex: 1;
    }
  `]
})
export class ReservationConfirmDialogComponent {
  /** Dane wejściowe dialogu */
  data = inject(MAT_DIALOG_DATA) as ReservationConfirmDialogData;

  /** Referencja do dialogu */
  private dialogRef = inject(MatDialogRef<ReservationConfirmDialogComponent>);

  /**
   * Potwierdza rezerwację i zamyka dialog
   */
  confirmReservation(): void {
    this.dialogRef.close(true);
  }

  /**
   * Formatuje datę do wyświetlenia
   */
  formatDate(date: Date): string {
    return date.toLocaleDateString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
