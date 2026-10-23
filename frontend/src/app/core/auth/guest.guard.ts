import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Keeps signed-in visitors out of the login and register screens. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);

  return auth.isLoggedIn() ? inject(Router).createUrlTree(['/']) : true;
};
