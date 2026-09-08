/**
 * Client-side storage for the session token.
 *
 * `POST /api/auth/login` returns an opaque per-user session token; it is kept
 * in localStorage and sent as `Authorization: Bearer <token>` on every request.
 * The token is server-side revocable (logout, or disabling the account), and
 * never ships in the built bundle.
 */
const STORAGE_KEY = "sk_session_token";

let inMemoryToken: string | null = readStored();

function readStored(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return inMemoryToken;
}

export function setToken(token: string): void {
  inMemoryToken = token;
  try {
    window.localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // Private-mode / storage disabled: the in-memory copy still works for this tab.
  }
}

export function clearToken(): void {
  inMemoryToken = null;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
