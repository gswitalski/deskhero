import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from './shared/components/nav-bar/nav-bar.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavBarComponent],
  template: `
    <app-nav-bar
      [isLoggedIn]="authService.isLoggedIn()"
      [userName]="authService.user()?.name"
      (logout)="onLogout()">
    </app-nav-bar>
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    main {
      min-height: calc(100vh - 64px);
      background-color: var(--background-color, #f5f5f5);
    }
  `]
})
export class AppComponent {
  protected authService = inject(AuthService);

  onLogout(): void {
    this.authService.logout();
  }
}
