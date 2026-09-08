/** The authenticated user, as returned by the API. Never includes the hash. */
export interface AuthUser {
  id: number;
  email: string;
  displayName: string;
}

/** Body of a successful `POST /api/auth/login`. */
export interface LoginResponse {
  /** Opaque session token — sent back as `Authorization: Bearer <token>`. */
  token: string;
  user: AuthUser;
}

/** Body of `GET /api/auth/me`. */
export interface MeResponse {
  user: AuthUser;
}
