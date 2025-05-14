import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Reservation } from '../../../shared/models/reservation.model';

@Component({
  selector: 'app-reservation-item',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  template: `
    <div class="reservation-item">
      <div class="reservation-details">
        <div class="reservation-room">
          <span class="label">Sala:</span> {{ reservation.roomName }}
        </div>

        <div class="reservation-desk">
          <span class="label">Biurko:</span> {{ reservation.deskNumber }}
        </div>

        <div class="reservation-date">
          <span class="label">Data:</span> {{ reservation.reservationDate | date:'dd.MM.yyyy' }}
        </div>
      </div>

      <div class="reservation-actions">
        @if (listType === 'upcoming') {
          <button
            mat-icon-button
            color="warn"
            matTooltip="Anuluj rezerwację"
            (click)="onCancelClick()">
            <mat-icon>cancel</mat-icon>
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .reservation-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 8px;
    }

    .reservation-details {
      display: flex;
      gap: 24px;
    }

    .label {
      font-weight: 500;
      color: #666;
    }

    @media (max-width: 768px) {
      .reservation-details {
        flex-direction: column;
        gap: 8px;
      }

      .reservation-item {
        padding: 16px 0;
      }
    }
  `]
})
export class ReservationItemComponent {
  @Input() reservation!: Reservation;
  @Input() listType: 'upcoming' | 'past' = 'upcoming';
  @Output() cancel = new EventEmitter<number>();

  onCancelClick(): void {
    this.cancel.emit(this.reservation.reservationId);
  }
}
