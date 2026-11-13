import { z } from "zod";

export const tableSchema = z.object({
  name: z.string().trim().min(1, "Table name is required.").max(100, "Name must be at most 100 characters."),
  orderLimit: z.number({ invalid_type_error: "Enter a whole-number limit." }).int("Use a whole number.").min(1, "Allow at least one order.").max(2_147_483_647),
});
