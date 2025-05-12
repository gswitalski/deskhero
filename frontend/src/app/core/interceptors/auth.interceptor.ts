import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

/**
 * Interceptor HTTP, który dodaje token autoryzacji do nagłówków zapytań API
 * Pobiera token z localStorage i dodaje go do nagłówka Authorization w formacie Bearer <token>
 *
 * @param req Zapytanie HTTP
 * @param next Handler do wykonania zapytania
 * @returns Observable z odpowiedzią HTTP
 */
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const platformId = inject(PLATFORM_ID);

  // Interceptor działa tylko w przeglądarce, gdzie localStorage jest dostępny
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('token');

    // Dodaj token tylko jeśli istnieje i zapytanie jest kierowane do naszego API
    if (token && req.url.startsWith('/api/')) {
      // Klonuj zapytanie i dodaj token do nagłówków
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });

      // Wykonaj zmodyfikowane zapytanie
      return next(authReq);
    }
  }

  // Wykonaj oryginalne zapytanie, jeśli nie dodano tokenu
  return next(req);
};
