# Specyfikacja modułu rejestracji i logowania użytkowników

Poniższy dokument opisuje szczegółową architekturę i kontrakty dla implementacji funkcjonalności rejestracji i logowania, zgodnie z wymaganiami z pliku `09. prd - result.md` oraz technologiami opisanymi w `10. tech-stack.md`.

---
## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA (Frontend)

### 1.1 Struktura stron i layoutów

- **Nowe strony** (folder `frontend/src/app/pages`):
  - `RegisterPageComponent` (frontend/src/app/pages/register)
  - `LoginPageComponent` (frontend/src/app/pages/login)

- **Layouty**:
  - `AuthLayoutComponent` (frontend/src/app/layouts/auth-layout)
    - Zawiera header (logo), kontener na formularz oraz stopkę z linkiem do pomocy.
  - `PublicLayoutComponent` (frontend/src/app/layouts/public-layout)
    - Layout dla widoków dostępnych przed zalogowaniem (np. widok dostępności biurek).

### 1.2 Komponenty formularzy i odpowiedzialność

- **RegisterFormComponent** (frontend/src/app/shared/forms/register-form)
  - Pola: `username`, `name`, `password`, `confirmPassword`.
  - Walidacja przy użyciu Reactive Forms.
  - Metoda `onSubmit()` emituje obiekt `RegisterRequest`.

- **LoginFormComponent** (frontend/src/app/shared/forms/login-form)
  - Pola: `username`, `password`.
  - Metoda `onSubmit()` emituje obiekt `LoginRequest`.

- **AuthService** (frontend/src/app/core/services/auth.service.ts)
  - Metody:
    - `register(data: RegisterRequest): Observable<void>`
    - `login(data: LoginRequest): Observable<AuthResponse>`
    - `logout(): void`
  - Przechowuje token w `localStorage` i udostępnia status przez `BehaviorSubject<boolean>`.

### 1.3 Integracja i nawigacja

- **Routing** (frontend/src/app/app-routing.module.ts):
  - Ścieżki `/login` i `/register` używają `AuthLayoutComponent`.
  - Ścieżki chronione (`/dashboard`, `/reservations`) zabezpieczone przez `AuthGuard`.
  - GuestGuard blokuje dostęp do stron logowania/rejestracji zalogowanym.

- **Przepływ użytkownika**:
  1. Użytkownik odwiedza `/register` → wypełnia formularz → `AuthService.register()` → po sukcesie redirect do `/login` z parametrem `?registered=true`. Jako nazwy użytkownika user podaje swój adres email.
  2. Użytkownik odwiedza `/login` → wypełnia dane → `AuthService.login()` → zapis tokenu → redirect do głównego dashboard.

### 1.4 Walidacja i komunikaty błędów

- **Zasady walidacji**:
  - `username`: wymagany, poprawny format (`Validators.email`, `Validators.required`).
  - `password`: wymagany, min. długość 8 znaków (`Validators.minLength(8)`).
  - `name`: wymagany.
  - `confirmPassword`: musi być zgodne z `password`.

- **Komunikaty użytkownika**:
  - „Pole jest wymagane.”
  - „Nieprawidłowy format adresu email.”
  - „Hasło musi mieć co najmniej 8 znaków.”
  - „Hasła nie są zgodne.”
  - „Email jest już zajęty.”
  - „Niepoprawny email lub hasło.”

### 1.5 Najważniejsze scenariusze

- **Rejestracja**:
  - Poprawne dane → status 201 + token → zapis tokenu → komunikat sukcesu → przejście do strony głownej jako zalogowany użytkownik.
  - Email w użyciu → status 409 → widoczny komunikat o zajętym emailu.

- **Logowanie**:
  - Poprawne dane → status 200 + token → zapis tokenu → przejście do strony głownej jako zalogowany użytkownik.
  - Błędne dane → status 401 → wyświetlenie komunikatu „Niepoprawny email lub hasło.”

---
## 2. LOGIKA BACKENDOWA (Java, Spring Boot)

### 2.1 Struktura endpointów i kontrakty API

1. `POST /api/users/register`
   - RequestBody: `RegisterRequestDTO`:
     ```json
     {
       "username": "string",
       "name": "string",
       "password": "string"
     }
     ```
   - Response (`201 created`):
     ```json
     {
       "token": "string",
       "expiresIn": 86400
     }
     ```

2. `POST /api/users/login`
   - RequestBody: `LoginRequestDTO`:
     ```json
     {
       "username": "string",
       "password": "string"
     }
     ```
   - Response (`200 OK`):
     ```json
     {
       "token": "string",
       "expiresIn": 86400
     }
     ```

### 2.2 Modele danych i warstwa dostępu

- **Encja User** (`pl.grsw.deskhero.model.User`):
  - `id: Long`
  - `username: String` (unikalne)
  - `name: String`
  - `passwordHash: String`
  - `roles: Set<Role>`

- **Encja/Enum Role**: `ROLE_USER`, `ROLE_ADMIN`.
- **Repozytorium**: `UserRepository extends JpaRepository<User, Long>`

### 2.3 Walidacja danych wejściowych

- DTO z adnotacjami:
  - `@NotBlank`, `@Email` dla `username`.
  - `@NotBlank`, `@Size(min = 8)` dla `password`.
  - `@NotBlank` dla `name`.
- Walidacja w kontrolerze z `@Valid` oraz globalny `@ControllerAdvice` do zbierania błędów.

### 2.4 Obsługa wyjątków i odpowiedzi

- **EmailAlreadyExistsException** → HTTP 409 Conflict:
  ```json
  { "error": "EMAIL_IN_USE" }
  ```
- **InvalidCredentialsException** → HTTP 401 Unauthorized:
  ```json
  { "error": "INVALID_CREDENTIALS" }
  ```
- Globalny handler (`RestExceptionHandler`) loguje i zwraca ujednolicone JSON-y.

---
## 3. SYSTEM AUTENTYKACJI (Spring Security + JWT)

### 3.1 Konfiguracja Spring Security

- **SecurityConfig** (`pl.grsw.deskhero.config.SecurityConfig`):
  - Definicja `AuthenticationManager` i `PasswordEncoder` (`BCryptPasswordEncoder`).
  - Konfiguracja ścieżek:
    ```java
    http
      .csrf().disable()
      .authorizeRequests()
        .antMatchers("/api/users/**").permitAll()
        .anyRequest().authenticated()
      .and()
      .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);
    ```

### 3.2 Token JWT

- **JwtProvider** (serwis):
  - Metody:
    - `generateToken(Authentication auth)` → token ważny 24h.
    - `validateToken(String token)`.
    - `getAuthentication(String token)` → `Authentication`.

- **JwtAuthenticationFilter**:
  - Wyciąga nagłówek `Authorization: Bearer <token>`.
  - Waliduje token i ustawia `SecurityContextHolder`.

### 3.3 Serwis uwierzytelniania

- **CustomUserDetailsService** implements `UserDetailsService`:
  - `loadUserByUsername(String username)` ładuje `User` z repozytorium.

- **AuthService** (`pl.grsw.deskhero.service.AuthService`):
  - `register(RegisterRequestDTO)`
  - `authenticate(LoginRequestDTO)` → zwraca `AuthResponseDTO` z tokenem.

### 3.4 Role i uprawnienia

- Domyślne: przy rejestracji przypisywana rola `ROLE_USER`.
- W przyszłości: możliwość rozbudowy o role `ROLE_ADMIN` i odpowiednie guardy w backendzie.

---

*Ta specyfikacja jest podstawą do implementacji i powinna zostać uzupełniona o szczegóły testów integracyjnych oraz ewentualne zmiany w CI/CD.* 
