import { useEffect, useRef, useState } from "react";

export type FlashDirection = "up" | "down" | null;

/**
 * Tracks whether a numeric value just increased or decreased, returning the
 * direction for `durationMs` before resetting to null. Used to flash a price
 * green/red on tick updates, like most broker apps. Does not flash on the
 * initial value (only on subsequent changes).
 */
export function usePriceFlash(value: number | undefined, durationMs = 700): FlashDirection {
  const previousRef = useRef<number | undefined>(undefined);
  const [flash, setFlash] = useState<FlashDirection>(null);

  useEffect(() => {
    if (value === undefined) return;
    const previous = previousRef.current;
    previousRef.current = value;

    if (previous === undefined || value === previous) return;

    setFlash(value > previous ? "up" : "down");
    const timeout = setTimeout(() => setFlash(null), durationMs);
    return () => clearTimeout(timeout);
  }, [value, durationMs]);

  return flash;
}

export const priceFlashClass = (flash: FlashDirection): string => {
  if (flash === "up") return "bg-emerald-500/25 text-emerald-500";
  if (flash === "down") return "bg-red-500/25 text-red-500";
  return "bg-transparent";
};
