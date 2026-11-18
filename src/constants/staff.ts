import type { OrderStatus } from "@/api/staff";

export const staffKeys = {
  orders: ["staff", "orders"] as const,
  order: (id: string) => ["staff", "order", id] as const,
  tables: ["staff", "tables"] as const,
  table: (id: number) => ["staff", "table", id] as const,
  menu: ["menu"] as const,
  managedTables: ["tables", "manage"] as const,
  settings: ["settings"] as const,
  reports: ["reports"] as const,
};

export const boardColumns = [
  { status: "pending_confirmation", title: "Pending" },
  { status: "received", title: "Received" },
  { status: "preparing", title: "Preparing" },
  { status: "ready", title: "Ready" },
] as const satisfies readonly { status: OrderStatus; title: string }[];

export type BoardColumn = (typeof boardColumns)[number];

// Served orders leave the working columns but remain loaded for the footer
// summary, where staff can still mark them paid or review them.
export const boardFetchStatuses = [
  "pending_confirmation",
  "received",
  "preparing",
  "ready",
  "served",
] as const satisfies readonly OrderStatus[];

export const advanceActionLabel: Partial<Record<OrderStatus, string>> = {
  received: "Start preparing",
  preparing: "Mark ready",
  ready: "Mark served",
};

export const nextOrderStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  received: "preparing",
  preparing: "ready",
  ready: "served",
};

export const previousOrderStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  preparing: "received",
  ready: "preparing",
  served: "ready",
};
