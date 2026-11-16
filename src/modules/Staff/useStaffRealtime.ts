"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { API_URL, clearSession, restoreSession } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-state";
import { watchRealtime } from "@/lib/realtime";
import type { Order } from "@/api/staff";
import { staffKeys } from "@/constants/staff";
import type { StaffTransport } from "@/types/staff";

export function useStaffRealtime(onNewOrders?: (orders: Order[]) => void) {
  const token = useAuthStore((s) => s.accessToken);
  const client = useQueryClient();
  const [transport, setTransport] = useState<StaffTransport>("connecting");
  useEffect(() => {
    if (!token) return;
    const watcher = watchRealtime({
      url: `${API_URL}/staff/realtime`,
      headers: () => ({ Authorization: `Bearer ${token}` }),
      async onChange(_state, changed, sync) {
        if (changed.includes("orders") || changed.includes("tables")) {
          const before = client.getQueryData<Order[]>(staffKeys.orders);
          await Promise.all([
            client.invalidateQueries(
              { queryKey: staffKeys.orders },
              { throwOnError: true },
            ),
            client.invalidateQueries(
              { queryKey: staffKeys.tables },
              { throwOnError: true },
            ),
            client.invalidateQueries(
              { queryKey: ["staff", "order"] },
              { throwOnError: true },
            ),
            client.invalidateQueries(
              { queryKey: ["staff", "table"] },
              { throwOnError: true },
            ),
            ...(changed.includes("tables")
              ? [
                  client.invalidateQueries(
                    { queryKey: staffKeys.managedTables },
                    { throwOnError: true },
                  ),
                ]
              : []),
          ]);
          const after = client.getQueryData<Order[]>(staffKeys.orders);
          if (!sync && before && after && onNewOrders) {
            const known = new Set(before.map((order) => order.id));
            const added = after.filter(
              (order) =>
                !known.has(order.id) &&
                (order.status === "pending_confirmation" ||
                  order.status === "received"),
            );
            if (added.length) onNewOrders(added);
          }
        }
        if (changed.includes("menu"))
          await client.invalidateQueries(
            { queryKey: staffKeys.menu },
            { throwOnError: true },
          );
        if (changed.includes("store"))
          await client.invalidateQueries(
            { queryKey: staffKeys.settings },
            { throwOnError: true },
          );
        if (changed.includes("orders"))
          await client.invalidateQueries(
            { queryKey: staffKeys.reports },
            { throwOnError: true },
          );
        else if (changed.includes("store"))
          await client.invalidateQueries(
            { queryKey: ["reports", "dashboard"] },
            { throwOnError: true },
          );
      },
      onTransport: setTransport,
      onAccessEnded(failure) {
        setTransport("ended");
        if (failure.status === 401) void restoreSession();
        else clearSession();
      },
    });
    return () => watcher.stop();
  }, [token, client, onNewOrders]);
  return transport;
}
