import { Component, OnInit, Signal, WritableSignal, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { DateSelectorComponent } from './date-selector.component';
import { DeskListComponent } from './desk-list.component';
import { DeskAvailabilityService } from '../../core/services/desk-availability.service';
import { DeskAvailabilityItem } from '../../shared/models/desk-availability.model';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
    MatButtonModule
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
          <button mat-raised-button color="primary" (click)="loadDeskAvailability()">
            Spróbuj ponownie
          </button>
        </div>
      } @else {
        <app-desk-list
          [desks]="deskAvailabilityList()"
          [selectedDate]="selectedDate()"
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
  private deskService = inject(DeskAvailabilityService);
  private snackBar = inject(MatSnackBar);

  // Sygnały
  public selectedDate: WritableSignal<Date> = signal<Date>(new Date());
  public deskAvailabilityList: WritableSignal<DeskAvailabilityItem[] | null> = signal<DeskAvailabilityItem[] | null>(null);
  public isLoading: WritableSignal<boolean> = signal<boolean>(false);
  public error: WritableSignal<string | null> = signal<string | null>(null);

  // Formatowana data dla API (YYYY-MM-DD)
  public formattedDate: Signal<string> = computed(() => {
    const date = this.selectedDate();
    return this.formatDateForApi(date);
  });

  constructor() {
    // Efekt do automatycznego ładowania danych przy zmianie daty
    effect(() => {
      // Odczytujemy wartość formattedDate aby zarejestrować zależność
      const dateForApi = this.formattedDate();
      // Ładujemy dane
      this.loadDeskAvailability();
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
   */
  loadDeskAvailability(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const dateForApi = this.formattedDate();

    this.deskService.getDeskAvailability(dateForApi).subscribe({
      next: (desks) => {
        this.deskAvailabilityList.set(desks);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Błąd podczas pobierania dostępności biurek', error);

        let errorMessage = 'Nie udało się załadować listy biurek. Spróbuj ponownie później.';

        if (error.status === 400) {
          errorMessage = 'Wybrana data jest nieprawidłowa. Proszę wybrać poprawną datę.';
        }

        this.error.set(errorMessage);
        this.isLoading.set(false);
        this.deskAvailabilityList.set(null);

        this.snackBar.open(errorMessage, 'Zamknij', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
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
