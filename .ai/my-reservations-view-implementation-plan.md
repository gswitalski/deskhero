# Plan implementacji widoku MyReservationsPage

## 1. Przegląd
Widok umożliwia zalogowanemu użytkownikowi przegląd swoich rezerwacji, podzielonych na nadchodzące i przeszłe, oraz anulowanie rezerwacji, które jeszcze nie nastąpiły (włącznie z dniem dzisiejszym).

## 2. Routing widoku
- Ścieżka: `/my-reservations` (dodana w `app-routing.module.ts`)
- Chroniony przez strażnika `AuthGuard`, wymagane uwierzytelnienie (rola USER).

## 3. Struktura komponentów
- **MyReservationsPageComponent** (strona główna)
  - `<mat-tab-group>` z dwoma zakładkami:
    - Zakładka „Nadchodzące”
    - Zakładka „Przeszłe”
  - `<app-reservations-list>` (dla każdej zakładki)
- **ReservationsListComponent** (lista rezerwacji)
  - Wyświetla listę rezerwacji w `<mat-list>` lub `<mat-table>`
  - Emituje zdarzenie anulowania rezerwacji
- **ReservationItemComponent** (pojedyncza rezerwacja)
  - Wyświetla `roomName`, `deskNumber`, `reservationDate` oraz przycisk „Anuluj” (tylko dla nadchodzących)
- **ConfirmCancelDialogComponent** (modal potwierdzenia)
  - Modal z przyciskami „Anuluj” i „Potwierdź”

## 4. Szczegóły komponentów

### MyReservationsPageComponent
- Opis: Kontener strony, pobiera dane z API, dzieli je na dwie grupy i przekazuje do komponentów list.
- Elementy:
  - `mat-tab-group` z dwoma `mat-tab` (typ listy jako input)
  - `<app-reservations-list [reservations]=... [listType]=...>`
- Obsługiwane zdarzenia:
  - `ngOnInit` → wywołuje `getReservations()`
  - Subskrypcja eventu anulowania → wywołuje otwarcie dialogu, a po potwierdzeniu wywołuje `deleteReservation(id)`
- Walidacja:
  - Kontrola autoryzacji (łącznie z globalnym interceptorem)
  - Obsługa stanu `loading` i `error`
- Typy:
  - `Reservation` (DTO)
- Propsy: brak (root widoku)

### ReservationsListComponent
- Opis: Renderuje przekazaną listę rezerwacji.
- Elementy:
  - `<mat-list>` / `<mat-table>` z elementami `<app-reservation-item>`
- Obsługiwane zdarzenia:
  - `cancelRequest = new EventEmitter<number>()`
- Walidacja:
  - Wyświetla komunikat „Brak rezerwacji” gdy lista pusta
- Typy:
  - `@Input() reservations: Reservation[]`
  - `@Input() listType: 'upcoming' | 'past'`

### ReservationItemComponent
- Opis: Wiersz z danymi pojedynczej rezerwacji.
- Elementy:
  - `{{ reservation.roomName }} - {{ reservation.deskNumber }} - {{ reservation.reservationDate }}`
  - `<button mat-icon-button *ngIf='listType === "upcoming"' (click)='onCancel()'>`
- Obsługiwane zdarzenia:
  - `onCancel()` → `cancel.emit(reservation.reservationId)`
- Walidacja:
  - Przycisk anulowania dostępny tylko gdy `reservationDate >= today`
- Typy:
  - `@Input() reservation: Reservation`
  - `@Input() listType: 'upcoming' | 'past'`

### ConfirmCancelDialogComponent
- Opis: Modal potwierdzający operację anulowania.
- Elementy:
  - `mat-dialog-content` z komunikatem
  - Dwa przyciski: `Anuluj` i `Potwierdź`
- Obsługiwane zdarzenia:
  - `onConfirm()` zwraca true
  - `onCancel()` zamyka modal

## 5. Typy
```ts
// Reservation DTO otrzymywane z API
export interface Reservation {
  reservationId: number;
  userId: number;
  deskId: number;
  roomName: string;
  deskNumber: string;
  reservationDate: string; // ISO 8601
}

// Odpowiedź po anulowaniu
export interface DeleteReservationResponse {
  message: string;
}

// ViewModel w komponencie
interface ReservationsViewModel {
  upcomingReservations: Reservation[];
  pastReservations: Reservation[];
}
```

## 6. Zarządzanie stanem
- W `MyReservationsPageComponent`:
  - `loading: boolean`
  - `error: string | null`
  - `reservations: Reservation[]`
  - `upcomingReservations: Reservation[]`
  - `pastReservations: Reservation[]`
- W `ngOnInit()`:
  1. `loading = true`
  2. `reservationService.getReservations()`
  3. Podział wyników wg daty względem `today`
  4. `loading = false`
  5. W razie błędu: `error = err.message`
- Po anulowaniu:
  - Ponownie wywołać `getReservations()` lub usunąć pojedynczą pozycję z `upcomingReservations`

## 7. Integracja API
- **GET /api/reservations**
  - Metoda: `reservationService.getReservations(): Observable<Reservation[]>`
- **DELETE /api/reservations/{id}**
  - Metoda: `reservationService.deleteReservation(id: number): Observable<DeleteReservationResponse>`
- Globalny `HttpInterceptor`:
  - Dodaje nagłówek `Authorization: Bearer <token>`
  - Przechwytuje 401 → przekierowanie `/login`

## 8. Interakcje użytkownika
1. Wejście na `/my-reservations`:
   - Wyświetla się spinner
   - Pobierane są rezerwacje
   - Po pobraniu: podział na dwie zakładki
2. Przeskok między zakładkami
3. Kliknięcie `Anuluj` przy rezerwacji:
   - Otwiera `ConfirmCancelDialog`
   - Po potwierdzeniu: wysyła DELETE
   - Po sukcesie: `MatSnackBar` z wiadomością, odświeżenie listy
   - Po odrzuceniu: zamknięcie dialogu

## 9. Warunki i walidacja
- Użytkownik musi być zalogowany (AuthGuard)
- Przycisk „Anuluj” widoczny tylko dla `reservationDate >= today`
- W razie błędu GET: komponent wyświetla komunikat i przycisk retry

## 10. Obsługa błędów
- **GET**:
  - Błąd sieciowy lub 401: przekierowanie → `/login`
  - Inne błędy: komunikat w widoku
- **DELETE**:
  - 404 / 403 / 500: `MatSnackBar` z komunikatem (z odpowiedzi)
  - 401 → globalny interceptor

## 11. Kroki implementacji
1. Dodać ścieżkę `/my-reservations` w `app-routing.module.ts` z `AuthGuard`.
2. Wygenerować komponenty:
   - `MyReservationsPageComponent`
   - `ReservationsListComponent`
   - `ReservationItemComponent`
   - `ConfirmCancelDialogComponent`
3. Utworzyć `ReservationsService` z metodami `getReservations()` i `deleteReservation()`.
4. Zdefiniować interfejs `Reservation` i `DeleteReservationResponse`.
5. Zaimplementować logikę pobierania i podziału danych w `MyReservationsPageComponent`.
6. Zaimplementować `ReservationsListComponent` oraz odbiór i emitowanie zdarzeń anulowania.
7. Zaimplementować `ReservationItemComponent` z przyciskiem anulowania.
8. Zaimplementować `ConfirmCancelDialogComponent`.
9. Dodać obsługę `MatSnackBar` w przypadku sukcesu i błędów.
