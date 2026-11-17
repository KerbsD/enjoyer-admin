import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { closeTable, getTableOrders } from "@/api/staff";
import { staffKeys } from "@/constants/staff";
import { ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-state";
import type { TablePanelProps } from "@/types/staff";

export function useTablePanel({ table, onBack }: TablePanelProps) {
  const user = useAuthStore((s) => s.user);
  const client = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const [warning, setWarning] = useState("");
  const detail = useQuery({
    queryKey: staffKeys.table(table.table.id),
    queryFn: ({ signal }) => getTableOrders(table.table.id, signal),
  });
  const active = detail.data?.data;
  const unpaidCount =
    active?.summary.unpaidOrderCount ?? table.unpaidOrderCount;
  const unpaidTotal = active?.summary.unpaidTotal ?? table.unpaidTotal;
  const canOverride = user?.role === "manager" || user?.role === "owner";

  const closing = useMutation({
    mutationFn: (override: boolean) => closeTable(table.table.id, override),
    onSuccess: async () => {
      setConfirming(false);
      setWarning("");
      await Promise.all([
        client.invalidateQueries({ queryKey: staffKeys.tables }),
        client.invalidateQueries({ queryKey: staffKeys.orders }),
        client.invalidateQueries({ queryKey: staffKeys.table(table.table.id) }),
      ]);
      toast.success(`${table.table.name} is closed.`);
      onBack();
    },
    onError: async (error) => {
      if (error instanceof ApiError && error.code === "UNPAID_ORDERS_REMAIN") {
        setWarning(
          "The unpaid total changed. Review it before closing. A Manager or Owner must override unpaid orders.",
        );
        await Promise.all([
          client.invalidateQueries({
            queryKey: staffKeys.table(table.table.id),
          }),
          client.invalidateQueries({ queryKey: staffKeys.tables }),
        ]);
      } else {
        toast.error(error.message);
        setConfirming(false);
      }
    },
  });

  return {
    detail,
    active,
    unpaidCount,
    unpaidTotal,
    canOverride,
    confirming,
    warning,
    closing,
    startClose: () => setConfirming(true),
    cancelClose: () => setConfirming(false),
    confirmClose: () => closing.mutate(unpaidCount > 0),
  };
}
