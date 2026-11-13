import { z } from "zod";

export const position = z.number({ invalid_type_error: "Enter a whole-number position." }).int().min(0).max(2_147_483_647);
export const name = z.string().trim().min(1, "Name is required.").max(100);
export const money = z.string().trim().regex(/^(?:0|[1-9]\d{0,7})(?:\.\d{1,2})?$/, "Use PHP with at most two decimal places.").transform((v) => {
  const [whole, cents = ""] = v.split(".");
  return `${whole}.${cents.padEnd(2, "0")}`;
});
export const categorySchema = z.object({ name, sortOrder: position });
export const itemSchema = z.object({ categoryId: z.number().int().positive(), name, description: z.string().trim().max(2000), price: money, isSpicy: z.boolean(), isAvailable: z.boolean(), isHidden: z.boolean(), sortOrder: position });
export const groupSchema = z.object({ name, minSelections: z.number().int().min(0).max(50), maxSelections: z.number().int().min(1).max(50), sortOrder: position }).refine((v) => v.minSelections <= v.maxSelections, { path: ["maxSelections"], message: "Maximum must be at least minimum." });
export const optionSchema = z.object({ name, priceDelta: money, isAvailable: z.boolean(), sortOrder: position });
