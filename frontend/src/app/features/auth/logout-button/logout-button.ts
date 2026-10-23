import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

/** Ends the session and returns to the login screen. Hidden when signed out. */
@Component({
  selector: 'app-logout-button',
  templateUrl: './logout-button.html',
  styleUrl: './logout-button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoutButton {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly loggedIn = computed(() => this.auth.isLoggedIn());

  protected logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
