import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AUTH_IMAGE_ALT, AUTH_IMAGE_URL } from '../auth-image';

/**
 * The photographic half of the auth screen. The image URL is an input so it can
 * later be bound to a value coming from the API instead of the local constant.
 */
@Component({
  selector: 'app-auth-visual',
  templateUrl: './auth-visual.html',
  styleUrl: './auth-visual.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthVisual {
  readonly imageUrl = input(AUTH_IMAGE_URL);
  readonly imageAlt = input(AUTH_IMAGE_ALT);

  readonly eyebrow = input('Orbit');
  readonly title = input('Your workspace, in orbit.');
  readonly subtitle = input('One calm place for everything your team is building.');
}
