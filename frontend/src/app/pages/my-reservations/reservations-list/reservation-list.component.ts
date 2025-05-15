import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { ReservationItemComponent } from '../reservation-item/reservation-item.component';
import { Reservation } from '../../../shared/models/reservation.model';

@Component({
  selector: 'dehe-reservation-list',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    ReservationItemComponent
  ],
  template: `
    <div class="reservation-list">
      @if (reservations.length === 0) {
        <mat-card class="empty-list">
          <mat-card-content>
            <p>Brak rezerwacji.</p>
          </mat-card-content>
        </mat-card>
      } @else {
        <mat-list>
          @for (reservation of reservations; track reservation.reservationId) {
            <dehe-reservation-item
              [reservation]="reservation"
              [listType]="listType"
              (cancelRequest)="onCancelReservation($event)">
            </dehe-reservation-item>
            @if (!$last) {
              <mat-divider></mat-divider>
            }
          }
        </mat-list>
      }
    </div>
  `,
  styles: [`
    .reservation-list {
      padding: 16px 0;
    }

    .empty-list {
      text-align: center;
      padding: 24px;
      background-color: #f9f9f9;
    }

    mat-list {
      padding: 0;
    }
  `]
})
export class ReservationListComponent {
  @Input() reservations: Reservation[] = [];
  @Input() listType: 'upcoming' | 'past' = 'upcoming';
  @Output() cancelRequest = new EventEmitter<number>();

  onCancelReservation(reservationId: number): void {
    this.cancelRequest.emit(reservationId);
  }
}
