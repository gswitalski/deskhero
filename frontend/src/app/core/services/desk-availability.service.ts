import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DeskAvailabilityItem } from '../../shared/models/desk-availability.model';

/**
 * Serwis odpowiedzialny za komunikację z API dotyczącą dostępności biurek
 */
@Injectable({
  providedIn: 'root'
})
export class DeskAvailabilityService {
  private readonly apiUrl = '/api/guest/desks/availability';
  private http = inject(HttpClient);

  /**
   * Pobiera dostępność biurek dla wybranej daty
   * @param date Data w formacie YYYY-MM-DD
   * @returns Lista dostępności biurek dla wybranej daty
   */
  getDeskAvailability(date: string): Observable<DeskAvailabilityItem[]> {
    return this.http.get<DeskAvailabilityItem[]>(`${this.apiUrl}?date=${date}`);
  }
}
