import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email."),
  pwd: z.string().min(1, "Enter your password."),
});
export const emailSchema = z.object({
  email: z.string().trim().email("Enter a valid email."),
});
export const passwordSchema = z.object({
  newPwd: z
    .string()
    .min(12, "Use at least 12 characters.")
    .max(128)
    .refine(
      (value) => new TextEncoder().encode(value).length <= 72,
      "Use at most 72 UTF-8 bytes.",
    ),
});
