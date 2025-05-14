import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ReservationRequest, ReservationResponse, Reservation, DeleteReservationResponse } from '../../shared/models/reservation.model';
import { DeskAvailabilityItem } from '../../shared/models/desk-availability.model';

/**
 * Serwis odpowiedzialny za komunikację z API dotyczącą rezerwacji biurek
 */
@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private readonly availabilityApiUrl = '/api/guest/desks/availability';
  private readonly reservationApiUrl = '/api/reservations';
  private http = inject(HttpClient);

  /**
   * Pobiera dostępność biurek dla zalogowanego użytkownika
   * @param date Data w formacie YYYY-MM-DD
   * @returns Lista dostępności biurek dla wybranej daty
   */
  getAvailability(date: string): Observable<DeskAvailabilityItem[]> {
    return this.http.get<DeskAvailabilityItem[]>(`${this.availabilityApiUrl}?date=${date}`);
  }

  /**
   * Tworzy nową rezerwację biurka
   * @param request Dane żądania rezerwacji
   * @returns Dane utworzonej rezerwacji
   */
  createReservation(request: ReservationRequest): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(this.reservationApiUrl, request);
  }

  /**
   * Pobiera wszystkie rezerwacje bieżącego użytkownika
   * @returns Lista rezerwacji użytkownika
   */
  getReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.reservationApiUrl);
  }

  /**
   * Anuluje istniejącą rezerwację
   * @param reservationId ID rezerwacji do anulowania
   * @returns Odpowiedź z API
   */
  deleteReservation(reservationId: number): Observable<DeleteReservationResponse> {
    return this.http.delete<DeleteReservationResponse>(`${this.reservationApiUrl}/${reservationId}`);
  }
}
