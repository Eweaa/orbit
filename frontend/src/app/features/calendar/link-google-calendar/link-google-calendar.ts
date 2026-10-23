import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { CalendarService } from '../../../core/calendar/calendar.service';

/**
 * Starts the Google OAuth flow. The backend hands back the consent URL, then the
 * whole browser page has to navigate to Google.
 */
@Component({
  selector: 'app-link-google-calendar',
  templateUrl: './link-google-calendar.html',
  styleUrl: './link-google-calendar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkGoogleCalendar {
  readonly label = input('Link Google Calendar');

  private readonly calendarService = inject(CalendarService);

  protected readonly loading = signal(false);
  protected readonly failed = signal(false);

  protected link(): void {
    if (this.loading()) {
      return;
    }

    this.loading.set(true);
    this.failed.set(false);

    this.calendarService.getLinkUrl().subscribe({
      next: ({ url }) => {
        window.location.href = url;
      },
      error: () => {
        this.loading.set(false);
        this.failed.set(true);
      },
    });
  }
}
