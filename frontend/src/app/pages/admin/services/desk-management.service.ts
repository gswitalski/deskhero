import { Injectable, inject, signal, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, finalize, map } from 'rxjs/operators';
import { Observable, throwError, of } from 'rxjs';
import { DeskDto, DeskRequestDto, DeleteDeskResponseDto } from '../../../shared/models/desk.model';
import { isPlatformBrowser } from '@angular/common';

export interface DeskTableItem {
  deskId: number;
  roomName: string;
  deskNumber: string;
}

@Injectable({
  providedIn: 'root'
})
export class DeskManagementService {
  private http = inject(HttpClient);
  private apiUrl = '/api/desks';
  private platformId = inject(PLATFORM_ID);

  // Sygnały stanu
  private desksSignal = signal<DeskTableItem[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Sygnały dostępne publicznie
  readonly desks = this.desksSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  // Observable dla komponentów, które preferują ten format
  readonly desks$ = toObservable(this.desksSignal);

  constructor() {
    // Ładujemy biurka tylko w przeglądarce, nie podczas prerenderowania
    if (isPlatformBrowser(this.platformId)) {
      this.loadDesks();
    }
  }

  // Pobieranie listy biurek
  loadDesks(): void {
    // Nie wykonujemy zapytań API podczas prerenderowania
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.http.get<DeskDto[]>(this.apiUrl)
      .pipe(
        map(desks => desks.map(desk => this.mapToTableItem(desk))),
        catchError(this.handleError.bind(this)),
        finalize(() => this.loadingSignal.set(false))
      )
      .subscribe({
        next: desks => this.desksSignal.set(desks),
        error: error => this.errorSignal.set(error)
      });
  }

  // Dodawanie biurka
  addDesk(deskRequest: DeskRequestDto): Observable<DeskDto> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<DeskDto>(this.apiUrl, deskRequest)
      .pipe(
        catchError(this.handleError.bind(this)),
        finalize(() => this.loadingSignal.set(false))
      );
  }

  // Edycja biurka
  updateDesk(deskId: number, deskRequest: DeskRequestDto): Observable<DeskDto> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.put<DeskDto>(`${this.apiUrl}/${deskId}`, deskRequest)
      .pipe(
        catchError(this.handleError.bind(this)),
        finalize(() => this.loadingSignal.set(false))
      );
  }

  // Usuwanie biurka
  deleteDesk(deskId: number): Observable<DeleteDeskResponseDto> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.delete<DeleteDeskResponseDto>(`${this.apiUrl}/${deskId}`)
      .pipe(
        catchError(this.handleError.bind(this)),
        finalize(() => this.loadingSignal.set(false))
      );
  }

  // Aktualizacja listy biurek po operacjach
  refreshDesks(): void {
    this.loadDesks();
  }

  // Mapowanie DTO na model tabeli
  private mapToTableItem(desk: DeskDto): DeskTableItem {
    return {
      deskId: desk.deskId,
      roomName: desk.roomName,
      deskNumber: desk.deskNumber
    };
  }

  // Centralna obsługa błędów
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Wystąpił nieznany błąd';

    if (error.error instanceof ErrorEvent) {
      // Błąd po stronie klienta
      errorMessage = `Błąd: ${error.error.message}`;
    } else {
      // Błąd po stronie serwera
      switch (error.status) {
        case 400:
          errorMessage = 'Nieprawidłowe dane biurka';
          break;
        case 401:
          errorMessage = 'Brak uprawnień. Zaloguj się ponownie';
          break;
        case 404:
          errorMessage = 'Biurko nie zostało znalezione';
          break;
        case 409:
          errorMessage = 'Biurko o podanej nazwie pokoju i numerze już istnieje';
          break;
        default:
          errorMessage = `Błąd serwera: ${error.status}, wiadomość: ${error.message}`;
      }
    }

    this.errorSignal.set(errorMessage);
    return throwError(() => errorMessage);
  }
}
