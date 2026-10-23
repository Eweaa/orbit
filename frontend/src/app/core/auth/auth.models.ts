/** Body of `POST /auth/login` and `POST /auth/register`. */
export interface AuthCredentials {
  email: string;
  password: string;
}

export type LoginRequest = AuthCredentials;
export type RegisterRequest = AuthCredentials;

/** Response of a successful sign-in or sign-up. */
export interface AuthResponse {
  token: string;
  email: string;
}
