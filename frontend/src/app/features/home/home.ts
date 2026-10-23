import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CalendarService, isNotLinkedError } from '../../core/calendar/calendar.service';
import { LogoutButton } from '../auth/logout-button/logout-button';
import { CalendarConnected } from '../calendar/calendar-connected/calendar-connected';
import { LinkGoogleCalendar } from '../calendar/link-google-calendar/link-google-calendar';

type CalendarLinkState = 'loading' | 'linked' | 'not-linked';
type EventsState = 'loading' | 'ready' | 'error';

@Component({
  selector: 'app-home',
  imports: [CalendarConnected, LinkGoogleCalendar, LogoutButton, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly calendarService = inject(CalendarService);

  protected readonly calendarLinkState = signal<CalendarLinkState>('loading');
  protected readonly eventsState = signal<EventsState>('loading');
  protected readonly eventCount = signal(0);

  constructor() {
    this.loadStatus();
  }

  private loadStatus(): void {
    this.calendarLinkState.set('loading');

    this.calendarService.getStatus().subscribe({
      next: ({ linked }) => {
        if (!linked) {
          this.calendarLinkState.set('not-linked');
          return;
        }

        this.calendarLinkState.set('linked');
        this.loadEvents();
      },
      // Without a usable answer, fall back to offering the link button; only a
      // confirmed `linked: true` hides it.
      error: () => this.calendarLinkState.set('not-linked'),
    });
  }

  private loadEvents(): void {
    this.eventsState.set('loading');

    this.calendarService.getEvents().subscribe({
      next: (events) => {
        this.eventCount.set(events.length);
        this.eventsState.set('ready');
      },
      error: (error: unknown) => {
        // The stored link is no longer usable, so offer the link button again.
        if (isNotLinkedError(error)) {
          this.calendarLinkState.set('not-linked');
          return;
        }

        this.eventsState.set('error');
      },
    });
  }
}
