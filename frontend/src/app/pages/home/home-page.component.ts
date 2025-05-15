import { Component, OnInit, Signal, WritableSignal, computed, effect, inject, signal, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DateSelectorComponent } from './date-selector.component';
import { DeskListComponent } from './desk-list.component';
import { DeskAvailabilityService } from '../../core/services/desk-availability.service';
import { DeskAvailabilityItem } from '../../shared/models/desk-availability.model';
import { DeskAvailabilityViewModel, ReservationRequest, ReservationResponse } from '../../shared/models/reservation.model';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ReservationService } from '../../core/services/reservation.service';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { ReservationConfirmDialogComponent } from './reservation-confirm-dialog.component';
import { SnackbarService } from '../../core/services/snackbar.service';

/**
 * Główny komponent strony głównej (HomePage)
 * Container component odpowiedzialny za zarządzanie stanem i koordynację komponentów potomnych
 */
@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    DateSelectorComponent,
    DeskListComponent,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatButtonModule,
    MatDialogModule
  ],
  template: `
    <div class="home-page-container">
      <h1 class="page-title">DeskHero - Rezerwacja biurek</h1>

      <app-date-selector (dateSelected)="onDateSelected($event)"></app-date-selector>

      @if (isLoading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Ładowanie dostępności biurek...</p>
        </div>
      } @else if (error()) {
        <div class="error-container">
          <p class="error-message">{{ error() }}</p>
          <button mat-raised-button color="primary" (click)="loadDesks()">
            Spróbuj ponownie
          </button>
        </div>
      } @else {
        <app-desk-list
          [desks]="deskAvailabilityList()"
          [selectedDate]="selectedDate()"
          [isLoggedIn]="isUserLoggedIn()"
          (reservationRequested)="onReserveRequest($event)"
        ></app-desk-list>
      }
    </div>
  `,
  styles: [`
    .home-page-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    .page-title {
      margin-bottom: 24px;
      color: var(--primary-color);
      text-align: center;
    }

    .loading-container, .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-top: 48px;
      gap: 16px;
    }

    .error-message {
      color: var(--error-color, red);
      font-weight: 500;
      text-align: center;
    }
  `]
})
export class HomePageComponent implements OnInit {
  // Wstrzykiwanie zależności
  private deskAvailabilityService = inject(DeskAvailabilityService);
  private reservationService = inject(ReservationService);
  private authService = inject(AuthService);
  private snackbarService = inject(SnackbarService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  // Sygnały
  public selectedDate: WritableSignal<Date> = signal<Date>(new Date());
  public deskAvailabilityList: WritableSignal<DeskAvailabilityViewModel[] | null> = signal<DeskAvailabilityViewModel[] | null>(null);
  public isLoading: WritableSignal<boolean> = signal<boolean>(false);
  public error: WritableSignal<string | null> = signal<string | null>(null);
  public isUserLoggedIn: Signal<boolean> = computed(() => this.authService.isLoggedIn());

  // Formatowana data dla API (YYYY-MM-DD)
  public formattedDate: Signal<string> = computed(() => {
    const date = this.selectedDate();
    return this.formatDateForApi(date);
  });

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Efekt do automatycznego ładowania danych przy zmianie daty
    effect(() => {
      // Odczytujemy wartość formattedDate aby zarejestrować zależność
      const dateForApi = this.formattedDate();
      // Ładujemy dane tylko w przeglądarce, nie podczas prerenderowania
      if (isPlatformBrowser(this.platformId)) {
        this.loadDesks();
      }
    });
  }

  ngOnInit(): void {
    // Początkowe ładowanie danych nastąpi automatycznie dzięki effect
  }

  /**
   * Obsługuje wybór daty przez użytkownika
   */
  onDateSelected(date: Date): void {
    this.selectedDate.set(date);
    // Ładowanie danych nastąpi automatycznie dzięki effect
  }

  /**
   * Ładuje dostępność biurek z API
   * Dla zalogowanych użytkowników używa endpointu /api/desks/availability
   * Dla gości używa endpointu /api/guest/desks/availability (poprzez DeskAvailabilityService)
   */
  loadDesks(): void {
    // Nie wykonujemy zapytań API podczas prerenderowania SSR
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const dateForApi = this.formattedDate();

    // Używamy odpowiedniego serwisu w zależności od stanu logowania
    const apiObservable = this.isUserLoggedIn()
      ? this.reservationService.getAvailability(dateForApi)
      : this.deskAvailabilityService.getDeskAvailability(dateForApi);

    apiObservable.subscribe({
      next: (desks) => {
        // Mapujemy DeskAvailabilityItem na DeskAvailabilityViewModel
        // (obecnie są identyczne, ale mogą się różnić w przyszłości)
        const viewModels: DeskAvailabilityViewModel[] = desks.map(desk => ({
          deskId: desk.deskId,
          roomName: desk.roomName,
          deskNumber: desk.deskNumber,
          isAvailable: desk.isAvailable
        }));

        this.deskAvailabilityList.set(viewModels);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Błąd podczas pobierania dostępności biurek', error);

        let errorMessage = 'Nie udało się załadować listy biurek. Spróbuj ponownie później.';

        if (error.status === 400) {
          errorMessage = 'Wybrana data jest nieprawidłowa. Proszę wybrać poprawną datę.';
        } else if (error.status === 401) {
          this.router.navigate(['/login']);
          errorMessage = 'Sesja wygasła. Zaloguj się ponownie.';
        }

        this.error.set(errorMessage);
        this.isLoading.set(false);
        this.deskAvailabilityList.set(null);

        this.snackbarService.error(errorMessage);
      }
    });
  }

  /**
   * Obsługuje żądanie rezerwacji biurka
   */
  onReserveRequest(desk: DeskAvailabilityViewModel): void {
    // Sprawdzamy, czy użytkownik jest zalogowany
    if (!this.isUserLoggedIn()) {
      this.snackbarService.info('Zaloguj się, aby zarezerwować biurko', 'Zaloguj')
        .onAction().subscribe(() => {
          this.router.navigate(['/login']);
        });
      return;
    }

    // Otwieramy dialog potwierdzenia
    const dialogRef = this.dialog.open(ReservationConfirmDialogComponent, {
      width: '400px',
      data: {
        desk: desk,
        date: this.selectedDate()
      }
    });

    // Obsługujemy odpowiedź z dialogu
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.createReservation(desk);
      }
    });
  }

  /**
   * Tworzy rezerwację biurka
   */
  private createReservation(desk: DeskAvailabilityViewModel): void {
    const request: ReservationRequest = {
      deskId: desk.deskId,
      reservationDate: this.formattedDate()
    };

    this.isLoading.set(true);

    this.reservationService.createReservation(request).subscribe({
      next: (response: ReservationResponse) => {
        this.isLoading.set(false);

        this.snackbarService.success('Biurko zostało zarezerwowane pomyślnie!');

        // Odświeżamy listę, aby pokazać aktualne dane
        this.loadDesks();
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading.set(false);
        console.error('Błąd podczas rezerwacji biurka', error);

        let errorMessage = 'Nie udało się zarezerwować biurka. Spróbuj ponownie później.';

        if (error.status === 400) {
          errorMessage = 'Nieprawidłowe dane rezerwacji.';
        } else if (error.status === 409) {
          errorMessage = 'To biurko jest już zarezerwowane na ten dzień.';
        } else if (error.status === 401) {
          this.router.navigate(['/login']);
          errorMessage = 'Sesja wygasła. Zaloguj się ponownie.';
        }

        this.snackbarService.error(errorMessage);
      }
    });
  }

  /**
   * Formatuje datę do formatu YYYY-MM-DD wymaganego przez API
   */
  private formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
