/** Error codes returned by the API in error envelopes. */
export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_ERROR";

/** Successful response envelope. */
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

/** Error response envelope. */
export interface ApiError {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
}

/** Union of all possible API response shapes. */
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
