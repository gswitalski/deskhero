# Przypadki testowe dla widoku HomePage

## TC-001: Ładowanie strony głównej
**Warunki wstępne:** Użytkownik otwiera aplikację (nie jest zalogowany)

**Kroki:**
1. Wejdź na adres `/` lub `/home`

**Oczekiwany wynik:**
- Strona główna ładuje się prawidłowo
- Widoczny jest selektor dat z wybranym dniem dzisiejszym
- Pobierana jest lista biurek dla bieżącego dnia
- Lista biurek jest posortowana wg pomieszczenia (roomName), a następnie numeru biurka (deskNumber)

## TC-002: Wybór innej daty
**Warunki wstępne:** Użytkownik jest na stronie głównej

**Kroki:**
1. Kliknij na inny dzień w selektorze dat

**Oczekiwany wynik:**
- Wybrany dzień zostaje oznaczony jako zaznaczony
- Podczas ładowania danych wyświetlany jest spinner
- Po załadowaniu, lista biurek aktualizuje się dla wybranej daty
- Widoczna data w nagłówku listy biurek odpowiada wybranej dacie

## TC-003: Nawigacja między tygodniami
**Warunki wstępne:** Użytkownik jest na stronie głównej

**Kroki:**
1. Kliknij przycisk strzałki w lewo (poprzedni tydzień)
2. Wybierz dowolny dzień w poprzednim tygodniu
3. Kliknij przycisk strzałki w prawo (następny tydzień)
4. Wybierz dowolny dzień w następnym tygodniu

**Oczekiwany wynik:**
- Nawigacja między tygodniami działa poprawnie
- Zakres dat w nagłówku aktualizuje się
- Po wybraniu dnia, pobierane są dane dla tej daty
- Przycisk dnia dzisiejszego jest zawsze oznaczony jako "Dziś"

## TC-004: Sortowanie biurek na liście
**Warunki wstępne:** Użytkownik jest na stronie głównej z załadowaną listą biurek

**Kroki:**
1. Przeanalizuj kolejność wyświetlanych biurek

**Oczekiwany wynik:**
- Biurka są posortowane najpierw według nazwy pomieszczenia (roomName) alfabetycznie
- W obrębie tego samego pomieszczenia, biurka są posortowane według numeru (deskNumber) w kolejności naturalnej

## TC-005: Wyświetlanie statusu dostępności biurek
**Warunki wstępne:** Użytkownik jest na stronie głównej z załadowaną listą biurek

**Kroki:**
1. Przeanalizuj sposób wyświetlania statusu biurek

**Oczekiwany wynik:**
- Biurka dostępne (isAvailable=true) są oznaczone na zielono z ikoną check_circle i tekstem "Dostępne"
- Biurka zajęte (isAvailable=false) są oznaczone na czerwono z ikoną cancel i tekstem "Zajęte"

## TC-006: Obsługa błędów API
**Warunki wstępne:** API jest niedostępne lub zwraca błąd

**Kroki:**
1. Symuluj niedostępność API (np. offline, błąd serwera)
2. Wejdź na stronę główną
3. Kliknij "Spróbuj ponownie"

**Oczekiwany wynik:**
- Wyświetlany jest komunikat błędu "Nie udało się załadować listy biurek. Spróbuj ponownie później."
- Pokazuje się snackbar z tym samym komunikatem
- Przycisk "Spróbuj ponownie" jest widoczny
- Po kliknięciu "Spróbuj ponownie" następuje ponowna próba pobrania danych

## TC-007: Responsywność na różnych urządzeniach
**Warunki wstępne:** Użytkownik ma dostęp do różnych urządzeń lub może zmieniać rozmiar okna przeglądarki

**Kroki:**
1. Otwórz stronę główną na urządzeniu mobilnym lub zmniejsz szerokość okna przeglądarki
2. Otwórz stronę na tablecie lub średnim rozmiarze okna
3. Otwórz stronę na dużym ekranie

**Oczekiwany wynik:**
- Na wszystkich urządzeniach układ jest czytelny i użyteczny
- Na mniejszych ekranach selektor dat umożliwia przewijanie dni w poziomie
- Na mniejszych ekranach odstępy są zoptymalizowane dla lepszej czytelności

## TC-008: Brak dostępnych biurek
**Warunki wstępne:** API zwraca pustą listę biurek dla wybranej daty

**Kroki:**
1. Wybierz datę, dla której API zwraca pustą tablicę []

**Oczekiwany wynik:**
- Wyświetlany jest komunikat "Brak dostępnych biurek dla wybranego dnia."
- Nie ma wyświetlonych żadnych pozycji na liście

## TC-009: Dostępność UI (a11y)
**Warunki wstępne:** Użytkownik jest na stronie głównej

**Kroki:**
1. Przejdź przez UI używając tylko klawiatury (Tab, Enter)
2. Sprawdź kontrast kolorów
3. Sprawdź czytniki ekranu (jeśli dostępne)

**Oczekiwany wynik:**
- Można nawigować po wszystkich interaktywnych elementach za pomocą klawiatury
- Fokus jest widoczny na aktualnie wybranym elemencie
- Kontrast kolorów spełnia standardy dostępności
- Czytniki ekranu odczytują poprawnie zawartość strony 
