import { z } from "zod";

export const timingsSchema = z.object({
  idleTimeoutMinutes: z.number({ invalid_type_error: "Enter an idle timeout." }).int("Use a whole number.").min(1).max(1_440),
  confirmationExpiryMinutes: z.number({ invalid_type_error: "Enter a confirmation expiry." }).int("Use a whole number.").min(1).max(120),
});

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour HH:mm time.");
export const daySchema = z.discriminatedUnion("closed", [
  z.object({ closed: z.literal(true) }),
  z.object({ closed: z.literal(false), openTime: time, closeTime: time }),
]).refine((v) => v.closed || v.closeTime > v.openTime, { path: ["closeTime"], message: "Closing time must be later than opening time. Overnight hours are not supported." });

export const calendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}, "Enter a real date (YYYY-MM-DD).");
