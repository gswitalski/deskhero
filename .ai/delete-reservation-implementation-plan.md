# API Endpoint Implementation Plan: Usuń rezerwację (DELETE /api/reservations/{id})

## 1. Przegląd punktu końcowego
Ten endpoint umożliwia usunięcie istniejącej rezerwacji z systemu. Usunięcie może wykonać tylko właściciel rezerwacji lub użytkownik z rolą administratora.

## 2. Szczegóły żądania
- Metoda HTTP: DELETE
- URL: `/api/reservations/{id}`
- Parametry:
  - Wymagane:
    - `id` (ścieżka) – identyfikator rezerwacji (Long)
  - Opcjonalne:
    - Brak
- Body żądania: brak (tylko path parameter)

## 3. Szczegóły odpowiedzi
- Kod statusu: 200 OK
- Body odpowiedzi (JSON):
  ```json
  {
    "message": "Reservation deleted successfully"
  }
  ```
- DTO odpowiadające odpowiedzi:
  - `DeleteReservationResponseDto` (pole `String message`)
- Błędy:
  - 401 Unauthorized – brak uwierzytelnienia lub brak uprawnień
  - 404 Not Found – rezerwacja o podanym `id` nie istnieje
  - 500 Internal Server Error – nieoczekiwany błąd serwera

## 4. Przepływ danych
1. Klient wysyła żądanie DELETE na `/api/reservations/{id}` z tokenem w nagłówku.
2. Spring Security uwierzytelnia użytkownika, dostarcza obiekt `Principal` lub `Authentication`.
3. Kontroler wywołuje `reservationService.deleteReservation(id, principal.getName())`.
4. W serwisie:
   - Weryfikacja poprawności `id` (np. > 0).
   - Pobranie rezerwacji z bazy: `reservationRepository.findById(id)`.
   - Jeśli brak, rzucenie `ResourceNotFoundException`.
   - Porównanie `reservation.getUser().getUsername()` z nazwą aktualnego użytkownika lub sprawdzenie `hasRole('ADMIN')`.
   - Jeśli nieautoryzowany, rzucenie `AccessDeniedException` lub `UnauthorizedException`.
   - Usunięcie rezerwacji: `reservationRepository.delete(reservation)`.
5. Serwis zwraca obiekt `DeleteReservationResponseDto` z komunikatem.
6. Kontroler zwraca odpowiedź 200 z DTO.

## 5. Względy bezpieczeństwa
- Uwierzytelnianie: weryfikacja tokena za pomocą Spring Security.
- Autoryzacja: tylko właściciel rezerwacji lub administrator (`ROLE_ADMIN`).
- Walidacja parametrów: `id` > 0, typ Long.
- Ochrona przed CSRF: jeśli sesyjna autoryzacja, włączyć CSRF lub użyć wymagań REST (CSRF wyłączone, token Bearer).
- Ochrona przed nieautoryzowanym dostępem do innych zasobów.

## 6. Obsługa błędów
- **ResourceNotFoundException** → 404 Not Found, zwróć `ErrorDto`.
- **AccessDeniedException** lub niestandardowe **UnauthorizedException** → 401 Unauthorized, zwróć `ErrorDto`.
- **MethodArgumentTypeMismatchException** (niepoprawny format `id`) → 400 Bad Request.
- **Exception** (inne wyjątki) → 500 Internal Server Error.
- Centralne przechwytywanie wyjątków: klasa oznaczona `@ControllerAdvice`, wszystkie odpowiedzi błędów w formacie `ErrorDto`.

## 7. Wydajność
- Operacja DELETE na pojedynczym rekordzie jest szybka.
- Transakcja ograniczona do pojedynczej operacji.
- Brak problemów z N+1.
- Rozważ caching uprawnień (jeśli złożone sprawdzenie ról).

## 8. Kroki implementacji
1. Utworzyć DTO odpowiedzi:
   - `DeleteReservationResponseDto` (record) w pakiecie `dto`.
2. Rozszerzyć interfejs `ReservationService`:
   - Dodanie metody `DeleteReservationResponseDto deleteReservation(Long id, String username)`.
3. Zaimplementować w `ReservationServiceImpl`:
   - Adnotacja `@Transactional`
   - Logika usuwania i uprawnień.
4. Dodać endpoint w `ReservationController`:
   - `@DeleteMapping("/api/reservations/{id}")`
   - Adnotacje `@PreAuthorize` lub manualna weryfikacja.
   - Obsługa `Principal` lub `@AuthenticationPrincipal`.
5. Dodać globalny handler wyjątków (`@ControllerAdvice`), mapujący wyjątki na `ErrorDto`.
6. Zaktualizować konfigurację Spring Security:
   - Upewnić się, że ścieżka `/api/reservations/**` wymaga autoryzacji.
   - Dodać reguły uprawnień dla metod HTTP DELETE.
