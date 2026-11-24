import { request } from "@/lib/api";
import type {
  OrderingNetwork,
  OrderingNetworkChange,
} from "@/types/orderingNetwork";

const path = "/admin/ordering-network";
type Result = { success: true; data: OrderingNetwork };

export const getOrderingNetwork = () => request<Result>(path);
export const setOrderingNetwork = (body: OrderingNetworkChange) =>
  request<Result>(path, { method: "PATCH", body });
export const enrollOrderingTerminal = (expectedAddress: string) =>
  request<Result>(`${path}/terminal`, {
    method: "POST",
    body: { expectedAddress },
  });
export const revokeOrderingTerminal = () =>
  request<Result>(`${path}/terminal`, { method: "DELETE" });
export const syncOrderingTerminal = (signal: AbortSignal) =>
  request<{ success: true; data: { enrolled: boolean; changed: boolean } }>(
    `${path}/sync`,
    { method: "POST", signal },
  );
