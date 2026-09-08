import { ApiResponse, ApiErrorCode } from "@sharons-kitchen/shared";
import { getToken, clearToken } from "./auth";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

/**
 * The bearer token is a real credential, so only attach it when the API origin
 * is https or a local loopback address. A misconfigured `VITE_API_URL` pointing
 * at plain http then fails loudly instead of leaking the token over the wire.
 */
const tokenTransportIsSafe = ((): boolean => {
  try {
    const { protocol, hostname } = new URL(BASE_URL);
    return (
      protocol === "https:" ||
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]" ||
      hostname === "::1"
    );
  } catch {
    return false;
  }
})();

if (!tokenTransportIsSafe) {
  console.warn(
    `VITE_API_URL (${BASE_URL}) is not https or loopback — the session token will not be sent.`,
  );
}

/**
 * Every code an {@link ApiClientError} can carry: the ones the API returns in
 * its error envelope, plus `NETWORK_ERROR` for client-side failures (the
 * request never completed, or the response body wasn't a valid envelope — a
 * proxy/gateway HTML page, a cold-start 502, an offline browser).
 */
export type ClientErrorCode = ApiErrorCode | "NETWORK_ERROR";

/** Thrown for any non-success outcome of {@link apiFetch}. */
export class ApiClientError extends Error {
  constructor(
    public readonly code: ClientErrorCode,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

/** Invoked whenever a request comes back 401, so the app can show the login gate. */
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

function isEnvelope<T>(value: unknown): value is ApiResponse<T> {
  return typeof value === "object" && value !== null && "success" in value;
}

/**
 * Fetch wrapper that:
 * 1. Prepends VITE_API_URL to the path
 * 2. Sets Content-Type: application/json and the bearer credential (if stored)
 * 3. On 401, clears the stored credential and notifies the app
 * 4. Unwraps the response envelope — returns `data` on success
 *
 * Any failure throws {@link ApiClientError}: an envelope error keeps the API's
 * code; a dropped request or an unparseable/unexpected body becomes
 * `NETWORK_ERROR`. It never throws a raw `TypeError`/`SyntaxError`.
 */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token && tokenTransportIsSafe) headers.set("Authorization", `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers });
  } catch {
    // Offline, DNS failure, connection refused, CORS block, request aborted.
    throw new ApiClientError("NETWORK_ERROR", "לא ניתן להתחבר לשרת. בדוק את החיבור ונסה שוב.");
  }

  if (res.status === 401) {
    clearToken();
    onUnauthorized?.();
    throw new ApiClientError("UNAUTHORIZED", "נדרשת הזדהות מחדש");
  }

  // No-content responses carry no envelope.
  if (res.status === 204) {
    return null as T;
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new ApiClientError(
      "NETWORK_ERROR",
      res.ok
        ? "התקבלה תשובה לא תקינה מהשרת."
        : `השרת החזיר שגיאה (${res.status}). נסה שוב מאוחר יותר.`,
    );
  }

  if (!isEnvelope<T>(body)) {
    throw new ApiClientError("NETWORK_ERROR", "התקבלה תשובה לא צפויה מהשרת.");
  }

  if (!body.success) {
    throw new ApiClientError(body.error.code, body.error.message, body.error.details);
  }

  return body.data;
}
