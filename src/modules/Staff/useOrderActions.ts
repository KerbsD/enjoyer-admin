import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  advanceOrder,
  cancelOrder,
  confirmOrder,
  markOrderPaid,
  rejectOrder,
  revertOrder,
} from "@/api/staff";
import { staffKeys } from "@/constants/staff";
import { useAuthStore } from "@/lib/auth-state";
import type {
  OrderAction,
  OrderActionPanelKind,
  PaymentMethod,
} from "@/types/staff";

export function useOrderActions(orderId: string) {
  const role = useAuthStore((s) => s.user?.role);
  const client = useQueryClient();
  const [panel, setPanel] = useState<OrderActionPanelKind | null>(null);
  const [reason, setReason] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("cash");

  const mutation = useMutation({
    mutationFn: ({
      action,
      reason,
      method,
    }: {
      action: OrderAction;
      reason?: string;
      method?: PaymentMethod;
    }) => {
      switch (action) {
        case "confirm":
          return confirmOrder(orderId);
        case "reject":
          return rejectOrder(orderId, reason);
        case "advance":
          return advanceOrder(orderId);
        case "revert":
          return revertOrder(orderId);
        case "cancel":
          return cancelOrder(orderId, reason!);
        case "paid":
          return markOrderPaid(orderId, method!);
      }
    },
    onSuccess: async () => {
      setPanel(null);
      setReason("");
      await Promise.all([
        client.invalidateQueries({ queryKey: staffKeys.orders }),
        client.invalidateQueries({ queryKey: staffKeys.tables }),
        client.invalidateQueries({ queryKey: ["staff", "table"] }),
        client.invalidateQueries({ queryKey: staffKeys.order(orderId) }),
      ]);
      toast.success("Order updated.");
    },
    onError: (error) => {
      toast.error(error.message);
      void client.invalidateQueries({ queryKey: staffKeys.orders });
    },
  });

  const canRevert = !!role && role !== "staff";

  const submit = (action: OrderAction) =>
    mutation.mutate({ action, reason: reason.trim(), method });

  const submitPanel = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!panel) return;
    if (panel === "cancel" && !reason.trim()) return;
    submit(panel);
  };

  const closePanel = () => {
    setPanel(null);
    setReason("");
  };

  return {
    canRevert,
    panel,
    setPanel,
    reason,
    setReason,
    method,
    setMethod,
    mutation,
    submit,
    submitPanel,
    closePanel,
  };
}
