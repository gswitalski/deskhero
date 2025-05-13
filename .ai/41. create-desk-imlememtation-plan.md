# API Endpoint Implementation Plan: Create Desk

## 1. Przegląd punktu końcowego
Endpoint umożliwia administratorowi utworzenie nowego biurka w systemie.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- URL: `/api/desks`
- Nagłówki:
  - `Authorization: Bearer <token>` (wymagany, rola: `ROLE_ADMIN`)
  - `Content-Type: application/json`
- Parametry:
  - Wymagane:
    - `roomName` (String) – nazwa pokoju, max długość 100, niepusty
    - `deskNumber` (String) – numer biurka, max długość 100, niepusty
  - Opcjonalne: brak
- Request Body (JSON):
  ```json
  {
    "roomName": "Gamma",
    "deskNumber": "G3"
  }
  ```

## 3. Wykorzystywane typy
- `DeskRequestDto` (request):
  ```java
  public record DeskRequestDto(
      @NotBlank @Size(max = 100) String roomName,
      @NotBlank @Size(max = 100) String deskNumber) {}
  ```
- `DeskDto` (response):
  ```java
  public record DeskDto(Long deskId, String roomName, String deskNumber) {}
  ```
- `ErrorDto` (globalny format błędu):
  ```java
  public record ErrorDto(
      Instant timestamp,
      int status,
      String error,
      String message,
      String path) {}
  ```

## 4. Przepływ danych
1. Klient wysyła POST `/api/desks` z tokenem i JSON-em.
2. `DeskController.createDesk(@Valid @RequestBody DeskRequestDto req)`
   - Sprawdza uprawnienia (Spring Security).
   - Waliduje pola via Bean Validation.
3. Kontroler wywołuje `DeskService.createDesk(req)`.
4. `DeskService`:
   - Loguje próbę utworzenia biurka.
   - Sprawdza w `DeskRepository.existsByRoomNameAndDeskNumber(req.roomName(), req.deskNumber())`.
     - Jeśli true → rzuca `DeskAlreadyExistsException`.
   - Mapuje `DeskRequestDto` na encję `Desk` i zapisuje przez `save()`.
   - Mapuje zapisany obiekt na `DeskDto` i zwraca.
5. Kontroler zwraca `ResponseEntity.status(201).body(DeskDto)`.

## 5. Względy bezpieczeństwa
- Spring Security:
  - Konfiguracja w `SecurityConfig`:
    ```java
    http
        .authorizeRequests()
        .requestMatchers(HttpMethod.POST, "/api/desks").hasRole("ADMIN")
        ...
    ```
- Uwierzytelnianie JWT.
- Bean Validation zapobiega niepożądanym wartościom.

## 6. Obsługa błędów
- Globalny `@ControllerAdvice`:
  - `MethodArgumentNotValidException` → 400 + `ErrorDto`
  - `DeskAlreadyExistsException` (Runtime) lub `DataIntegrityViolationException` → 409 + `ErrorDto`
  - `AccessDeniedException` → 401 + `ErrorDto`
  - Inne wyjątki → 500 + `ErrorDto`
- Logowanie wszystkich wyjątków z poziomu `@ControllerAdvice` i `@Slf4j`.

## 7. Rozważania dotyczące wydajności
- Niewielkie obciążenie – proste zapisy do bazy.
- Możliwość cache'owania listy biurek, ale przy tworzeniu nie wpływa.
- Optymalizacja unikalności przez indeksy w DB (jednoznaczny klucz na (room_name, desk_number)).

## 8. Kroki implementacji
1. Utworzyć/rozszerzyć `DeskRequestDto` i `DeskDto` w pakiecie `dto` z odpowiednimi adnotacjami Bean Validation.
2. Utworzyć wyjątek biznesowy `DeskAlreadyExistsException` w pakiecie `exception`.
3. W `DeskService` (lub nowym bean z `@Service`) dodać metodę `createDesk(DeskRequestDto)`:
   - Walidacja unikalności przez repozytorium.
   - Zapis encji i mapowanie na `DeskDto`.
4. W `DeskController` dodać endpoint:
   ```java
   @PostMapping
   public ResponseEntity<DeskDto> createDesk(@Valid @RequestBody DeskRequestDto req) {
     DeskDto created = deskService.createDesk(req);
     return ResponseEntity.status(HttpStatus.CREATED).body(created);
   }
   ```
5. W `DeskRepository` dodać metodę:
   ```java
   boolean existsByRoomNameAndDeskNumber(String roomName, String deskNumber);
   ```
6. Rozszerzyć konfigurację Spring Security (`SecurityConfig`) o autoryzację POST `/api/desks` dla roli ADMIN.
7. Wprowadzić globalne `@ControllerAdvice` obsługujące wyjątki i mapujące je na `ErrorDto`.
