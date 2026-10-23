import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { CalendarEvent, CalendarLinkUrl, CalendarStatus } from './calendar.models';

/** Reads the Google Calendar state of the signed-in user from the backend. */
@Injectable({ providedIn: 'root' })
export class CalendarService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.backendBaseUrl}/calendar`;

  getStatus(): Observable<CalendarStatus> {
    return this.http.get<CalendarStatus>(`${this.baseUrl}/status`);
  }

  getEvents(): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(`${this.baseUrl}/events`);
  }

  /** Backend-built Google consent URL; the browser has to navigate to it. */
  getLinkUrl(): Observable<CalendarLinkUrl> {
    return this.http.get<CalendarLinkUrl>(`${this.baseUrl}/link-url`);
  }
}

/**
 * `GET /calendar/events` answers 409 with `{ error: 'not_linked' }` while the user
 * has not connected Google Calendar yet.
 */
export function isNotLinkedError(error: unknown): boolean {
  return error instanceof HttpErrorResponse && error.status === 409;
}
