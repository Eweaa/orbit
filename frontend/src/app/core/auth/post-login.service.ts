import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CalendarService } from '../calendar/calendar.service';
import { AuthService } from './auth.service';

/**
 * Shared destination logic after a successful sign-in or sign-up: users with a
 * linked calendar go straight to their events, everyone else lands on the page
 * that offers the link button.
 */
@Injectable({ providedIn: 'root' })
export class PostLoginService {
  private readonly auth = inject(AuthService);
  private readonly calendar = inject(CalendarService);
  private readonly router = inject(Router);

  continueToCalendar(): void {
    this.calendar.getStatus().subscribe({
      next: ({ linked }) => void this.router.navigateByUrl(linked ? '/calendar' : '/'),
      error: (error: unknown) => {
        // A 401 is already handled by the interceptor, which sends the user to
        // the login screen after clearing the session.
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return;
        }

        if (this.auth.isLoggedIn()) {
          void this.router.navigateByUrl('/');
        }
      },
    });
  }
}
