import { z } from "zod";
import type { DateRange } from "@/api/reports";
import { calendarDate } from "@/modules/Settings/schemas";

export const historySearchSchema = z
  .string()
  .trim()
  .max(100, "Search must be 100 characters or fewer.");

export function rangeError(
  from: string,
  to: string,
  required = false,
): string | null {
  if (!from && !to) return required ? "Select both dates." : null;
  if (!from || !to) return "Enter both start and end dates.";
  if (
    !calendarDate.safeParse(from).success ||
    !calendarDate.safeParse(to).success
  )
    return "Use real dates in YYYY-MM-DD format.";
  if (from > to) return "End date must be on or after start date.";
  return null;
}

export const rangeOf = (from: string, to: string): DateRange => ({ from, to });
