import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { Observable, tap, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { UserDto, UserRegisterRequest, AuthResponse, LoginRequest } from '../../shared/models/user.model';
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
  private logoutTimer: any = null;

  // Expose readonly signals
  readonly user = this.userSignal.asReadonly();
  readonly isLoggedIn = this.isLoggedInSignal.asReadonly();

  constructor() {
    // Sprawdź token tylko w środowisku przeglądarki
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      const tokenExpiration = localStorage.getItem('tokenExpiration');
      const userData = localStorage.getItem('userData');

      if (token && tokenExpiration) {
        const expirationDate = new Date(parseInt(tokenExpiration, 10));

        if (expirationDate > new Date()) {
          // Token jest wciąż ważny - ustaw dane użytkownika jeśli są dostępne
          if (userData) {
            try {
              const user = JSON.parse(userData) as UserDto;
              this.userSignal.set(user);
              this.isLoggedInSignal.set(true);
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
            localStorage.setItem('token', response.token);

            // Zapisz czas wygaśnięcia tokenu
            const expirationTime = new Date().getTime() + response.expiresIn * 1000;
            localStorage.setItem('tokenExpiration', expirationTime.toString());

            // Utworzenie lub uzupełnienie obiektu UserDto
            // Wykorzystujemy pole name bezpośrednio z odpowiedzi lub z obiektu user
            let userDto: UserDto;

            if (response.user) {
              // Jeśli odpowiedź zawiera pełny obiekt user, użyj go
              userDto = response.user;

              // Upewnij się, że pole name jest zgodne z tym, co zwraca backend
              if (response.name && !userDto.name) {
                userDto.name = response.name;
              }
            } else {
              // Jeśli odpowiedź nie zawiera pełnego obiektu user, utwórz go
              userDto = {
                id: 0, // Domyślne ID
                username: credentials.username,
                name: response.name || '',
                roles: ['ROLE_USER'] // Domyślna rola
              };
            }

            // Zapisz dane użytkownika w localStorage
            localStorage.setItem('userData', JSON.stringify(userDto));

            // Ustaw dane użytkownika
            this.userSignal.set(userDto);
            this.isLoggedInSignal.set(true);

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
      localStorage.removeItem('userData');
    }

    this.userSignal.set(null);
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
    return this.user()?.roles.includes(role) || false;
  }

  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }
}
