import { z } from "zod";

export const accountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(100, "Name must be 100 characters or fewer."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .max(254, "Email must be 254 characters or fewer.")
    .email("Enter a valid email address."),
  role: z.enum(["staff", "manager", "owner"]),
});
export const accountEditSchema = accountSchema.pick({ name: true, role: true });
export const accountSearchSchema = z
  .string()
  .trim()
  .max(100, "Search must be 100 characters or fewer.");
