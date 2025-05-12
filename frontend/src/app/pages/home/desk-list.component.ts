import { Component, Input, Signal, Output, EventEmitter, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { DeskAvailabilityViewModel } from '../../shared/models/reservation.model';

/**
 * Komponent odpowiedzialny za wyświetlanie listy biurek dla wybranej daty
 * Sortuje biurka według roomName, a następnie deskNumber
 */
@Component({
  selector: 'app-desk-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatListModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule
  ],
  template: `
    <div class="desk-list-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            Dostępność biurek
            @if (selectedDate) {
              <span class="selected-date"> - {{ formatDate(selectedDate) }}</span>
            }
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (sortedDesks()?.length) {
            <mat-list role="list" aria-label="Lista dostępności biurek">
              @for (desk of sortedDesks(); track desk.deskId) {
                <mat-list-item role="listitem">
                  <div class="desk-item">
                    <div class="desk-details">
                      <span class="room-name">{{ desk.roomName }}</span>
                      <span class="desk-number">Biurko {{ desk.deskNumber }}</span>
                    </div>
                    <div class="desk-actions">
                      <div
                        class="desk-status"
                        [class.available]="desk.isAvailable"
                        [class.unavailable]="!desk.isAvailable"
                        [attr.aria-label]="desk.isAvailable ? 'Biurko dostępne' : 'Biurko zajęte'"
                      >
                        @if (desk.isAvailable) {
                          <mat-icon aria-hidden="true">check_circle</mat-icon>
                          <span>Dostępne</span>
                        } @else {
                          <mat-icon aria-hidden="true">cancel</mat-icon>
                          <span>Zajęte</span>
                        }
                      </div>
                      @if (isLoggedIn && desk.isAvailable && isDateTodayOrLater()) {
                        <button
                          mat-raised-button
                          color="primary"
                          (click)="onReserveClick(desk)"
                          aria-label="Zarezerwuj biurko"
                        >
                          Zarezerwuj
                        </button>
                      }
                    </div>
                  </div>
                </mat-list-item>
                <mat-divider></mat-divider>
              }
            </mat-list>
          } @else if (desks === null) {
            <div class="empty-state loading" role="status">
              <p>Ładowanie biurek...</p>
            </div>
          } @else {
            <div class="empty-state no-desks" role="status">
              <p>Brak dostępnych biurek dla wybranego dnia.</p>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .desk-list-container {
      margin-top: 20px;
    }

    .selected-date {
      font-size: 0.9rem;
      color: var(--secondary-text-color);
      margin-left: 8px;
    }

    .desk-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 8px 0;
    }

    .desk-details {
      display: flex;
      flex-direction: column;
    }

    .room-name {
      font-weight: 500;
      font-size: 1rem;
    }

    .desk-number {
      color: var(--secondary-text-color);
      font-size: 0.9rem;
    }

    .desk-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .desk-status {
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 500;
    }

    .desk-status.available {
      color: var(--success-color, green);
    }

    .desk-status.unavailable {
      color: var(--error-color, red);
    }

    .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100px;
      color: var(--secondary-text-color);
    }
  `]
})
export class DeskListComponent {
  /** Lista biurek do wyświetlenia */
  @Input({ required: false }) set desks(value: DeskAvailabilityViewModel[] | null) {
    this._desks.set(value);
  }

  /** Aktualnie wybrana data */
  // Przechowuję wybraną datę w sygnale, aby móc reagować na zmiany i sprawdzać datę
  private selectedDateSignal = signal<Date | null>(null);

  /** Aktualnie wybrana data - setter ustawia sygnał */
  @Input({ required: false })
  set selectedDate(value: Date | null) {
    this.selectedDateSignal.set(value);
  }

  /** Getter zwraca aktualną wartość wybranej daty */
  public get selectedDate(): Date | null {
    return this.selectedDateSignal();
  }

  /** Czy użytkownik jest zalogowany */
  @Input({ required: false }) isLoggedIn = false;

  /** Emiter zdarzenia żądania rezerwacji biurka */
  @Output() reservationRequested = new EventEmitter<DeskAvailabilityViewModel>();

  /** Prywatny signal przechowujący listę biurek */
  private _desks = signal<DeskAvailabilityViewModel[] | null>(null);

  /** Posortowana lista biurek (według roomName, a następnie deskNumber) */
  sortedDesks: Signal<DeskAvailabilityViewModel[] | null> = computed(() => {
    const desks = this._desks();
    if (!desks) return null;
    if (desks.length === 0) return [];

    return [...desks].sort((a, b) => {
      // Najpierw sortuj według nazwy pomieszczenia
      const roomNameComparison = a.roomName.localeCompare(b.roomName);
      if (roomNameComparison !== 0) return roomNameComparison;

      // Jeśli nazwy pomieszczeń są takie same, sortuj według numeru biurka
      return a.deskNumber.localeCompare(b.deskNumber, undefined, { numeric: true });
    });
  });

  /**
   * Sygnalizacja, czy wybrana data to dzisiaj lub późniejsza
   */
  isDateTodayOrLater = computed<boolean>(() => {
    const date = this.selectedDateSignal();
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(date);
    selected.setHours(0, 0, 0, 0);
    return selected >= today;
  });

  /**
   * Formatuje datę do wyświetlenia
   */
  formatDate(date: Date): string {
    return date.toLocaleDateString('pl-PL');
  }

  /**
   * Obsługuje kliknięcie przycisku rezerwacji
   */
  onReserveClick(desk: DeskAvailabilityViewModel): void {
    this.reservationRequested.emit(desk);
  }
}
