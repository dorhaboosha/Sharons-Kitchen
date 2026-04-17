/**
 * Normalizes a dish name for storage and comparison:
 * - trims leading/trailing whitespace
 * - collapses multiple consecutive spaces into a single space
 *
 * Must be applied on both frontend (before submission) and backend
 * (before persistence and uniqueness checks).
 *
 * @example
 * normalizeName("  קובה   סלק  ") // → "קובה סלק"
 */
export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}
