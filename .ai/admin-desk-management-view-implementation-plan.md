# Plan implementacji widoku zarządzania biurkami

## 1. Przegląd
Widok zarządzania biurkami to część panelu administracyjnego aplikacji DeskHero, dostępna wyłącznie dla użytkowników z rolą administratora. Umożliwia zarządzanie biurkami poprzez operacje CRUD (Tworzenie, Odczyt, Aktualizacja, Usuwanie). Widok prezentuje listę biurek w formie tabeli z możliwością filtrowania oraz udostępnia przyciski do dodawania nowych biurek, edycji istniejących oraz ich usuwania.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką: `/admin` jako zakładka w panelu administracyjnym.

## 3. Struktura komponentów
```
AdminPanelPage
├── MatTabs
│   ├── DeskManagementComponent
│   │   ├── MatTable (lista biurek)
│   │   ├── MatButton (dodaj biurko)
│   │   ├── MatIconButtons (edytuj/usuń biurko)
│   │   ├── MatFormField (filtrowanie)
│   │   ├── DeskFormDialogComponent (modal dodawania/edycji)
│   │   └── DeleteConfirmationDialogComponent (modal usuwania)
│   └── [Inne zakładki administracyjne]
```

## 4. Szczegóły komponentów

### AdminPanelPage
- Opis komponentu: Główny komponent panelu administracyjnego zawierający zakładki do różnych sekcji zarządzania.
- Główne elementy: 
  - `<mat-toolbar>` z tytułem "Panel Administratora"
  - `<mat-tab-group>` z zakładkami dla różnych funkcji administracyjnych
  - Pierwsza zakładka "Zarządzanie Biurkami" zawierająca `<app-desk-management>`
- Obsługiwane interakcje: Przełączanie między zakładkami
- Obsługiwana walidacja: Brak
- Typy: Nie wymaga specjalnych typów
- Propsy: Brak

### DeskManagementComponent
- Opis komponentu: Główny komponent zarządzania biurkami, zawierający tabelę biurek i przyciski akcji.
- Główne elementy:
  - `<mat-form-field>` z `<input>` do filtrowania biurek
  - `<button mat-raised-button>` do dodawania nowego biurka
  - `<mat-table>` wyświetlająca listę biurek z kolumnami: ID, Nazwa Pokoju, Numer Biurka, Akcje
  - `<mat-icon-button>` dla akcji edycji i usuwania przy każdym wierszu
  - `<mat-paginator>` dla paginacji (opcjonalnie)
- Obsługiwane interakcje:
  - Kliknięcie przycisku "Dodaj biurko" - otwiera modal dodawania
  - Kliknięcie ikony edycji - otwiera modal edycji dla wybranego biurka
  - Kliknięcie ikony usunięcia - otwiera modal potwierdzenia usunięcia
  - Wpisywanie tekstu w pole filtrowania - filtruje tabelę w czasie rzeczywistym
- Obsługiwana walidacja: Brak na poziomie komponentu (walidacja odbywa się w formularzach)
- Typy:
  - `DeskTableItem` - model danych dla tabeli
  - `DeskManagementState` - model stanu komponentu
- Propsy: Brak

### DeskFormDialogComponent
- Opis komponentu: Modal z formularzem do dodawania lub edycji biurka.
- Główne elementy:
  - `<mat-dialog-title>` z tytułem "Dodaj biurko" lub "Edytuj biurko"
  - `<form>` z kontrolkami formularza Angular Reactive Forms
  - `<mat-form-field>` dla pola "Nazwa Pokoju"
  - `<mat-form-field>` dla pola "Numer Biurka"
  - Przyciski akcji: "Anuluj" i "Zapisz"
- Obsługiwane interakcje:
  - Kliknięcie "Anuluj" - zamyka modal bez zapisywania
  - Kliknięcie "Zapisz" - waliduje formularz i wysyła dane do API
  - Zmiana wartości pól - aktualizuje stan formularza i sprawdza walidację
- Obsługiwana walidacja:
  - Nazwa Pokoju: wymagane, niepuste pole
  - Numer Biurka: wymagane, niepuste pole
- Typy:
  - `DeskFormData` - model formularza
  - `DeskRequestDto` - model danych dla API
- Propsy:
  - `data: { desk?: DeskDto }` - dane istniejącego biurka (dla edycji) lub undefined (dla dodawania)

### DeleteConfirmationDialogComponent
- Opis komponentu: Modal potwierdzenia usunięcia biurka.
- Główne elementy:
  - `<mat-dialog-title>` z tytułem "Potwierdź usunięcie"
  - `<mat-dialog-content>` z pytaniem o potwierdzenie i danymi biurka
  - Przyciski akcji: "Anuluj" i "Potwierdź"
- Obsługiwane interakcje:
  - Kliknięcie "Anuluj" - zamyka modal bez usuwania
  - Kliknięcie "Potwierdź" - wysyła żądanie usunięcia do API
- Obsługiwana walidacja: Brak
- Typy: Brak specjalnych typów
- Propsy:
  - `data: { desk: DeskDto }` - dane biurka do usunięcia

## 5. Typy

### DeskTableItem
```typescript
interface DeskTableItem {
  deskId: number;
  roomName: string;
  deskNumber: string;
}
```

### DeskFormData
```typescript
interface DeskFormData {
  roomName: string;
  deskNumber: string;
}
```

### DeskManagementState
```typescript
interface DeskManagementState {
  desks: DeskTableItem[];
  loading: boolean;
  error: string | null;
  filterValue: string;
}
```

## 6. Zarządzanie stanem

Stan będzie zarządzany za pomocą serwisu Angular:

```typescript
@Injectable({
  providedIn: 'root'
})
export class DeskManagementService {
  private desksSubject = new BehaviorSubject<DeskTableItem[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  
  desks$ = this.desksSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();
  
  // Metody do pobierania, dodawania, edycji, usuwania biurek
  // Metody do obsługi błędów i aktualizacji stanu
}
```

Komponenty będą subskrybować odpowiednie strumienie Observable w celu otrzymywania aktualnego stanu.

## 7. Integracja API

### Pobieranie listy biurek
- Metoda: GET
- Endpoint: `/api/desks`
- Parametry: Brak
- Typ odpowiedzi: `DeskDto[]`
- Obsługa błędów: 401 (Brak autoryzacji)

### Dodawanie biurka
- Metoda: POST
- Endpoint: `/api/desks`
- Parametry: 
```typescript
{
  roomName: string;
  deskNumber: string;
}
```
- Typ odpowiedzi: `DeskDto`
- Obsługa błędów: 400 (Niepoprawne dane), 409 (Konflikt - biurko już istnieje), 401 (Brak autoryzacji)

### Edycja biurka
- Metoda: PUT
- Endpoint: `/api/desks/{id}`
- Parametry:
```typescript
{
  roomName: string;
  deskNumber: string;
}
```
- Typ odpowiedzi: `DeskDto`
- Obsługa błędów: 400 (Niepoprawne dane), 404 (Biurko nie istnieje), 409 (Konflikt), 401 (Brak autoryzacji)

### Usuwanie biurka
- Metoda: DELETE
- Endpoint: `/api/desks/{id}`
- Parametry: Brak
- Typ odpowiedzi: `DeleteDeskResponseDto`
- Obsługa błędów: 404 (Biurko nie istnieje), 401 (Brak autoryzacji)

## 8. Interakcje użytkownika

### Przeglądanie listy biurek
1. Administrator przechodzi do panelu administracyjnego i wybiera zakładkę "Zarządzanie Biurkami"
2. System wyświetla tabelę z listą wszystkich biurek
3. Administrator może filtrować listę wpisując tekst w pole filtrowania

### Dodawanie biurka
1. Administrator klika przycisk "Dodaj biurko"
2. System wyświetla modal z formularzem
3. Administrator wypełnia pola "Nazwa Pokoju" i "Numer Biurka"
4. Administrator klika "Zapisz"
5. System waliduje dane i wysyła żądanie do API
6. System wyświetla komunikat o sukcesie i odświeża listę biurek
7. Modal zostaje zamknięty

### Edycja biurka
1. Administrator klika ikonę edycji przy wybranym biurku
2. System wyświetla modal z formularzem wypełnionym danymi wybranego biurka
3. Administrator modyfikuje pola "Nazwa Pokoju" i/lub "Numer Biurka"
4. Administrator klika "Zapisz"
5. System waliduje dane i wysyła żądanie do API
6. System wyświetla komunikat o sukcesie i odświeża listę biurek
7. Modal zostaje zamknięty

### Usuwanie biurka
1. Administrator klika ikonę usunięcia przy wybranym biurku
2. System wyświetla modal z pytaniem o potwierdzenie usunięcia
3. Administrator klika "Potwierdź"
4. System wysyła żądanie do API
5. System wyświetla komunikat o sukcesie i odświeża listę biurek
6. Modal zostaje zamknięty

## 9. Warunki i walidacja

### Walidacja formularza dodawania/edycji biurka
- Pole "Nazwa Pokoju":
  - Wymagane (required)
  - Niepuste (minLength: 1)
- Pole "Numer Biurka":
  - Wymagane (required)
  - Niepuste (minLength: 1)
- Przycisk "Zapisz" jest aktywny tylko gdy formularz jest poprawnie wypełniony

### Obsługa duplikatów
- System weryfikuje unikalność kombinacji "Nazwa Pokoju" + "Numer Biurka" po stronie serwera
- W przypadku konfliktu (kod 409) wyświetlany jest komunikat o błędzie

## 10. Obsługa błędów

### Błędy API
- 401 Unauthorized: Przekierowanie do strony logowania
- 400 Bad Request: Wyświetlenie komunikatu o błędzie walidacji w formularzu
- 404 Not Found: Wyświetlenie komunikatu o braku biurka i odświeżenie listy
- 409 Conflict: Wyświetlenie komunikatu o konflikcie (duplikat biurka)
- Błąd sieci: Wyświetlenie ogólnego komunikatu o problemie z połączeniem

### Obsługa komunikatów
Wszystkie komunikaty (sukces/błąd) będą wyświetlane za pomocą komponentu MatSnackBar.

## 11. Kroki implementacji

1. Utworzenie bazowej struktury komponentów:
   - Utworzenie komponentu `AdminPanelPage` z zakładkami MatTabs
   - Utworzenie komponentu `DeskManagementComponent` z tabelą MatTable
   - Utworzenie komponentów dialogowych `DeskFormDialogComponent` i `DeleteConfirmationDialogComponent`

2. Implementacja serwisu zarządzającego stanem:
   - Utworzenie serwisu `DeskManagementService` z metodami do komunikacji z API
   - Implementacja metod do pobierania, dodawania, edycji i usuwania biurek
   - Implementacja obsługi błędów

3. Implementacja komponentów:
   - `AdminPanelPage` z zakładkami
   - `DeskManagementComponent` z tabelą i przyciskami akcji
   - `DeskFormDialogComponent` z formularzem i walidacją
   - `DeleteConfirmationDialogComponent` z potwierdzeniem

4. Podłączenie komponentów do serwisu:
   - Subskrypcja odpowiednich strumieni Observable
   - Obsługa akcji użytkownika

5. Implementacja nawigacji:
   - Dodanie chronionej ścieżki do `AdminPanelPage` w pliku routingu
   - Implementacja strażnika (guard) sprawdzającego rolę administratora

6. Implementacja filtrowania tabeli:
   - Dodanie pola wyszukiwania
   - Implementacja logiki filtrowania w czasie rzeczywistym

7. Implementacja obsługi komunikatów:
   - Dodanie serwisu `NotificationService` do wyświetlania komunikatów za pomocą MatSnackBar
   - Integracja z obsługą błędów API

8. Finalizacja i dokumentacja:
   - Ostateczne dostrojenie stylów i UX
   - Przegląd kodu pod kątem wydajności i dostępności
   - Aktualizacja dokumentacji (jeśli wymagana) 
