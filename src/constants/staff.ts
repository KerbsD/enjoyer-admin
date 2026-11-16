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
  { status: "pending_confirmation", title: "Confirm" },
  { status: "received", title: "Received" },
  { status: "preparing", title: "Preparing" },
  { status: "ready", title: "Ready" },
  { status: "served", title: "Served" },
] as const satisfies readonly { status: OrderStatus; title: string }[];

export type BoardColumn = (typeof boardColumns)[number];

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
