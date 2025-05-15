import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DeskManagementComponent } from './components/desk-management/desk-management.component';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatTabsModule,
    MatIconModule,
    RouterLink,
    DeskManagementComponent
  ],
  template: `
    <div class="admin-container">
      <mat-card class="admin-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon color="primary" class="admin-icon">admin_panel_settings</mat-icon>
            Panel Administratora
          </mat-card-title>
          <mat-card-subtitle>
            Zalogowany jako: {{ isBrowser && authService.user()?.username || 'admin' }}
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <mat-tab-group>
            <mat-tab label="Zarządzanie biurkami">
              <div class="tab-content">
                <app-desk-management></app-desk-management>
              </div>
            </mat-tab>

            <mat-tab label="Zarządzanie użytkownikami">
              <div class="tab-content">
                <p>Tutaj będzie zarządzanie użytkownikami.</p>
                <p>Funkcjonalność w trakcie implementacji.</p>
              </div>
            </mat-tab>

            <mat-tab label="Rezerwacje">
              <div class="tab-content">
                <p>Tutaj będzie zarządzanie rezerwacjami.</p>
                <p>Funkcjonalność w trakcie implementacji.</p>
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card-content>

        <mat-card-actions>
          <button mat-raised-button color="primary" routerLink="/dashboard">
            Powrót do panelu użytkownika
          </button>
          <button mat-raised-button color="warn" (click)="logout()">
            Wyloguj się
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-container {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 40px 16px;
      min-height: calc(100vh - 64px - 80px);
    }

    .admin-card {
      width: 100%;
      max-width: 1000px;
    }

    .admin-icon {
      vertical-align: middle;
      margin-right: 8px;
      font-size: 28px;
      height: 28px;
      width: 28px;
    }

    mat-card-header {
      margin-bottom: 24px;
    }

    mat-card-actions {
      display: flex;
      gap: 16px;
      padding: 16px;
    }

    .tab-content {
      padding: 20px 0;
    }
  `]
})
export class AdminPageComponent {
  protected authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  protected isBrowser = isPlatformBrowser(this.platformId);

  logout(): void {
    if (this.isBrowser) {
      this.authService.logout();
    }
  }
}
