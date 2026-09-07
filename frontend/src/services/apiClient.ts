import { ApiResponse, ApiErrorCode } from "@sharons-kitchen/shared";
import { getToken, clearToken } from "./auth";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

/** Thrown when the API returns `{ success: false, error: ... }`. */
export class ApiClientError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
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

/**
 * Fetch wrapper that:
 * 1. Prepends VITE_API_URL to the path
 * 2. Sets Content-Type: application/json and the bearer credential (if stored)
 * 3. On 401, clears the stored credential and notifies the app
 * 4. Unwraps the response envelope — returns `data` on success, throws `ApiClientError` on error
 */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    onUnauthorized?.();
    throw new ApiClientError("UNAUTHORIZED", "נדרשת הזדהות מחדש");
  }

  const envelope = (await res.json()) as ApiResponse<T>;

  if (!envelope.success) {
    throw new ApiClientError(envelope.error.code, envelope.error.message, envelope.error.details);
  }

  return envelope.data;
}
