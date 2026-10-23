import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

const AUTH_PATH = /\/auth(\/|$)/;

/**
 * Adds the JWT to backend requests and ends the session when the backend rejects
 * it. A 401 from `/auth/*` means bad credentials, not an expired session, so it
 * is passed through to the form.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();

  const authorizedRequest =
    token !== null && request.url.startsWith(environment.backendBaseUrl)
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request;

  return next(authorizedRequest).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && !isAuthUrl(request.url)) {
        auth.logout();
        void router.navigateByUrl('/login');
      }

      return throwError(() => error);
    }),
  );
};

function isAuthUrl(url: string): boolean {
  try {
    return AUTH_PATH.test(new URL(url, window.location.origin).pathname);
  } catch {
    return false;
  }
}
