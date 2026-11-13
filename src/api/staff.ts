import { request } from "@/lib/api";

export type OrderStatus =
  | "pending_confirmation"
  | "received"
  | "preparing"
  | "ready"
  | "served"
  | "cancelled"
  | "rejected";
export type PaymentStatus = "unpaid" | "paid";
export type Order = {
  id: string;
  orderNumber: string;
  tableId: number;
  tableName: string;
  tableSessionId: string;
  status: OrderStatus;
  subtotal: string;
  total: string;
  paymentStatus: PaymentStatus;
  paymentMethod: "cash" | "other" | null;
  paidAt: string | null;
  confirmedAt: string | null;
  cancellationReason: string | null;
  cancelledAt: string | null;
  cancelledBy: "customer" | "staff" | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
  items: {
    id: number;
    menuItemId: number;
    name: string;
    unitPrice: string;
    quantity: number;
    note: string;
    lineTotal: string;
    options: {
      id: number;
      name: string;
      groupName: string;
      priceDelta: string;
    }[];
  }[];
};
type Envelope<T> = { success: true; currency?: "PHP"; data: T };
type Pagination = {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
};
export type TableOverview = {
  table: { id: number; name: string };
  status: "free" | "pending" | "open";
  session: {
    id: string;
    status: "pending" | "open";
    createdAt: string;
    startedAt: string | null;
    lastActivityAt: string;
  } | null;
  ordersUsed: number;
  ordersRemaining: number;
  unpaidOrderCount: number;
  unpaidTotal: string;
};
export type TableDetail = {
  session: TableOverview["session"];
  orders: Order[];
  summary: {
    ordersUsed: number;
    ordersRemaining: number;
    total: string;
    unpaidOrderCount: number;
    unpaidTotal: string;
  };
};

const encode = (id: string | number) => encodeURIComponent(String(id));

export async function listOrders(
  status: OrderStatus,
  offset: number,
  paymentStatus?: PaymentStatus,
  signal?: AbortSignal,
) {
  const query = new URLSearchParams({
    status,
    offset: String(offset),
    limit: "100",
  });
  if (paymentStatus) query.set("paymentStatus", paymentStatus);
  return request<Envelope<Order[]> & { pagination: Pagination }>(
    `/staff/orders?${query}`,
    { signal },
  );
}

// The API sorts oldest-first and caps each request at 100; retrieve every page
// so new orders are not hidden behind a full first page of existing orders.
export async function listAllOrders(
  status: OrderStatus,
  paymentStatus?: PaymentStatus,
  signal?: AbortSignal,
) {
  const result: Order[] = [];
  let offset = 0;
  do {
    const page = await listOrders(status, offset, paymentStatus, signal);
    result.push(...page.data);
    if (!page.pagination.hasMore) return result;
    if (!page.data.length) throw new Error("Order pagination did not advance.");
    offset += page.data.length;
  } while (true);
}

export const getOrder = (id: string, signal?: AbortSignal) =>
  request<Envelope<Order>>(`/staff/orders/${encode(id)}`, { signal });
export const confirmOrder = (id: string) =>
  request<Envelope<Order>>(`/staff/orders/${encode(id)}/confirm`, {
    method: "POST",
  });
export const rejectOrder = (id: string, reason?: string) =>
  request<Envelope<Order>>(`/staff/orders/${encode(id)}/reject`, {
    method: "POST",
    body: reason ? { reason } : {},
  });
export const advanceOrder = (id: string) =>
  request<Envelope<Order>>(`/staff/orders/${encode(id)}/advance`, {
    method: "POST",
  });
export const revertOrder = (id: string) =>
  request<Envelope<Order>>(`/staff/orders/${encode(id)}/revert`, {
    method: "POST",
  });
export const cancelOrder = (id: string, reason: string) =>
  request<Envelope<Order>>(`/staff/orders/${encode(id)}/cancel`, {
    method: "POST",
    body: { reason },
  });
export const markOrderPaid = (id: string, method: "cash" | "other") =>
  request<Envelope<Order>>(`/staff/orders/${encode(id)}/paid`, {
    method: "POST",
    body: { method },
  });
export const listTableOverview = (signal?: AbortSignal) =>
  request<Envelope<TableOverview[]>>("/staff/tables/overview", { signal });
export const getTableOrders = (id: number, signal?: AbortSignal) =>
  request<Envelope<TableDetail>>(`/staff/tables/${encode(id)}/orders`, {
    signal,
  });
export const closeTable = (id: number, overrideUnpaid = false) =>
  request<Envelope<{ tableId: number; sessionId: string; closedAt: string }>>(
    `/staff/tables/${encode(id)}/close`,
    { method: "POST", body: { overrideUnpaid } },
  );
