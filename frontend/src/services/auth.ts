/**
 * Storage for the interim shared API credential.
 *
 * The password the operator types is kept in localStorage and sent as a bearer
 * token on every request. It never ships in the built bundle. This is a stopgap
 * until real per-user sessions exist (see the project plan).
 */
const STORAGE_KEY = "sk_api_token";

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
