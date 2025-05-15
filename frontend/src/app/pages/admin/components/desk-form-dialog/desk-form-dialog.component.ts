import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DeskDto, DeskRequestDto } from '../../../../shared/models/desk.model';

export interface DeskFormDialogData {
  desk?: DeskDto;
}

@Component({
  selector: 'dehe-desk-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Edytuj biurko' : 'Dodaj biurko' }}</h2>
    <form [formGroup]="deskForm" (ngSubmit)="onSubmit()">
      <div mat-dialog-content>
        <mat-form-field appearance="outline" class="form-field">
          <mat-label>Nazwa pokoju</mat-label>
          <input matInput formControlName="roomName" placeholder="Wprowadź nazwę pokoju" required>
          @if (deskForm.get('roomName')?.hasError('required') && deskForm.get('roomName')?.touched) {
            <mat-error>Nazwa pokoju jest wymagana</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="form-field">
          <mat-label>Numer biurka</mat-label>
          <input matInput formControlName="deskNumber" placeholder="Wprowadź numer biurka" required>
          @if (deskForm.get('deskNumber')?.hasError('required') && deskForm.get('deskNumber')?.touched) {
            <mat-error>Numer biurka jest wymagany</mat-error>
          }
        </mat-form-field>
      </div>

      <div mat-dialog-actions align="end">
        <button mat-button type="button" [mat-dialog-close]="false">Anuluj</button>
        <button
          mat-raised-button
          color="primary"
          type="submit"
          [disabled]="deskForm.invalid">
          {{ isEditMode ? 'Zapisz zmiany' : 'Dodaj' }}
        </button>
      </div>
    </form>
  `,
  styles: [`
    .form-field {
      width: 100%;
      margin-bottom: 16px;
    }
  `]
})
export class DeskFormDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<DeskFormDialogComponent>);
  private data: DeskFormDialogData = inject(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);

  isEditMode = false;
  deskForm!: FormGroup;

  ngOnInit(): void {
    this.isEditMode = !!this.data.desk;
    this.initForm();
  }

  private initForm(): void {
    this.deskForm = this.fb.group({
      roomName: [this.data.desk?.roomName || '', Validators.required],
      deskNumber: [this.data.desk?.deskNumber || '', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.deskForm.valid) {
      const deskData: DeskRequestDto = {
        roomName: this.deskForm.value.roomName,
        deskNumber: this.deskForm.value.deskNumber
      };
      this.dialogRef.close(deskData);
    } else {
      // Oznacz wszystkie pola jako dotknięte, aby pokazać błędy walidacji
      Object.keys(this.deskForm.controls).forEach(key => {
        const control = this.deskForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}
