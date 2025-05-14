import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-cancel-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>Potwierdź anulowanie</h2>

      <mat-dialog-content>
        <p>Czy na pewno chcesz anulować tę rezerwację?</p>
        <p>Ta operacja jest nieodwracalna.</p>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Anuluj</button>
        <button mat-raised-button color="warn" (click)="onConfirm()">Potwierdź</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 8px;
    }

    h2 {
      margin-top: 0;
      color: var(--warn-color);
    }

    p {
      margin: 8px 0;
    }

    mat-dialog-actions {
      padding: 16px 0 8px;
    }
  `]
})
export class ConfirmCancelDialogComponent {
  private dialogRef = inject(MatDialogRef<ConfirmCancelDialogComponent>);

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
