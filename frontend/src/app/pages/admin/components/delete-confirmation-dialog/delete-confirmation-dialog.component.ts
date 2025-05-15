import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DeskDto } from '../../../../shared/models/desk.model';

export interface DeleteConfirmationDialogData {
  desk: DeskDto;
}

@Component({
  selector: 'dehe-delete-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Potwierdź usunięcie</h2>
    <div mat-dialog-content>
      <p>Czy na pewno chcesz usunąć biurko:</p>
      <p><strong>Pokój:</strong> {{ data.desk.roomName }}</p>
      <p><strong>Numer:</strong> {{ data.desk.deskNumber }}</p>
      <p class="warning">Tej operacji nie można cofnąć.</p>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Anuluj</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true">Potwierdź</button>
    </div>
  `,
  styles: [`
    .warning {
      color: #f44336;
      font-weight: 500;
      margin-top: 16px;
    }
  `]
})
export class DeleteConfirmationDialogComponent {
  dialogRef = inject(MatDialogRef<DeleteConfirmationDialogComponent>);
  data: DeleteConfirmationDialogData = inject(MAT_DIALOG_DATA);
}
