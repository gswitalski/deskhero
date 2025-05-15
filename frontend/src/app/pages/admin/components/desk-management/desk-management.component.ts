import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { DeskManagementService, DeskTableItem } from '../../services/desk-management.service';
import { DeskFormDialogComponent } from '../desk-form-dialog/desk-form-dialog.component';
import { DeleteConfirmationDialogComponent } from '../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { DeskDto } from '../../../../shared/models/desk.model';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'dehe-desk-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    FormsModule
  ],
  template: `
    <div class="desk-management-container">
      <div class="filters-container">
        <mat-form-field appearance="outline">
          <mat-label>Filtruj</mat-label>
          <input
            matInput
            [(ngModel)]="filterValue"
            (input)="applyFilter()"
            placeholder="Szukaj biurka...">
          @if (filterValue) {
            <button
              matSuffix
              mat-icon-button
              aria-label="Wyczyść"
              (click)="clearFilter()">
              <mat-icon>close</mat-icon>
            </button>
          }
        </mat-form-field>

        <button
          mat-raised-button
          color="primary"
          (click)="openAddDeskDialog()">
          <mat-icon>add</mat-icon>
          Dodaj biurko
        </button>
      </div>

      @if (loading()) {
        <div class="loading-container">
          <p>Ładowanie danych...</p>
        </div>
      } @else if (filteredDesks().length === 0) {
        <div class="empty-container">
          <p>Brak biurek do wyświetlenia</p>
        </div>
      } @else {
        <div class="table-container">
          <table mat-table [dataSource]="filteredDesks()">
            <!-- ID Column -->
            <ng-container matColumnDef="deskId">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let desk">{{ desk.deskId }}</td>
            </ng-container>

            <!-- Room Name Column -->
            <ng-container matColumnDef="roomName">
              <th mat-header-cell *matHeaderCellDef>Nazwa Pokoju</th>
              <td mat-cell *matCellDef="let desk">{{ desk.roomName }}</td>
            </ng-container>

            <!-- Desk Number Column -->
            <ng-container matColumnDef="deskNumber">
              <th mat-header-cell *matHeaderCellDef>Numer Biurka</th>
              <td mat-cell *matCellDef="let desk">{{ desk.deskNumber }}</td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Akcje</th>
              <td mat-cell *matCellDef="let desk">
                <button mat-icon-button color="primary" (click)="openEditDeskDialog(desk)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="openDeleteDeskDialog(desk)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .desk-management-container {
      padding: 16px;
    }

    .filters-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .table-container {
      overflow-x: auto;
    }

    .loading-container, .empty-container {
      display: flex;
      justify-content: center;
      padding: 24px;
      font-style: italic;
      color: rgba(0, 0, 0, 0.54);
    }

    table {
      width: 100%;
    }
  `]
})
export class DeskManagementComponent implements OnInit {
  private deskService = inject(DeskManagementService);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Stan komponentu używając sygnałów
  readonly loading = this.deskService.loading;
  readonly error = this.deskService.error;

  // Filtrowanie
  filterValue = '';
  private desksSignal = signal<DeskTableItem[]>([]);
  filteredDesks = signal<DeskTableItem[]>([]);

  // Konfiguracja tabeli
  displayedColumns: string[] = ['deskId', 'roomName', 'deskNumber', 'actions'];

  ngOnInit(): void {
    // Subskrybuj zmiany w liście biurek tylko w przeglądarce
    if (this.isBrowser) {
      this.deskService.desks$.subscribe(desks => {
        this.desksSignal.set(desks);
        this.applyFilter(); // Aktualizuj filtrowaną listę
      });

      // Obserwuj błędy
      if (this.error()) {
        this.notificationService.showError(this.error() || 'Wystąpił nieznany błąd');
      }
    }
  }

  // Filtrowanie danych
  applyFilter(): void {
    if (!this.filterValue.trim()) {
      this.filteredDesks.set(this.desksSignal());
      return;
    }

    const filterValue = this.filterValue.toLowerCase().trim();
    const filtered = this.desksSignal().filter(desk =>
      desk.roomName.toLowerCase().includes(filterValue) ||
      desk.deskNumber.toLowerCase().includes(filterValue) ||
      desk.deskId.toString().includes(filterValue)
    );

    this.filteredDesks.set(filtered);
  }

  clearFilter(): void {
    this.filterValue = '';
    this.applyFilter();
  }

  // Obsługa formularza dodawania
  openAddDeskDialog(): void {
    const dialogRef = this.dialog.open(DeskFormDialogComponent, {
      width: '400px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deskService.addDesk(result).subscribe({
          next: (desk) => {
            this.notificationService.showSuccess('Biurko zostało dodane pomyślnie');
            this.deskService.refreshDesks();
          },
          error: (error) => {
            this.notificationService.showError(error);
          }
        });
      }
    });
  }

  // Obsługa formularza edycji
  openEditDeskDialog(desk: DeskTableItem): void {
    const dialogRef = this.dialog.open(DeskFormDialogComponent, {
      width: '400px',
      data: {
        desk: {
          deskId: desk.deskId,
          roomName: desk.roomName,
          deskNumber: desk.deskNumber
        } as DeskDto
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deskService.updateDesk(desk.deskId, result).subscribe({
          next: (updatedDesk) => {
            this.notificationService.showSuccess('Biurko zostało zaktualizowane pomyślnie');
            this.deskService.refreshDesks();
          },
          error: (error) => {
            this.notificationService.showError(error);
          }
        });
      }
    });
  }

  // Obsługa usuwania
  openDeleteDeskDialog(desk: DeskTableItem): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '400px',
      data: {
        desk: {
          deskId: desk.deskId,
          roomName: desk.roomName,
          deskNumber: desk.deskNumber
        } as DeskDto
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deskService.deleteDesk(desk.deskId).subscribe({
          next: (response) => {
            this.notificationService.showSuccess('Biurko zostało usunięte pomyślnie');
            this.deskService.refreshDesks();
          },
          error: (error) => {
            this.notificationService.showError(error);
          }
        });
      }
    });
  }
}
