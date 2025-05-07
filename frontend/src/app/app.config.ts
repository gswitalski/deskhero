import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarConfig } from '@angular/material/snack-bar';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    provideAnimations(),
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      } as MatSnackBarConfig
    }
  ]
};
