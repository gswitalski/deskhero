import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DeskManagementComponent } from './components/desk-management/desk-management.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatToolbarModule,
    DeskManagementComponent
  ],
  template: `
    <div class="admin-container">
      <mat-toolbar color="primary" class="admin-toolbar">
        <span>Panel Administratora</span>
      </mat-toolbar>

      <div class="admin-content">
        <mat-tab-group>
          <mat-tab label="Zarządzanie Biurkami">
            <app-desk-management></app-desk-management>
          </mat-tab>
          <!-- Tutaj można dodać więcej zakładek dla innych funkcji administracyjnych -->
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .admin-container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .admin-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .admin-content {
      padding: 16px;
      flex: 1;
    }
  `]
})
export class AdminComponent {
}
