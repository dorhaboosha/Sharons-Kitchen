/**
 * Prices are stored and sent as an integer number of agorot (1/100 shekel),
 * so arithmetic stays exact. Convert at the edges: for display, and for
 * form input where a person types shekels.
 */

/** 4000 -> 40 */
export function agorotToShekels(agorot: number): number {
  return agorot / 100;
}

/** 40 -> 4000, 12.9 -> 1290, 12.999 -> 1300 (rounded to the nearest agora) */
export function shekelsToAgorot(shekels: number): number {
  return Math.round(shekels * 100);
}

/** 4000 -> "₪40.00" */
export function formatShekels(agorot: number): string {
  return `₪${(agorot / 100).toFixed(2)}`;
}
