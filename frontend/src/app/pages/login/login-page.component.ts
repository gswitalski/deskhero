import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../shared/models/user.model';
import { LoginFormComponent } from '../../components/login-form/login-form.component';

@Component({
  selector: 'dehe-login-page',
  standalone: true,
  imports: [
    MatCardModule,
    MatSnackBarModule,
    LoginFormComponent,
    RouterLink
  ],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    // Sprawdź, czy użytkownik został przekierowany po rejestracji
    this.route.queryParams.subscribe(params => {
      if (params['registered'] === 'true') {
        this.snackBar.open('Rejestracja zakończona sukcesem. Możesz się teraz zalogować.', 'Zamknij', {
          duration: 5000
        });
      }
    });
  }

  onLogin(request: LoginRequest): void {
    this.authService.login(request).subscribe({
      next: () => {
        this.snackBar.open('Logowanie udane', 'Zamknij', {
          duration: 3000
        });
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        let errorMessage = 'Błąd logowania';
        if (error.status === 401) {
          errorMessage = 'Niepoprawny email lub hasło';
        }
        this.snackBar.open(errorMessage, 'Zamknij', {
          duration: 5000
        });
      }
    });
  }
}
