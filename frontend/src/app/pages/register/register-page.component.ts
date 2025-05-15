import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRegisterRequest } from '../../shared/models/user.model';
import { RegisterFormComponent } from '../../components/register-form';

@Component({
  selector: 'dehe-register-page',
  standalone: true,
  imports: [
    MatCardModule,
    MatSnackBarModule,
    RegisterFormComponent
  ],
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss']
})
export class RegisterPageComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  onRegister(request: UserRegisterRequest): void {
    this.authService.register(request).subscribe({
      next: () => {
        this.snackBar.open('Rejestracja zakończona sukcesem. Możesz się teraz zalogować.', 'Zamknij', {
          duration: 3000
        });
        this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
      },
      error: (error) => {
        let errorMessage = 'Błąd rejestracji';
        if (error.status === 409) {
          errorMessage = 'Email już istnieje';
        }
        this.snackBar.open(errorMessage, 'Zamknij', {
          duration: 5000
        });
      }
    });
  }
}
