import { ApiErrorCode } from "@sharons-kitchen/shared";
import { ApiClientError } from "../services/apiClient";

const errorMessages: Record<ApiErrorCode, string> = {
  VALIDATION_ERROR: "הנתונים שהוזנו אינם תקינים",
  UNAUTHORIZED: "נדרשת הזדהות מחדש",
  NOT_FOUND: "הפריט המבוקש לא נמצא",
  CONFLICT: "כבר קיימת מנה בשם הזה",
  RATE_LIMITED: "יותר מדי בקשות, נסה שוב מאוחר יותר",
  INTERNAL_ERROR: "אירעה שגיאה פנימית, נסה שנית",
};

/** Returns a Hebrew error message for a given API error code. */
export function getErrorMessage(code: ApiErrorCode): string {
  return errorMessages[code];
}

/**
 * Extracts a Hebrew error message from an unknown thrown value.
 * Falls back to a generic message for non-API errors (e.g. network failure).
 */
export function getErrorMessageFromError(err: unknown): string {
  if (err instanceof ApiClientError) {
    return getErrorMessage(err.code);
  }
  return "אירעה שגיאה, נסה שנית";
}
