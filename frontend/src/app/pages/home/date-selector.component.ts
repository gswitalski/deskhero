import { Component, EventEmitter, Input, OnInit, Output, Signal, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

/**
 * Komponent odpowiedzialny za wybór daty przez użytkownika
 * Wyświetla zakres 7 dni (tydzień) i umożliwia nawigację między tygodniami
 */
@Component({
  selector: 'dehe-date-selector',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule],
  template: `
    <div class="date-selector-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Wybierz datę</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="navigation-controls">
            <button
              mat-icon-button
              (click)="previousWeek()"
              aria-label="Poprzedni tydzień"
            >
              <mat-icon aria-hidden="true">keyboard_arrow_left</mat-icon>
            </button>
            <span class="week-range" aria-live="polite">
              {{ weekStartFormatted() }} - {{ weekEndFormatted() }}
            </span>
            <button
              mat-icon-button
              (click)="nextWeek()"
              aria-label="Następny tydzień"
            >
              <mat-icon aria-hidden="true">keyboard_arrow_right</mat-icon>
            </button>
          </div>

          <div class="days-container" role="group" aria-label="Wybór dnia">
            @for (day of weekDays(); track day.date) {
              <button
                mat-button
                [class.selected]="isSelectedDay(day.date)"
                [attr.aria-pressed]="isSelectedDay(day.date)"
                [attr.aria-current]="isToday(day.date) ? 'date' : null"
                (click)="selectDate(day.date)"
                [attr.aria-label]="'Wybierz ' + formatDateForA11y(day.date) + (isToday(day.date) ? ' (dzisiaj)' : '')"
              >
                <div class="day-button-content">
                  <span class="day-name">{{ day.dayName }}</span>
                  <span class="day-date">{{ day.dayDate }}</span>
                  @if (isToday(day.date)) {
                    <span class="today-indicator">Dziś</span>
                  }
                </div>
              </button>
            }
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .date-selector-container {
      margin-bottom: 20px;
    }

    .navigation-controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .week-range {
      font-weight: 500;
    }

    .days-container {
      display: flex;
      overflow-x: auto;
      gap: 8px;
    }

    .day-button-content {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .day-name {
      font-weight: 500;
    }

    .day-date {
      font-size: 0.9rem;
    }

    .today-indicator {
      font-size: 0.8rem;
      color: var(--primary-color);
      margin-top: 4px;
    }

    button.selected {
      background-color: var(--primary-color);
      color: white;
    }

    button.selected .today-indicator {
      color: white;
    }

    /* Style dla responsywności mobile */
    @media (max-width: 600px) {
      .days-container {
        padding-bottom: 8px;
      }

      .day-button-content {
        min-width: 60px;
      }
    }
  `]
})
export class DateSelectorComponent implements OnInit {
  /** Opcjonalna data inicjalna */
  @Input() initialDate?: Date;

  /** Event emitujący wybraną datę */
  @Output() dateSelected = new EventEmitter<Date>();

  /** Aktualnie wybrana data */
  private currentSelectedDate = signal<Date>(new Date());

  /** Data rozpoczęcia aktualnie wyświetlanego tygodnia */
  private weekStartDate = signal<Date>(this.getStartOfWeek(new Date()));

  /** Formatowana data początku tygodnia */
  weekStartFormatted: Signal<string> = computed(() =>
    this.formatDate(this.weekStartDate())
  );

  /** Formatowana data końca tygodnia */
  weekEndFormatted: Signal<string> = computed(() => {
    const endDate = new Date(this.weekStartDate());
    endDate.setDate(endDate.getDate() + 6);
    return this.formatDate(endDate);
  });

  /** Dni tygodnia */
  weekDays: Signal<Array<{date: Date, dayName: string, dayDate: string}>> = computed(() => {
    const startDate = new Date(this.weekStartDate());
    const days = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      days.push({
        date: currentDate,
        dayName: this.getDayName(currentDate),
        dayDate: this.formatDayDate(currentDate)
      });
    }

    return days;
  });

  ngOnInit(): void {
    // Ustawienie domyślnej daty (dziś) lub daty przekazanej jako parametr
    const today = new Date();
    this.currentSelectedDate.set(this.initialDate || today);
    this.weekStartDate.set(this.getStartOfWeek(this.initialDate || today));

    // Emisja domyślnej (początkowej) daty
    this.emitSelectedDate();
  }

  /**
   * Wybiera datę i emituje zdarzenie
   */
  selectDate(date: Date): void {
    this.currentSelectedDate.set(new Date(date));
    this.emitSelectedDate();
  }

  /**
   * Przechodzi do poprzedniego tygodnia
   */
  previousWeek(): void {
    const newStartDate = new Date(this.weekStartDate());
    newStartDate.setDate(newStartDate.getDate() - 7);
    this.weekStartDate.set(newStartDate);
  }

  /**
   * Przechodzi do następnego tygodnia
   */
  nextWeek(): void {
    const newStartDate = new Date(this.weekStartDate());
    newStartDate.setDate(newStartDate.getDate() + 7);
    this.weekStartDate.set(newStartDate);
  }

  /**
   * Sprawdza, czy podana data jest aktualnie wybraną datą
   */
  isSelectedDay(date: Date): boolean {
    const selected = this.currentSelectedDate();
    return date.getDate() === selected.getDate() &&
           date.getMonth() === selected.getMonth() &&
           date.getFullYear() === selected.getFullYear();
  }

  /**
   * Sprawdza, czy podana data jest dzisiejszą datą
   */
  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  /**
   * Formatuje datę do formatu DD.MM.YYYY
   */
  private formatDate(date: Date): string {
    return date.toLocaleDateString('pl-PL');
  }

  /**
   * Formatuje datę w sposób przyjazny dla czytników ekranu
   */
  formatDateForA11y(date: Date): string {
    // Format: "31 maja 2023"
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    return date.toLocaleDateString('pl-PL', options);
  }

  /**
   * Formatuje dzień do wyświetlenia na przycisku
   */
  private formatDayDate(date: Date): string {
    return `${date.getDate()}.${date.getMonth() + 1}`;
  }

  /**
   * Zwraca nazwę dnia tygodnia po polsku
   */
  private getDayName(date: Date): string {
    const days = ['Niedz', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'];
    return days[date.getDay()];
  }

  /**
   * Zwraca początek tygodnia (poniedziałek) dla podanej daty
   */
  private getStartOfWeek(date: Date): Date {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Dostosowanie dla niedzieli
    result.setDate(diff);
    return result;
  }

  /**
   * Emituje zdarzenie z aktualnie wybraną datą w formacie Date
   */
  private emitSelectedDate(): void {
    this.dateSelected.emit(new Date(this.currentSelectedDate()));
  }
}
