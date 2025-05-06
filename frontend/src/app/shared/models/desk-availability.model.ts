/**
 * Model reprezentujący dostępność biurka dla danego dnia
 * Mapowany z odpowiedzi API GET /api/guest/desks/availability
 */
export interface DeskAvailabilityItem {
  deskId: number;       // Identyfikator biurka
  roomName: string;     // Nazwa pomieszczenia
  deskNumber: string;   // Numer biurka
  isAvailable: boolean; // Status dostępności (true - dostępne, false - zajęte)
}
