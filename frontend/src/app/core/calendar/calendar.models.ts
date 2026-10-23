/** Response of `GET /calendar/status`. */
export interface CalendarStatus {
  linked: boolean;
}

/** Response of `GET /calendar/link-url`. */
export interface CalendarLinkUrl {
  url: string;
}

/** One entry of `GET /calendar/events`. */
export interface CalendarEvent {
  id: string;
  title: string;
  /**
   * RFC3339 timestamp for timed events; a date-only value (`2026-10-25`) for
   * all-day events.
   */
  start: string;
  /** Same format as the corresponding `start`. */
  end: string;
}
