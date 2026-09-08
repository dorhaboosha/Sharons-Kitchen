import { ApiClientError, ClientErrorCode } from "../services/apiClient";

const errorMessages: Record<ClientErrorCode, string> = {
  VALIDATION_ERROR: "הנתונים שהוזנו אינם תקינים",
  UNAUTHORIZED: "נדרשת הזדהות מחדש",
  NOT_FOUND: "הפריט המבוקש לא נמצא",
  CONFLICT: "כבר קיימת מנה בשם הזה",
  RATE_LIMITED: "יותר מדי בקשות, נסה שוב מאוחר יותר",
  INTERNAL_ERROR: "אירעה שגיאה פנימית, נסה שנית",
  NETWORK_ERROR: "לא ניתן להתחבר לשרת. בדוק את החיבור ונסה שוב.",
};

/** Returns a Hebrew error message for a given error code. */
export function getErrorMessage(code: ClientErrorCode): string {
  return errorMessages[code] ?? "אירעה שגיאה, נסה שנית";
}

/**
 * Extracts a Hebrew error message from an unknown thrown value.
 * Falls back to a generic message for anything that isn't an ApiClientError.
 */
export function getErrorMessageFromError(err: unknown): string {
  if (err instanceof ApiClientError) {
    return err.code === "NETWORK_ERROR" ? err.message : getErrorMessage(err.code);
  }
  return "אירעה שגיאה, נסה שנית";
}
