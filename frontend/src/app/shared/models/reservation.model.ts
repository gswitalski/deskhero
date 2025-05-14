/**
 * Model reprezentujący żądanie rezerwacji biurka
 */
export interface ReservationRequest {
  deskId: number;
  reservationDate: string; // Format ISO YYYY-MM-DD
}

/**
 * Model reprezentujący odpowiedź z API po utworzeniu rezerwacji
 */
export interface ReservationResponse {
  reservationId: number;
  userId: number;
  deskId: number;
  reservationDate: string;
}

/**
 * Model reprezentujący rezerwację użytkownika z danymi biurka
 */
export interface Reservation {
  reservationId: number;
  userId: number;
  deskId: number;
  roomName: string;
  deskNumber: string;
  reservationDate: string; // Format ISO YYYY-MM-DD
}

/**
 * Model reprezentujący odpowiedź po anulowaniu rezerwacji
 */
export interface DeleteReservationResponse {
  message: string;
}

/**
 * Model pomocniczy do wyboru daty
 */
export interface DateSelectionModel {
  selectedDate: Date;
}

/**
 * Model rozszerzający DeskAvailabilityItem o funkcje dla zalogowanego użytkownika
 */
export interface DeskAvailabilityViewModel {
  deskId: number;
  roomName: string;
  deskNumber: string;
  isAvailable: boolean;
}
