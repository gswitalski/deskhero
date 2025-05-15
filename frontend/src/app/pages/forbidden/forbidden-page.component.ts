import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'dehe-forbidden-page',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  template: `
    <div class="forbidden-container">
      <mat-card class="forbidden-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon color="warn" class="forbidden-icon">block</mat-icon>
            Dostęp zabroniony
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Nie masz uprawnień do przeglądania tej strony.</p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" routerLink="/">Wróć do strony głównej</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .forbidden-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: calc(100vh - 64px);
      padding: 0 16px;
    }

    .forbidden-card {
      max-width: 500px;
      width: 100%;
      text-align: center;
    }

    .forbidden-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
    }

    mat-card-header {
      justify-content: center;
      flex-direction: column;
    }

    mat-card-actions {
      justify-content: center;
      padding: 16px;
    }
  `]
})
export class ForbiddenPageComponent {}
