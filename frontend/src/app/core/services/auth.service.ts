import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { UserDto, UserRegisterRequest, UserRegisterResponse } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  // Signals
  private userSignal = signal<UserDto | null>(null);
  private isLoggedInSignal = signal<boolean>(false);

  // Expose readonly signals
  readonly user = this.userSignal.asReadonly();
  readonly isLoggedIn = this.isLoggedInSignal.asReadonly();

  constructor() {
    // Sprawdź token tylko w środowisku przeglądarki
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        // TODO: Zaimplementować weryfikację tokenu
        // Na razie zakładamy, że jeśli token istnieje, użytkownik jest zalogowany
        this.isLoggedInSignal.set(true);
      }
    }
  }

  register(payload: UserRegisterRequest): Observable<UserRegisterResponse> {
    return this.http.post<UserRegisterResponse>('/api/users/register', payload)
      .pipe(
        tap(response => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', response.token);
          }
          this.userSignal.set(response.user);
          this.isLoggedInSignal.set(true);
        })
      );
  }

  setUser(user: UserDto): void {
    this.userSignal.set(user);
    this.isLoggedInSignal.set(true);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }
    this.userSignal.set(null);
    this.isLoggedInSignal.set(false);
  }
}
