import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { AuthResponse, LoginRequest, RegisterRequest } from './auth.models';

const TOKEN_KEY = 'orbit.auth.token';
const EMAIL_KEY = 'orbit.auth.email';

/** Client for the Orbit auth API and the locally stored session. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.backendBaseUrl}/auth`;

  private readonly token = signal<string | null>(this.read(TOKEN_KEY));
  private readonly email = signal<string | null>(this.read(EMAIL_KEY));

  readonly currentEmail = this.email.asReadonly();

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, request)
      .pipe(tap((response) => this.storeSession(response)));
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/register`, request)
      .pipe(tap((response) => this.storeSession(response)));
  }

  logout(): void {
    this.token.set(null);
    this.email.set(null);
    this.remove(TOKEN_KEY);
    this.remove(EMAIL_KEY);
  }

  getToken(): string | null {
    return this.token();
  }

  isLoggedIn(): boolean {
    return this.token() !== null;
  }

  private storeSession(response: AuthResponse): void {
    this.token.set(response.token);
    this.email.set(response.email);
    this.write(TOKEN_KEY, response.token);
    this.write(EMAIL_KEY, response.email);
  }

  private read(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private write(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage can be unavailable (private mode, blocked cookies); the session
      // then simply lives for the current tab.
    }
  }

  private remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore unavailable storage.
    }
  }
}
