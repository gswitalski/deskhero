import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'dehe-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    RouterLink
  ],
  template: `
    <div class="dashboard-container">
      <mat-card class="dashboard-card">
        <mat-card-header>
          <mat-card-title>Panel użytkownika</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Witaj, {{ isBrowser && authService.user()?.name || 'Użytkowniku' }}!</p>
          <p>Jesteś zalogowany jako: {{ isBrowser && authService.user()?.username || 'użytkownik' }}</p>

          <p *ngIf="isBrowser && authService.isAdmin()">
            <a mat-raised-button color="accent" routerLink="/admin">
              Przejdź do panelu administratora
            </a>
          </p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" routerLink="/">
            Powrót do strony głównej
          </button>
          <button mat-raised-button color="warn" (click)="logout()">
            Wyloguj się
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 40px 16px;
      min-height: calc(100vh - 64px - 80px);
    }

    .dashboard-card {
      width: 100%;
      max-width: 800px;
    }

    mat-card-header {
      margin-bottom: 24px;
    }

    mat-card-actions {
      display: flex;
      gap: 16px;
      padding: 16px;
    }

    .roles-container {
      margin: 16px 0;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
  `]
})
export class DashboardPageComponent {
  protected authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);

  logout(): void {
    if (this.isBrowser) {
      this.authService.logout();
    }
  }
}
