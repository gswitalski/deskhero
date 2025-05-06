# Plan implementacji widoku RegisterPage

## 1. Przegląd
Widok **RegisterPage** umożliwia nowym użytkownikom rejestrację w systemie DeskHero poprzez podanie adresu email, imienia oraz hasła. Po pomyślnej rejestracji użytkownik otrzymuje JWT-token ważny przez 24 godziny i zostaje automatycznie zalogowany i przekierowany do strony głownej (home).

## 2. Routing widoku
- Ścieżka: `/register`
- Konfiguracja w `AppRoutingModule`:
  ```ts
  { path: 'register', component: RegisterPageComponent }
  ```

## 3. Struktura komponentów

AppComponent
├─ NavBarComponent
└─ RouterOutlet
   └─ RegisterPageComponent
      └─ RegisterFormComponent

## 4. Szczegóły komponentów

### 4.1 NavBarComponent
- Opis: Górny pasek nawigacyjny wyświetlający linki w zależności od stanu zalogowania.
- Elementy:
  - `<mat-toolbar>` z logo i przyciskami.
  - `<button mat-button routerLink="/register">Zarejestruj się</button>` (dla gościa)
  - `<button mat-button routerLink="/login">Zaloguj się</button>` (dla gościa)
- Zdarzenia:
  - Kliknięcie w przyciski routerLink.
- Typy/Props:
  - `@Input() isLoggedIn: boolean`
  - `@Input() userName?: string`

### 4.2 RegisterPageComponent
- Opis: Kontener strony rejestracji, odpowiada za layout i wyświetlenie formularza.
- Elementy:
  - `<mat-card>` z tytułem "Rejestracja".
  - `<app-register-form (submitRegister)="onRegister($event)"></app-register-form>`
- Zdarzenia:
  - `submitRegister` – wywoływane przez RegisterFormComponent.
- Walidacja:
  - Brak, delegowana do formularza.
- Typy/Props:
  - Brak.

### 4.3 RegisterFormComponent
- Opis: Formularz rejestracji oparty na Reactive Forms.
- Elementy:
  - `<form [formGroup]="form" (ngSubmit)="submit()">` 
  - `<mat-form-field>` dla pola email, name i password.
  - `<mat-error>` pod każdym polem wyświetlający błędy walidacji.
  - `<button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || isLoading">Zarejestruj się</button>`
  - `<mat-progress-spinner *ngIf="isLoading" diameter="24"></mat-progress-spinner>`
- Zdarzenia:
  - `ngSubmit` → `submit()`
- Walidacja:
  - `Validators.required` na wszystkich polach.
  - `Validators.email` na polu email.
  - `Validators.minLength(8)` na polu password.
- Typy/Props:
  - `@Output() submitRegister = new EventEmitter<UserRegisterRequest>();`
- Zmienne stanu:
  - `form: FormGroup`
  - `isLoading: boolean = false`
  - `errorMessage: string | null = null`

## 5. Typy
Umieścić w `frontend/src/app/shared/models`:
```ts
export interface UserDto {
  id: number;
  username: string;
  name: string;
}

export interface UserRegisterRequest {
  username: string;
  name: string;
  password: string;
}

export interface UserRegisterResponse {
  message: string;
  user: UserDto;
  token: string;
}
```

## 6. Zarządzanie stanem
- **Reactive Forms** (`form: FormGroup`) do walidacji i stanu pól.
- **Komponent lokalny** (`isLoading`, `errorMessage`) do spinnera i komunikatów.
- **AuthService** do przechowywania tokena i stanu zalogowania.

## 7. Integracja API
- W `AuthService` dodać metodę:
  ```ts
  register(payload: UserRegisterRequest): Observable<UserRegisterResponse> {
    return this.http.post<UserRegisterResponse>('/api/users/register', payload);
  }
  ```
- W `RegisterPageComponent.onRegister()`:
  1. Ustaw `isLoading = true`.
  2. Wywołaj `authService.register(request).subscribe(...)`.
  3. onSuccess:
     - `localStorage.setItem('token', response.token);`
     - `authService.setUser(response.user);`
     - przekieruj do `/` lub `/login`.
  4. onError:
     - Jeśli 409: `errorMessage = 'Email już istnieje';`
     - Inne: `errorMessage = 'Błąd rejestracji';`
     - Wyświetl `MatSnackBar.open(errorMessage)`.
     - `isLoading = false`.

## 8. Interakcje użytkownika
1. Gość klika "Zarejestruj się" w NavBar → `/register`.
2. Wpisuje dane: email, imię, hasło.
3. Formularz waliduje pola inline.
4. Klik "Zarejestruj się": spinner + wywołanie API.
5. Sukces:
   - Toast "Rejestracja zakończona sukcesem".
   - Automatyczne logowanie → przekierowanie do HomePage.
6. Błąd 409:
   - Pokazanie komunikatu pod formularzem i toast.
7. Inny błąd:
   - Toast z komunikatem ogólnym.

## 9. Warunki i walidacja
- Email: wymagany, format poprawny.
- Name: wymagane, niepuste.
- Password: wymagane, min. 8 znaków.
- Przed wysłaniem API: `form.valid === true`.
- Dodatkowo sprawdzać odpowiedź 409 i 400.

## 10. Obsługa błędów
- Błędy walidacji front-end: MatError pod polami.
- 409 Conflict: komunikat globalny + toast.
- 400 Bad Request: highlight pól (jeśli response zawiera szczegóły) lub toast.
- Brak sieci: toast "Brak połączenia z serwerem".

## 11. Kroki implementacji
1. Utworzyć lub zaktualizować `NavBarComponent` w `app/shared` – dodać linki do `/register` i `/login`.
2. Dodać trasę `/register` w `AppRoutingModule`.
3. Wygenerować `RegisterPageComponent` w `app/pages/register`.
4. Wygenerować `RegisterFormComponent` w `app/components/register-form`.
5. Skonfigurować ReactiveFormsModule w `AppModule`.
6. Zaimportować `MatCardModule`, `MatFormFieldModule`, `MatInputModule`, `MatButtonModule`, `MatProgressSpinnerModule`, `MatSnackBarModule`.
7. Utworzyć TS-interfejsy w `frontend/src/app/shared/models`.
8. Napisać `AuthService.register()` i metodę do przechowywania użytkownika/tokena.
9. W `RegisterFormComponent` zainicjalizować formGroup i walidatory.
10. Obsłużyć `ngSubmit` i emitować event do `RegisterPageComponent`.
11. W `RegisterPageComponent` subskrybować `authService.register()`, handle isLoading/error/success.
12. Przetestować manualnie: walidacje, rejestrację, błędy.

---
*Plan wdrożenia wyczerpuje wszystkie wymagania z PRD, User Story US-001 oraz uwzględnia stos technologiczny DeskHero.* 
