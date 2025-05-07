import { Routes } from '@angular/router';

/**
 * Konfiguracja tras aplikacji
 */
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home/home-page.component').then(c => c.HomePageComponent),
    title: 'DeskHero - Rezerwacja biurek'
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home-page.component').then(c => c.HomePageComponent),
    title: 'DeskHero - Rezerwacja biurek'
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register-page.component').then(c => c.RegisterPageComponent),
    title: 'DeskHero - Rejestracja'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
