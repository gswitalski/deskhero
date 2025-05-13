# Plan implementacji widoku Dostępność biurek dla zalogowanego użytkownika

## 1. Przegląd
Widok rozszerza istniejący komponent dostępności biurek na stronie głównej, dodając możliwość rezerwacji biurka przez zalogowanego użytkownika. Umożliwia wybór dnia, wyświetla listę biurek z przyciskiem "Zarezerwuj" dla wolnych pozycji, otwiera modal potwierdzenia i obsługuje odpowiedzi z API.

## 2. Routing widoku
Ścieżka: `/home` (lub `/`), istniejący HomePageComponent, gdzie rozszerzamy funkcjonalność.

## 3. Struktura komponentów
- HomePageComponent
  - DateSelectorComponent
  - DeskListComponent
    - DeskListItemComponent
  - ReservationConfirmDialogComponent (dynamicznie wywoływany)

## 4. Szczegóły komponentów

### HomePageComponent
- Opis: Kontener zachowujący stan wybranego dnia i listy biurek, inicjalizuje komponenty dzieci.
- Główne elementy: `<app-date-selector>`, `<app-desk-list>`
- Obsługiwane interakcje:
  - Zdarzenie `dateChange` z DateSelector → aktualizuje `selectedDate` i ładuje biurka.
  - Obsługa `reservationSuccess` (emiter z DeskList) → odświeżenie listy.
- Walidacja: brak (logika w dzieciach).
- Typy używane:
  - DateSelectionModel
  - DeskAvailabilityViewModel[]
- Propsy:
  - brak (stan wewnętrzny)

### DateSelectorComponent
- Opis: Wybór dnia w widoku tygodniowym.
- Główne elementy: mat-button-toggle-group dla dni tygodnia, ewentualny DatePicker.
- Zdarzenia: `@Output() dateChange: EventEmitter<Date>`
- Walidacja: zapewnienie, że selectedDate to poprawny obiekt Date.
- Typy:
  - DateSelectionModel { selectedDate: Date }
- Propsy:
  - `initialDate: Date` (opcjonalnie)

### DeskListComponent
- Opis: Lista biurek dla wskazanego dnia.
- Główne elementy: `*ngFor` nad DeskListItemComponent
- Zdarzenia: `@Output() reservationRequested: EventEmitter<DeskAvailabilityViewModel>`
- Walidacja: nie renderować pustych lub null list.
- Typy:
  - `@Input() desks: DeskAvailabilityViewModel[]`
  - `@Input() selectedDate: Date`

### DeskListItemComponent
- Opis: Pojedyncze biurko z nazwą, numerem i przyciskiem.
- Główne elementy: `mat-card`, `mat-button` "Zarezerwuj"
- Zdarzenia: `@Output() reserve: EventEmitter<void>` po kliknięciu przycisku.
- Walidacja: `disable` przycisku gdy `!isAvailable` lub `!isLoggedIn`.
- Typy:
  - `@Input() desk: DeskAvailabilityViewModel`
  - `@Input() isLoggedIn: boolean`

### ReservationConfirmDialogComponent
- Opis: Modal z potwierdzeniem rezerwacji.
- Główne elementy: `mat-dialog-content`, `mat-dialog-actions` z przyciskami "Anuluj" i "Potwierdź"
- Zdarzenia: obsługa `afterClosed()` zwracającego boolean.
- Walidacja: brak, prosta potwierdzarka.
- Typy:
  - `data: { desk: DeskAvailabilityViewModel, date: Date }`

## 5. Typy
```ts
// Model dostępności biurka
export interface DeskAvailabilityViewModel {
  deskId: number;
  roomName: string;
  deskNumber: string;
  isAvailable: boolean;
}

// Model żądania rezerwacji
export interface ReservationRequest {
  deskId: number;
  reservationDate: string; // ISO YYYY-MM-DD
}

// Model odpowiedzi rezerwacji
export interface ReservationResponse {
  reservationId: number;
  userId: number;
  deskId: number;
  reservationDate: string;
}

// Model wyboru daty
export interface DateSelectionModel {
  selectedDate: Date;
}
```

## 6. Zarządzanie stanem
- HomePageComponent utrzymuje:
  - `selectedDate: Date`
  - `desks: DeskAvailabilityViewModel[]`
  - `loading: boolean`
  - `error: string | null`
- Serwis AuthService: `isLoggedIn(): boolean`, `getToken(): string`.
- Serwis ReservationService:
  - `getAvailability(date: string): Observable<DeskAvailabilityDto[]>`
  - `createReservation(req: ReservationRequest): Observable<ReservationResponse>`

## 7. Integracja API
- GET dostępności: `GET /api/desks/availability?date=${YYYY-MM-DD}` → mapowanie DeskAvailabilityDto na DeskAvailabilityViewModel.
- POST rezerwacji:
  ```ts
  this.reservationService.createReservation({ deskId, reservationDate })
    .subscribe({
      next: res => { snackBar.success(...); this.loadDesks(); },
      error: err => handleError(err)
    });
  ```
- Nagłówek Authorization ustawiany przez HttpInterceptor.

## 8. Interakcje użytkownika
1. Użytkownik wybiera dzień w DateSelector → emiter `dateChange`.
2. HomePageComponent ładuje dostępność.
3. DeskListComponent renderuje biurka.
4. Klik "Zarezerwuj" w DeskListItem → `reservationRequested`.
5. HomePageComponent otwiera ReservationConfirmDialog.
6. Po potwierdzeniu → wywołanie POST, toast, odświeżenie listy.

## 9. Warunki i walidacja
- Przyciski rezerwacji aktywne tylko gdy `desk.isAvailable && isLoggedIn`.
- ReservationRequest: data musi być w przyszłości lub dzisiaj (opcjonalne sprawdzenie front).
- Sprawdzanie poprawności formatu daty.

## 10. Obsługa błędów
- 400 Bad Request → snackBar.error("Nieprawidłowe dane rezerwacji");
- 409 Conflict → snackBar.error("To biurko jest już zarezerwowane na ten dzień");
- 401 Unauthorized → redirect `/login`, snackBar.info("Zaloguj się ponownie");
- Inne błędy → snackBar.error("Błąd sieci, spróbuj ponownie później");

## 11. Kroki implementacji
1. Utworzyć typy w `/frontend/src/app/shared/models`.
2. Zaimplementować lub zaktualizować ReservationService.
3. Dodać metody w HomePageComponent: `loadDesks()`, `onDateChange()`, `onReserveRequest()`.
4. Rozszerzyć DateSelectorComponent o emiter `dateChange`.
5. Rozszerzyć DeskListComponent i DeskListItemComponent o przyciski i emiter.
6. Stworzyć ReservationConfirmDialogComponent z Angular Material.
7. Dodać HttpInterceptor do nagłówków Authorization (jeśli nie istnieje).
8. Dodać obsługę toastów (MatSnackBar).
9. Przetestować scenariusze: sukces, 400, 409, 401.
10. Poprawić styl i dostępność zgodnie z Angular Material i Sass. 
