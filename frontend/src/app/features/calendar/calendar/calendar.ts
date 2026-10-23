import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { CalendarEvent } from '../../../core/calendar/calendar.models';
import { CalendarService, isNotLinkedError } from '../../../core/calendar/calendar.service';
import { LogoutButton } from '../../auth/logout-button/logout-button';
import { CalendarConnected } from '../calendar-connected/calendar-connected';
import { LinkGoogleCalendar } from '../link-google-calendar/link-google-calendar';

type CalendarState = 'loading' | 'not-linked' | 'ready' | 'error';

/** An event, with its raw strings turned into dates the template can format. */
interface CalendarEventView {
  readonly id: string;
  readonly title: string;
  readonly start: Date;
  readonly end: Date;
  readonly allDay: boolean;
  readonly spansDays: boolean;
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Date-only values describe a calendar day, not an instant, so they are parsed as
 * local time — otherwise the date pipe would shift them across midnight.
 */
function toDate(value: string): Date {
  return new Date(DATE_ONLY.test(value) ? `${value}T00:00:00` : value);
}

function toEventView(event: CalendarEvent): CalendarEventView {
  const allDay = DATE_ONLY.test(event.start);
  const start = toDate(event.start);
  const end = toDate(event.end);
  // Google Calendar marks the end of an all-day event with an exclusive date, so
  // it is stepped back to the last day the event actually covers.
  const lastDay = allDay ? new Date(end.getFullYear(), end.getMonth(), end.getDate() - 1) : end;

  return {
    id: event.id,
    title: event.title,
    start,
    end: lastDay,
    allDay,
    spansDays:
      lastDay.getTime() > start.getTime() &&
      (lastDay.getFullYear() !== start.getFullYear() ||
        lastDay.getMonth() !== start.getMonth() ||
        lastDay.getDate() !== start.getDate()),
  };
}

@Component({
  selector: 'app-calendar',
  imports: [DatePipe, CalendarConnected, LinkGoogleCalendar, LogoutButton, RouterLink],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Calendar {
  private readonly calendarService = inject(CalendarService);

  protected readonly state = signal<CalendarState>('loading');

  /** Last answer from `GET /calendar/status`; drives the connected label. */
  protected readonly linked = signal(false);

  private readonly events = signal<readonly CalendarEvent[]>([]);

  protected readonly eventViews = computed(() => this.events().map((event) => toEventView(event)));

  constructor() {
    this.load();
  }

  protected retry(): void {
    this.load();
  }

  private load(): void {
    this.state.set('loading');

    this.calendarService.getStatus().subscribe({
      next: (status) => this.setLinkedState(status.linked),
      error: () => this.state.set('error'),
    });
  }

  private setLinkedState(linked: boolean): void {
    this.linked.set(linked);

    if (linked) {
      this.loadEvents();
      return;
    }

    this.state.set('not-linked');
  }

  private loadEvents(): void {
    this.calendarService.getEvents().subscribe({
      next: (events) => {
        this.events.set(events);
        this.state.set('ready');
      },
      error: (error: unknown) => {
        if (isNotLinkedError(error)) {
          // The stored link is no longer usable, so ask the user to link again.
          this.linked.set(false);
          this.state.set('not-linked');
          return;
        }

        this.state.set('error');
      },
    });
  }
}
