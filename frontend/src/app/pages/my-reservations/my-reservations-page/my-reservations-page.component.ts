import { Component, OnInit, computed, inject, signal, PLATFORM_ID, Inject } from '@angular/core';
import { AsyncPipe, DatePipe, NgClass, isPlatformBrowser } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReservationService } from '../../../core/services/reservation.service';
import { Reservation, DeleteReservationResponse } from '../../../shared/models/reservation.model';

@Component({
  selector: 'app-my-reservations-page',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    NgClass,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule
  ],
  template: `
    <div class="container">
      <h1>Moje rezerwacje</h1>

      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="50"></mat-spinner>
        </div>
      } @else if (error()) {
        <div class="error-container">
          <p>Wystąpił błąd podczas pobierania rezerwacji: {{ error() }}</p>
          <button mat-raised-button color="primary" (click)="loadReservations()">Spróbuj ponownie</button>
        </div>
      } @else {
        <mat-tab-group animationDuration="300ms">
          <mat-tab label="Nadchodzące">
            <div class="tab-container">
              <div class="reservations-list">
                @if (upcomingReservations().length === 0) {
                  <div class="empty-list">
                    <p>Brak nadchodzących rezerwacji.</p>
                  </div>
                } @else {
                  @for (reservation of upcomingReservations(); track reservation.reservationId) {
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
                        <button
                          mat-icon-button
                          color="warn"
                          matTooltip="Anuluj rezerwację"
                          (click)="onCancelRequest(reservation.reservationId)">
                          <mat-icon>cancel</mat-icon>
                        </button>
                      </div>
                    </div>
                    @if (!$last) {
                      <mat-divider></mat-divider>
                    }
                  }
                }
              </div>
            </div>
          </mat-tab>
          <mat-tab label="Przeszłe">
            <div class="tab-container">
              <div class="reservations-list">
                @if (pastReservations().length === 0) {
                  <div class="empty-list">
                    <p>Brak przeszłych rezerwacji.</p>
                  </div>
                } @else {
                  @for (reservation of pastReservations(); track reservation.reservationId) {
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
                    </div>
                    @if (!$last) {
                      <mat-divider></mat-divider>
                    }
                  }
                }
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    h1 {
      color: var(--primary-color);
      margin-bottom: 24px;
    }

    .loading-container, .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      gap: 24px;
    }

    mat-tab-group {
      margin-top: 16px;
    }

    .tab-container {
      padding: 16px 0;
    }

    .empty-list {
      text-align: center;
      padding: 24px;
      background-color: #f9f9f9;
      border-radius: 4px;
      margin: 16px 0;
    }

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
export class MyReservationsPageComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private platformId = inject(PLATFORM_ID);

  // Sygnały stanu
  protected loading = signal<boolean>(false);
  protected error = signal<string | null>(null);
  private reservations = signal<Reservation[]>([]);

  // Computed properties
  protected upcomingReservations = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.reservations().filter(reservation => {
      const reservationDate = new Date(reservation.reservationDate);
      reservationDate.setHours(0, 0, 0, 0);
      return reservationDate >= today;
    });
  });

  protected pastReservations = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.reservations().filter(reservation => {
      const reservationDate = new Date(reservation.reservationDate);
      reservationDate.setHours(0, 0, 0, 0);
      return reservationDate < today;
    });
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadReservations();
    }
  }

  loadReservations(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.reservationService.getReservations().subscribe({
      next: (data) => {
        this.reservations.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Błąd podczas pobierania rezerwacji:', err);
        this.error.set(err.message || 'Nieznany błąd');
        this.loading.set(false);
      }
    });
  }

  async onCancelRequest(reservationId: number): Promise<void> {
    const { ConfirmCancelDialogComponent } = await import('../confirm-cancel-dialog/confirm-cancel-dialog.component');

    const dialogRef = this.dialog.open(ConfirmCancelDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading.set(true);

        this.reservationService.deleteReservation(reservationId).subscribe({
          next: (response: DeleteReservationResponse) => {
            // Filtrujemy rezerwację z listy po udanym usunięciu
            const currentReservations = this.reservations();
            this.reservations.set(
              currentReservations.filter(r => r.reservationId !== reservationId)
            );

            this.snackBar.open(response.message || 'Rezerwacja została anulowana', 'Zamknij', {
              duration: 3000
            });

            this.loading.set(false);
          },
          error: (err) => {
            console.error('Błąd podczas anulowania rezerwacji:', err);

            this.snackBar.open(
              err.error?.message || 'Wystąpił błąd podczas anulowania rezerwacji',
              'Zamknij',
              { duration: 5000 }
            );

            this.loading.set(false);
          }
        });
      }
    });
  }
}
