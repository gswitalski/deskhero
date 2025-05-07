import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserRegisterRequest } from '../../shared/models/user.model';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss']
})
export class RegisterFormComponent {
  @Output() submitRegister = new EventEmitter<UserRegisterRequest>();

  private fb = inject(FormBuilder);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.email]],
    name: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  submit(): void {
    if (this.form.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      this.submitRegister.emit(this.form.value as UserRegisterRequest);

      // Reset loading state (w prawdziwym scenariuszu stan zostanie zaktualizowany przez komponent rodzica)
      setTimeout(() => this.isLoading.set(false), 1000);
    } else {
      // Oznacz wszystkie pola jako dotknięte, aby wyświetlić błędy walidacji
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
    }
  }
}
