import type { DashboardParams, HistoryFilters } from "@/api/reports";
import type { OrderStatus } from "@/api/staff";
import { staffKeys } from "@/constants/staff";
import type { HistoryDraft } from "@/types/reports";

export const reportStatuses: OrderStatus[] = [
  "pending_confirmation",
  "received",
  "preparing",
  "ready",
  "served",
  "cancelled",
  "rejected",
];

export const historyPageSize = 25;

export const reportKeys = {
  dashboard: (params: DashboardParams) =>
    [...staffKeys.reports, "dashboard", params] as const,
  history: (filters: HistoryFilters, offset: number) =>
    [...staffKeys.reports, "history", filters, offset] as const,
  order: (id: string) => [...staffKeys.reports, "order", id] as const,
};

export const blankHistoryDraft: HistoryDraft = {
  from: "",
  to: "",
  tableId: "",
  itemId: "",
  status: "",
  paymentStatus: "",
  q: "",
};
