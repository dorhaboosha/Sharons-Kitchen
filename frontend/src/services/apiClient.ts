import { ApiResponse, ApiErrorCode } from "@sharons-kitchen/shared";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

/** Thrown when the API returns `{ success: false, error: ... }`. */
export class ApiClientError extends Error {
  constructor(public readonly code: ApiErrorCode, message: string, public readonly details?: unknown) {
    super(message);
    this.name = "ApiClientError";
  }
}

/**
 * Fetch wrapper that:
 * 1. Prepends VITE_API_URL to the path
 * 2. Sets Content-Type: application/json
 * 3. Unwraps the response envelope — returns `data` on success, throws `ApiClientError` on error
 */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });
  const envelope = (await res.json()) as ApiResponse<T>;

  if (!envelope.success) {
    throw new ApiClientError(
      envelope.error.code,
      envelope.error.message,
      envelope.error.details
    );
  }

  return envelope.data;
}
