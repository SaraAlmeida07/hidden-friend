import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const session = authService.currentSession();

  let authReq = req;

  // If a session exists, inject the JWT access token in the headers
  if (session?.access_token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      // Handle central HTTP errors
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    })
  );
};
