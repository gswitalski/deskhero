import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { RoleGuard } from './core/guards/role.guard';
import { AuthGuard } from './core/guards/auth.guard';
import { ActivatedRouteSnapshot } from '@angular/router';

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
    path: 'login',
    loadComponent: () => import('./pages/login/login-page.component').then(c => c.LoginPageComponent),
    title: 'DeskHero - Logowanie'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard-page.component').then(c => c.DashboardPageComponent),
    title: 'DeskHero - Panel',
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: 'my-reservations',
    loadComponent: () => import('./pages/my-reservations/my-reservations-page/my-reservations-page.component').then(c => c.MyReservationsPageComponent),
    title: 'DeskHero - Moje rezerwacje',
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin-page.component').then(c => c.AdminPageComponent),
    title: 'DeskHero - Panel Administratora',
    canActivate: [
      () => inject(AuthGuard).canActivate(),
      (route: ActivatedRouteSnapshot) => inject(RoleGuard).canActivate(route)
    ],
    data: { requiredRole: 'ROLE_ADMIN' }
  },
  {
    path: 'forbidden',
    loadComponent: () => import('./pages/forbidden/forbidden-page.component').then(c => c.ForbiddenPageComponent),
    title: 'DeskHero - Dostęp zabroniony'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
