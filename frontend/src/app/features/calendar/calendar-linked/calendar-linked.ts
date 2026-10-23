import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { LinkGoogleCalendar } from '../link-google-calendar/link-google-calendar';

/** How long the success message stays on screen before moving on by itself. */
const REDIRECT_DELAY_MS = 2200;

/**
 * Landing point for the Google OAuth redirect. Google (or the backend) appends an
 * `error` query param when the user does not grant access.
 */
@Component({
  selector: 'app-calendar-linked',
  imports: [LinkGoogleCalendar, RouterLink],
  templateUrl: './calendar-linked.html',
  styleUrl: './calendar-linked.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarLinked {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /** `null` once the query params are known and Google reported no error. */
  protected readonly error = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('error'))),
    { initialValue: undefined },
  );

  constructor() {
    effect((onCleanup) => {
      if (this.error() !== null) {
        return;
      }

      const timer = setTimeout(
        () => void this.router.navigateByUrl('/calendar'),
        REDIRECT_DELAY_MS,
      );
      onCleanup(() => clearTimeout(timer));
    });
  }
}
