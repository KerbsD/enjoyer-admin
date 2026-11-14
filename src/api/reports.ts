import { attachment, request } from "@/lib/api";
import type { Order, OrderStatus, PaymentStatus } from "@/api/staff";

type Envelope<T> = { success: true; currency: "PHP"; data: T };
export type DashboardPeriod = "today" | "7days" | "30days";
export type DateRange = { from: string; to: string };
export type DashboardParams = { period: DashboardPeriod } | DateRange;
export type DashboardData = {
  range: DateRange & { timezone: string };
  totalOrders: number;
  revenue: string;
  paidOrders: number;
  unpaidOrders: number;
  statusBreakdown: { status: OrderStatus; count: number }[];
  bestSellers: {
    menuItemId: number;
    name: string;
    quantity: number;
    revenue: string;
  }[];
  peakHours: { hour: number; orders: number }[];
};
export type HistoryFilters = Partial<DateRange> & {
  tableId?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  itemId?: number;
  q?: string;
};
export type HistoryParams = HistoryFilters & { limit: number; offset: number };
export type HistoryPage = Envelope<Order[]> & {
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
  range?: DateRange & { timezone: string };
};

export function queryString(
  params: Record<string, string | number | undefined>,
) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params))
    if (value !== undefined && value !== "") query.set(key, String(value));
  return query.toString();
}

export const getDashboard = (params: DashboardParams, signal?: AbortSignal) =>
  request<Envelope<DashboardData>>(`/admin/dashboard?${queryString(params)}`, {
    signal,
  });

export const listHistory = (params: HistoryParams, signal?: AbortSignal) =>
  request<HistoryPage>(
    `/admin/orders?${queryString({ ...params, q: params.q?.trim() || undefined })}`,
    { signal },
  );

export const getHistoricalOrder = (id: string, signal?: AbortSignal) =>
  request<Envelope<Order>>(`/admin/orders/${encodeURIComponent(id)}`, {
    signal,
  });

export const exportOrders = (range: DateRange) =>
  attachment(`/admin/exports/orders.csv?${queryString(range)}`);
