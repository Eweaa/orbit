import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Small confirmation shown wherever the "Link Google Calendar" button would be. */
@Component({
  selector: 'app-calendar-connected',
  templateUrl: './calendar-connected.html',
  styleUrl: './calendar-connected.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarConnected {}
