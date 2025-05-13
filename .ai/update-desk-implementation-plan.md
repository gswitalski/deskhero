# API Endpoint Implementation Plan: PUT /api/desks/{id}

## 1. Przegląd punktu końcowego
Aktualizacja danych istniejącego biurka. Punkt dostępny tylko dla użytkowników z rolą ADMIN.

## 2. Szczegóły żądania
- Metoda HTTP: PUT
- URL: `/api/desks/{id}`
- Parametry:
  - Wymagane:
    - Path: `id` (Long) – identyfikator biurka
  - Opcjonalne: brak
- Request Body (JSON):
```json
{
  "roomName": "UpdatedRoom",
  "deskNumber": "UpdatedNumber"
}
```
- DTO wejściowe: `DeskRequestDto` z polami:
  - `@NotBlank String roomName`
  - `@NotBlank String deskNumber`

## 3. Szczegóły odpowiedzi
- Status: `200 OK`
- Response Body (JSON):
```json
{
  "deskId": 3,
  "roomName": "UpdatedRoom",
  "deskNumber": "UpdatedNumber"
}
```
- DTO wyjściowe: `DeskDto` z polami:
  - `Long deskId`
  - `String roomName`
  - `String deskNumber`

## 4. Przepływ danych
1. Klient wysyła żądanie do `DeskAdminController.updateDesk(id, dto)`.
2. Spring Boot waliduje `DeskRequestDto` dzięki adnotacjom Bean Validation (`@Valid`).
3. Kontroler wywołuje `deskService.updateDesk(id, dto)`.
4. W `DeskServiceImpl`:
   1. Pobranie encji: `deskRepository.findById(id)`; jeśli brak, rzucenie `ResourceNotFoundException`.
   2. Sprawdzenie duplikatu:
      ```java
      if (deskRepository.existsByRoomNameAndDeskNumberAndIdNot(
              dto.getRoomName(), dto.getDeskNumber(), id)) {
          throw new DeskAlreadyExistsException(...);
      }
      ```
   3. Aktualizacja pól: `desk.setRoomName(dto.getRoomName()); desk.setDeskNumber(dto.getDeskNumber());`
   4. Zapis: `deskRepository.save(desk)`.
   5. Konwersja na DTO: `DeskDto.fromModel(savedDesk)`.
5. Kontroler zwraca `ResponseEntity.ok(deskDto)`.

## 5. Względy bezpieczeństwa
- Uwierzytelnianie: Spring Security, JWT.
- Autoryzacja: `@PreAuthorize("hasRole('ADMIN')")`.
- Walidacja danych wejściowych: Bean Validation (`@NotBlank`).
- Ochrona przed SQL injection i XSS przez bezpieczne bindowanie parametrów JPA.
- Nieujawnianie wewnętrznych szczegółów w komunikatach błędów.

## 6. Obsługa błędów
- `400 Bad Request` – błędy walidacji `MethodArgumentNotValidException`.
- `401 Unauthorized` – brak uwierzytelnienia lub roli ADMIN.
- `404 Not Found` – `ResourceNotFoundException` (brak biurka o podanym id).
- `409 Conflict` – `DeskAlreadyExistsException` (konflikt unikatowości roomName + deskNumber).
- `500 Internal Server Error` – nieoczekiwane wyjątki.

## 7. Wydajność
- Krótkie transakcje: jedno `findById`, jedno `exists...` i `save`.
- Indeks na unikatowym kluczu `(room_name, desk_number)` przyspiesza sprawdzanie duplikatów.
- Opcjonalnie cache warstwy odczytowej (nie krytyczne dla aktualizacji).

## 8. Kroki implementacji
1. Dodanie do `DeskRepository` metody:
   ```java
   boolean existsByRoomNameAndDeskNumberAndIdNot(String roomName, String deskNumber, Long id);
   ```
2. Rozszerzenie interfejsu `DeskService`:
   ```java
   DeskDto updateDesk(Long id, DeskRequestDto dto);
   ```
3. Implementacja w `DeskServiceImpl`:
   - Metoda `updateDesk` z logiką z sekcji 4.
   - Oznaczenie `@Transactional`.
   - Dodanie logowania (`log.info(...)`).
4. Modyfikacja `DeskAdminController`:
   - Dodanie metody:
     ```java
     @PutMapping("/{id}")
     @PreAuthorize("hasRole('ADMIN')")
     public ResponseEntity<DeskDto> updateDesk(@PathVariable Long id,
                                               @Valid @RequestBody DeskRequestDto dto) {
         DeskDto updated = deskService.updateDesk(id, dto);
         return ResponseEntity.ok(updated);
     }
     ```
