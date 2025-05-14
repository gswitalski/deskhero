import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { Observable, tap, of, catchError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { UserDto, UserRegisterRequest, AuthResponse, LoginRequest, UserBasicInfo } from '../../shared/models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  // Signals
  private userSignal = signal<UserDto | null>(null);
  private isLoggedInSignal = signal<boolean>(false);
  private userRolesSignal = signal<string[]>([]);
  private logoutTimer: any = null;

  // Expose readonly signals
  readonly user = this.userSignal.asReadonly();
  readonly isLoggedIn = this.isLoggedInSignal.asReadonly();
  readonly userRoles = this.userRolesSignal.asReadonly();

  constructor() {
    // Sprawdź token tylko w środowisku przeglądarki
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      const tokenExpiration = localStorage.getItem('tokenExpiration');
      const userBasicInfo = localStorage.getItem('userBasicInfo');

      if (token && tokenExpiration) {
        const expirationDate = new Date(parseInt(tokenExpiration, 10));

        if (expirationDate > new Date()) {
          // Token jest wciąż ważny - ustaw dane użytkownika jeśli są dostępne
          if (userBasicInfo) {
            try {
              const basicInfo = JSON.parse(userBasicInfo) as UserBasicInfo;

              // Tymczasowo ustaw podstawowe dane bez ról
              this.userSignal.set({
                id: basicInfo.id,
                username: basicInfo.username,
                name: basicInfo.name,
                roles: [] // Tymczasowo puste, zostaną zaktualizowane po fetchCurrentUser
              });
              this.isLoggedInSignal.set(true);

              // Pobierz aktualne role i dane użytkownika z API
              this.fetchCurrentUser(token);
            } catch (e) {
              console.error('Błąd podczas parsowania danych użytkownika:', e);
            }
          }

          // Ustaw timer do automatycznego wylogowania
          const expirationDuration = expirationDate.getTime() - new Date().getTime();
          this.autoLogoutTimer(expirationDuration);
        } else {
          // Token wygasł - wyloguj użytkownika
          this.logout();
        }
      }
    }
  }

  // Pobierz aktualnego użytkownika z serwera na podstawie tokenu
  private fetchCurrentUser(token: string): void {
    // Dodaj token do nagłówków HTTP
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Wyświetl debug info
    console.log('Pobieranie danych użytkownika z tokenem:', token);

    this.http.get<UserDto>('/api/users/me', { headers })
      .pipe(
        catchError(error => {
          console.error('Błąd podczas pobierania danych użytkownika:', error);
          return of(null);
        })
      )
      .subscribe({
        next: (user) => {
          if (user && Array.isArray(user.roles)) {
            console.log('Pobrano dane użytkownika:', user);
            console.log('Role użytkownika:', user.roles);

            // Ustaw pełne dane użytkownika wraz z rolami
            this.userSignal.set(user);
            this.userRolesSignal.set(user.roles);

            // Dodatkowe logowanie, aby sprawdzić, czy role są poprawnie ustawione
            console.log('Ustawione role:', this.userRoles());
          } else {
            console.warn('Otrzymano niepełne dane użytkownika lub brak ról:', user);

            // Jeśli odpowiedź nie zawiera ról, spróbuj odczytać je z tokenu JWT
            this.extractRolesFromToken(token);
          }
        },
        error: (error) => {
          console.error('Błąd pobierania danych użytkownika:', error);

          // W przypadku błędu, również spróbuj odczytać role z tokenu
          this.extractRolesFromToken(token);
        }
      });
  }

  // Funkcja do dekodowania tokenu JWT i wyciągania ról
  private extractRolesFromToken(token: string): void {
    try {
      // Dekodowanie tokenu JWT (bez weryfikacji)
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Zdekodowany payload tokenu:', payload);

      // Sprawdź, gdzie w tokenie są przechowywane role
      // Typowe lokalizacje to payload.roles, payload.authorities lub payload.scope
      const roles: string[] = payload.roles || payload.authorities ||
                             (payload.scope ? payload.scope.split(' ') : []);

      if (Array.isArray(roles) && roles.length > 0) {
        console.log('Role wyodrębnione z tokenu:', roles);
        this.userRolesSignal.set(roles);
      } else {
        console.warn('Nie znaleziono ról w tokenie JWT');
      }
    } catch (e) {
      console.error('Błąd podczas dekodowania tokenu JWT:', e);
    }
  }

  register(payload: UserRegisterRequest): Observable<AuthResponse> {
    // Usuwamy pole confirmPassword przed wysłaniem do API
    const { confirmPassword, ...requestData } = payload;

    return this.http.post<AuthResponse>('/api/users/register', requestData);
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/users/login', credentials)
      .pipe(
        tap(response => {
          if (isPlatformBrowser(this.platformId)) {
            const token = response.token;
            localStorage.setItem('token', token);

            // Zapisz czas wygaśnięcia tokenu
            const expirationTime = new Date().getTime() + response.expiresIn * 1000;
            localStorage.setItem('tokenExpiration', expirationTime.toString());

            // Utworzenie lub uzupełnienie obiektu UserDto
            let userDto: UserDto;

            if (response.user) {
              // Jeśli odpowiedź zawiera pełny obiekt user, użyj go
              userDto = response.user;

              // Upewnij się, że pole name jest zgodne z tym, co zwraca backend
              if (response.name && !userDto.name) {
                userDto.name = response.name;
              }

              // Sprawdź, czy role są tablicą i czy nie są puste
              if (Array.isArray(userDto.roles) && userDto.roles.length > 0) {
                console.log('Role użytkownika z odpowiedzi API:', userDto.roles);
                // Zapisz role tylko w pamięci aplikacji, nie w localStorage
                this.userRolesSignal.set(userDto.roles);
              } else {
                console.warn('Brak ról w odpowiedzi API lub nieprawidłowy format ról');
                // Spróbuj wyodrębnić role z tokenu JWT
                this.extractRolesFromToken(token);
              }
            } else {
              // Jeśli odpowiedź nie zawiera pełnego obiektu user, utwórz go
              userDto = {
                id: 0, // Domyślne ID
                username: credentials.username,
                name: response.name || '',
                roles: ['ROLE_USER'] // Domyślna rola
              };

              // Zapisz domyślną rolę w pamięci, ale również spróbuj wyodrębnić role z tokenu
              this.userRolesSignal.set(['ROLE_USER']);
              this.extractRolesFromToken(token);
            }

            // Zapisz tylko podstawowe dane użytkownika (bez ról) w localStorage
            const userBasicInfo: UserBasicInfo = {
              id: userDto.id,
              username: userDto.username,
              name: userDto.name
            };
            localStorage.setItem('userBasicInfo', JSON.stringify(userBasicInfo));

            // Ustaw dane użytkownika
            this.userSignal.set(userDto);
            this.isLoggedInSignal.set(true);

            // Wyświetl komunikat, aby sprawdzić, czy role są poprawnie ustawione
            console.log('Role po zalogowaniu:', this.userRoles());

            // Uruchom timer do automatycznego wylogowania
            this.autoLogoutTimer(response.expiresIn * 1000);
          }
        })
      );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiration');
      localStorage.removeItem('userBasicInfo');
    }

    this.userSignal.set(null);
    this.userRolesSignal.set([]);
    this.isLoggedInSignal.set(false);

    // Wyczyść timer wylogowania
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }

    // Przekieruj do strony logowania
    this.router.navigate(['/login']);
  }

  private autoLogoutTimer(duration: number): void {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }

    this.logoutTimer = setTimeout(() => {
      this.logout();
    }, duration);
  }

  // Funkcje do zarządzania rolami
  hasRole(role: string): boolean {
    const roles = this.userRoles();
    const hasRole = roles.includes(role);
    console.log(`Sprawdzanie roli ${role}:`, hasRole, 'Dostępne role:', roles);
    return hasRole;
  }

  isAdmin(): boolean {
    const isAdmin = this.hasRole('ROLE_ADMIN');
    console.log('Czy użytkownik jest adminem:', isAdmin);
    return isAdmin;
  }
}
