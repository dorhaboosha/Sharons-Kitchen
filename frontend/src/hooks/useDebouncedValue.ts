import { useEffect, useState } from "react";

/**
 * Returns `value` delayed by `delayMs`. Each change resets the timer, so a
 * fast-changing input (e.g. a search box) settles to one value before it is
 * used to trigger work like a network request.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
