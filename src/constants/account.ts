import { type AccountFilters } from "@/api/accounts";

export const accountKey = ["accounts"] as const;
export const defaultFilters: AccountFilters = {
  sort: "createdAt",
  order: "desc",
};
