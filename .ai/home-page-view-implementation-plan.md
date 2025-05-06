# Plan implementacji widoku HomePage (Wersja dla Gościa - US-005)

## 1. Przegląd
Widok `HomePage` jest głównym punktem wejścia do aplikacji DeskHero. Dla niezalogowanego użytkownika (Gościa), jego głównym celem jest umożliwienie przeglądania dostępności biurek na wybrany dzień lub tydzień. Pozwala to na ocenę oferty biura przed ewentualną rejestracją i logowaniem.

Widok ten ma być intuicyjny i zapewniać łatwy dostęp do kluczowych informacji o dostępności biurek.

## 2. Routing widoku
Widok `HomePage` powinien być dostępny pod następującymi ścieżkami:
-   `/` (główna ścieżka aplikacji)
-   `/home`

## 3. Struktura komponentów
```
HomePageComponent (Container)
│
├── DateSelectorComponent (Wybór daty)
│
└── DeskListComponent (Lista biurek)
```

## 4. Szczegóły komponentów

### `HomePageComponent`
-   **Opis komponentu:** Główny komponent strony (`smart component`/kontener). Odpowiada za zarządzanie wybraną datą, pobieranie listy dostępnych biurek na podstawie tej daty oraz koordynację interakcji między `DateSelectorComponent` a `DeskListComponent`. W tej wersji nie obsługuje logiki związanej z zalogowanym użytkownikiem ani rezerwacjami.
-   **Główne elementy HTML i komponenty dzieci:**
    -   `<app-date-selector (dateSelected)="onDateSelected($event)">`
    -   `<app-desk-list [desks]="deskAvailabilityList" [selectedDate]="selectedDate">`
    -   Wyświetlanie komunikatów o ładowaniu lub błędach.
-   **Obsługiwane zdarzenia (od dzieci):**
    -   `dateSelected(date: Date)` z `DateSelectorComponent`: Aktualizuje wybraną datę i inicjuje pobranie nowej listy biurek.
-   **Warunki walidacji:** Brak bezpośrednich; deleguje walidację parametrów (np. daty) do serwisów lub komponentów potomnych przed wywołaniem API.
-   **Typy:**
    -   `ViewModel`: `DeskAvailabilityItem[]` (lista biurek).
    -   `Stan komponentu`: `selectedDate: Date`, `deskAvailabilityList: DeskAvailabilityItem[]`, `isLoading: boolean`, `error: string | null`.
-   **Propsy (wejściowe):** Brak (jest to komponent najwyższego poziomu dla tej trasy).

### `DateSelectorComponent`
-   **Opis komponentu:** Komponent prezentacyjny (`dumb component`) odpowiedzialny za umożliwienie użytkownikowi wyboru daty (dnia). Domyślnie wyświetla zakres "dzisiaj" + 6 dni (jako widok tygodniowy) i pozwala na nawigację między tygodniami/dniami.
-   **Główne elementy HTML i komponenty dzieci:**
    -   Przyciski nawigacyjne (`MatButton` z ikonami) do zmiany tygodnia/dnia.
    -   Wyświetlacz aktualnie wybranego zakresu dat lub dnia.
    -   Może wykorzystywać elementy `MatCalendar` lub niestandardowe przyciski reprezentujące dni tygodnia.
    -   Domyślnie wybrany "dzisiaj".
-   **Obsługiwane zdarzenia (wyjściowe):**
    -   `dateSelected: EventEmitter<Date>`: Emituje wybraną przez użytkownika datę.
-   **Warunki walidacji:** Upewnia się, że emitowana data jest prawidłowa. API endpoint `/api/guest/desks/availability` oczekuje daty w formacie `YYYY-MM-DD`. Frontend powinien zadbać o ten format przy wywołaniu API, a komponent może operować na obiektach `Date`.
-   **Typy:**
    -   `Stan komponentu`: `currentSelectedDate: Date`, `displayWeekStartDate: Date`.
-   **Propsy (wejściowe):**
    -   `initialDate?: Date`: Opcjonalna data inicjalna.

### `DeskListComponent`
-   **Opis komponentu:** Komponent prezentacyjny (`dumb component`) wyświetlający listę biurek dla wybranej daty wraz z ich statusem dostępności. Sortuje biurka według `roomName`, a następnie `deskNumber`. W tej wersji nie wyświetla opcji rezerwacji.
-   **Główne elementy HTML i komponenty dzieci:**
    -   `MatList` lub `MatTable` do wyświetlenia biurek.
    -   Dla każdego biurka:
        -   Nazwa pomieszczenia (`roomName`).
        -   Numer biurka (`deskNumber`).
        -   Status dostępności (np. ikona, kolor, tekst "Dostępne"/"Zajęte").
-   **Obsługiwane zdarzenia (wyjściowe):** Brak w tej wersji.
-   **Warunki walidacji:** Brak specyficznych warunków walidacji w tej uproszczonej wersji.
-   **Typy:**
    -   `ViewModel`: `DeskAvailabilityItem`.
-   **Propsy (wejściowe):**
    -   `desks: DeskAvailabilityItem[] | null`: Lista biurek do wyświetlenia.
    -   `selectedDate: Date | null`: Aktualnie wybrana data (może być potrzebna do kontekstu wyświetlania).

## 5. Typy

### Interfejsy DTO (mapowane z backendu)

1.  **`DeskAvailabilityItem` (odpowiedź z `GET /api/guest/desks/availability`)**
    ```typescript
    interface DeskAvailabilityItem {
      deskId: number;       // Identyfikator biurka
      roomName: string;     // Nazwa pomieszczenia
      deskNumber: string;   // Numer biurka
      isAvailable: boolean; // Status dostępności (true - dostępne, false - zajęte)
    }
    ```

### Modele Widoku (ViewModel) - Frontend
W tej uproszczonej wersji nie są wymagane dodatkowe, złożone modele widoku poza `DeskAvailabilityItem`.

## 6. Zarządzanie stanem
Stan aplikacji będzie zarządzany głównie w `HomePageComponent` oraz za pomocą serwisów Angulara.

-   **`HomePageComponent` będzie przechowywać:**
    -   `selectedDate: Date`: Aktualnie wybrana przez użytkownika data. Inicjalizowana wartością "dzisiaj". Zmieniana przez `DateSelectorComponent`.
    -   `deskAvailabilityList: BehaviorSubject<DeskAvailabilityItem[] | null>`: Lista dostępnych biurek dla `selectedDate`. Aktualizowana po zmianie daty.
    -   `isLoading: BehaviorSubject<boolean>`: Flaga wskazująca, czy trwa ładowanie danych z API.
    -   `error: BehaviorSubject<string | null>`: Przechowuje komunikaty o błędach.

-   **Serwisy:**
    1.  **`DeskAvailabilityService` (do stworzenia):**
        -   Odpowiedzialny za komunikację z API backendu dotyczącą biurek.
        -   Metody:
            -   `getDeskAvailability(date: string): Observable<DeskAvailabilityItem[]>`: Wysyła żądanie `GET /api/guest/desks/availability?date={date}`.

Nie przewiduje się potrzeby tworzenia dedykowanego customowego hooka. Serwisy Angulara i RxJS (np. `BehaviorSubject`) zapewnią odpowiednie mechanizmy.

## 7. Integracja API

1.  **Pobieranie dostępności biurek:**
    -   **Endpoint:** `GET /api/guest/desks/availability`
    -   **Akcja:** Wywoływana przez `DeskAvailabilityService.getDeskAvailability(date: string)`.
    -   **Parametry zapytania:** `date` (string w formacie `YYYY-MM-DD`).
    -   **Formatowanie daty:** `HomePageComponent` lub `DeskAvailabilityService` musi przekonwertować obiekt `Date` na string `YYYY-MM-DD` przed wysłaniem.
    -   **Odpowiedź (Sukces 200 OK):** `DeskAvailabilityItem[]`
        ```json
        [
          { "deskId": 3, "roomName": "Alpha", "deskNumber": "A1", "isAvailable": true },
          { "deskId": 5, "roomName": "Beta", "deskNumber": "B2", "isAvailable": false }
        ]
        ```
    -   **Odpowiedź (Błąd 400 Bad Request):** Jeśli data jest w nieprawidłowym formacie.

## 8. Interakcje użytkownika

1.  **Wejście na stronę (`/` lub `/home`):**
    -   Domyślnie wybrany jest "dzisiejszy" dzień w `DateSelectorComponent`.
    -   System automatycznie pobiera i wyświetla dostępność biurek dla "dzisiaj" w `DeskListComponent`.
2.  **Zmiana daty w `DateSelectorComponent`:**
    -   Użytkownik klika na inny dzień lub nawiguje do innego tygodnia.
    -   `DateSelectorComponent` emituje nową datę.
    -   `HomePageComponent` odbiera nową datę, aktualizuje swój stan `selectedDate`.
    -   System pobiera i wyświetla dostępność biurek dla nowo wybranej daty.

## 9. Warunki i walidacja

-   **Format daty dla API:**
    -   Komponent: `HomePageComponent` (przed wywołaniem `DeskAvailabilityService`).
    -   Warunek: Data wysyłana do `GET /api/guest/desks/availability` musi być stringiem w formacie `YYYY-MM-DD`.
    -   Wpływ na UI: Błąd 400 z API w przypadku nieprawidłowego formatu powinien być obsłużony i wyświetlony użytkownikowi. Frontend powinien dążyć do tego, aby taki błąd nie wystąpił poprzez poprawną transformację.

## 10. Obsługa błędów

-   **Błąd pobierania dostępności biurek (np. problem z siecią, błąd serwera 5xx):**
    -   W `HomePageComponent`, subskrypcja do `DeskAvailabilityService.getDeskAvailability()` powinna zawierać blok `error`.
    -   Ustawić `isLoading = false`.
    -   Ustawić `error` na odpowiedni komunikat (np. "Nie udało się załadować listy biurek. Spróbuj ponownie później.").
    -   Wyświetlić ten komunikat użytkownikowi w szablonie.
    -   Opcjonalnie: Dodać przycisk "Spróbuj ponownie", który ponownie wywoła metodę pobierania danych.
-   **Nieprawidłowy format daty (API zwraca 400 Bad Request):**
    -   Podobnie jak wyżej, wyświetlić stosowny komunikat (np. "Wybrana data jest nieprawidłowa. Proszę wybrać poprawną datę."). To powinno skłonić do weryfikacji logiki formatowania daty po stronie frontendu.
-   **Brak danych (API zwraca pustą tablicę biurek):**
    -   Nie jest to błąd, ale `DeskListComponent` powinien być przygotowany na wyświetlenie komunikatu typu "Brak dostępnych biurek dla wybranego dnia." zamiast pustej listy.

## 11. Kroki implementacji

1.  **Utworzenie struktury plików i folderów:**
    -   Folder `home` w `frontend/src/app/pages/`.
    -   Komponenty: `home-page.component.ts/.html/.scss`, `date-selector.component.ts/...`, `desk-list.component.ts/...`.
    -   Serwis: `desk-availability.service.ts` w `frontend/src/app/core/services/` (lub `shared/services/`).
2.  **Zdefiniowanie routingu:**
    -   W module routingu aplikacji (np. `app-routing.module.ts`) dodać ścieżki `/` i `/home` wskazujące na `HomePageComponent`.
3.  **Implementacja `DeskAvailabilityService`:**
    -   Wstrzyknąć `HttpClient`.
    -   Zaimplementować metodę `getDeskAvailability(date: string): Observable<DeskAvailabilityItem[]>`.
4.  **Implementacja `DateSelectorComponent`:**
    -   Layout HTML/SCSS dla wyboru daty (nawigacja tygodniowa/dzienna).
    -   Logika wyboru daty, domyślne ustawienie na "dzisiaj".
    -   Emitowanie zdarzenia `dateSelected` z wybraną datą (`Date`).
5.  **Implementacja `DeskListComponent`:**
    -   Layout HTML/SCSS do wyświetlania listy biurek (`MatList` lub `MatTable`).
    -   Przyjmowanie propsów: `desks`, `selectedDate`.
    -   Logika sortowania biurek.
    -   Stylizacja statusów dostępności.
6.  **Implementacja `HomePageComponent`:**
    -   Layout HTML/SCSS.
    -   Wstrzyknięcie `DeskAvailabilityService`.
    -   Zarządzanie stanem: `selectedDate`, `deskAvailabilityList$`, `isLoading$`, `error$`.
    -   Obsługa zdarzenia `dateSelected` z `DateSelectorComponent`:
        -   Aktualizacja `selectedDate`.
        -   Formatowanie daty na `YYYY-MM-DD`.
        -   Wywołanie `DeskAvailabilityService.getDeskAvailability()`, obsługa sukcesu i błędu, aktualizacja `deskAvailabilityList$`, `isLoading$`, `error$`.
    -   Początkowe załadowanie danych dla "dzisiaj" w `ngOnInit`.
7.  **Dodanie niezbędnych modułów Angular Material:**
    -   `MatButtonModule`, `MatListModule`, `MatTableModule`, `MatIconModule`, `MatDatepickerModule` (jeśli używany do wyboru daty w `DateSelectorComponent`), `MatProgressSpinnerModule` (dla `isLoading`). `MatSnackBarModule` może być przydatne do wyświetlania ogólnych błędów.
8.  **Styling (SCSS):**
    -   Zapewnienie zgodności z ogólnym wyglądem aplikacji.
    -   Czytelne oznaczenie statusów biurek.
    -   Responsywność (choć PRD skupia się na desktopie).
9.  **Testowanie:**
    -   Testowanie manualne przepływu dla gościa.
    -   Testowanie wyboru daty, wyświetlania listy biurek, obsługi błędów (np. problem z API, niepoprawna data).
    -   Weryfikacja sortowania biurek.
    -   Opcjonalnie: napisanie testów jednostkowych dla serwisów i logiki komponentów.
10. **Weryfikacja wymagań US-005:**
    -   Upewnienie się, że gość widzi szczegółowy widok dostępności biurek bez konieczności logowania.
    -   Sprawdzenie, czy interfejs umożliwia wybór dnia lub tygodnia.

Ten plan powinien stanowić solidną podstawę do implementacji widoku `HomePage` w zakresie wymaganym przez US-005. 
