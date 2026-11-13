"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Order } from "@/api/staff";
import { advanceOrder, cancelOrder, confirmOrder, markOrderPaid, rejectOrder, revertOrder } from "@/api/staff";
import { useAuthStore } from "@/lib/auth-state";
import { statusLabel } from "@/lib/shop-format";
import { staffKeys } from "./useStaffRealtime";

const next: Partial<Record<Order["status"], Order["status"]>> = {
  received: "preparing", preparing: "ready", ready: "served",
};
const previous: Partial<Record<Order["status"], Order["status"]>> = {
  preparing: "received", ready: "preparing", served: "ready",
};
type Action = "confirm" | "reject" | "advance" | "revert" | "cancel" | "paid";

export function OrderActions({ order }: { order: Order }) {
  const role = useAuthStore((s) => s.user?.role);
  const client = useQueryClient();
  const [panel, setPanel] = useState<"cancel" | "reject" | "paid" | null>(null);
  const [reason, setReason] = useState("");
  const [method, setMethod] = useState<"cash" | "other">("cash");
  const mutation = useMutation({
    mutationFn: ({ action, reason, method }: { action: Action; reason?: string; method?: "cash" | "other" }) => {
      switch (action) {
        case "confirm": return confirmOrder(order.id);
        case "reject": return rejectOrder(order.id, reason);
        case "advance": return advanceOrder(order.id);
        case "revert": return revertOrder(order.id);
        case "cancel": return cancelOrder(order.id, reason!);
        case "paid": return markOrderPaid(order.id, method!);
      }
    },
    onSuccess: async () => {
      setPanel(null); setReason("");
      await Promise.all([
        client.invalidateQueries({ queryKey: staffKeys.orders }),
        client.invalidateQueries({ queryKey: staffKeys.tables }),
        client.invalidateQueries({ queryKey: ["staff", "table"] }),
        client.invalidateQueries({ queryKey: staffKeys.order(order.id) }),
      ]);
      toast.success("Order updated.");
    },
    onError: (error) => { toast.error(error.message); void client.invalidateQueries({ queryKey: staffKeys.orders }); },
  });
  const submit = (action: Action) => mutation.mutate({ action, reason: reason.trim(), method });
  return <div className="order-actions">
    <div className="action-row">
      {order.status === "pending_confirmation" && <><button className="button" disabled={mutation.isPending} onClick={() => submit("confirm")}>Confirm order</button><button className="button button-outline" disabled={mutation.isPending} onClick={() => setPanel("reject")}>Reject</button></>}
      {next[order.status] && <button className="button" disabled={mutation.isPending} onClick={() => submit("advance")}>Move to {statusLabel(next[order.status]!)}</button>}
      {role && role !== "staff" && previous[order.status] && <button className="button button-outline" disabled={mutation.isPending} onClick={() => submit("revert")}>Back to {statusLabel(previous[order.status]!)}</button>}
      {order.status === "served" && order.paymentStatus === "unpaid" && <button className="button" disabled={mutation.isPending} onClick={() => setPanel("paid")}>Mark paid</button>}
      {order.status !== "cancelled" && order.status !== "rejected" && <button className="button button-danger" disabled={mutation.isPending} onClick={() => setPanel("cancel")}>Cancel order</button>}
    </div>
    {panel && <form className="action-panel" onSubmit={(event) => { event.preventDefault(); if (panel === "cancel" && !reason.trim()) return; submit(panel); }}>
      {panel === "paid" ? <label className="field"><span className="eyebrow">Payment method</span><select value={method} onChange={(event) => setMethod(event.target.value as "cash" | "other")}><option value="cash">Cash</option><option value="other">Other</option></select></label>
        : <label className="field"><span className="eyebrow">{panel === "cancel" ? "Reason (required)" : "Reason (optional)"}</span><textarea value={reason} maxLength={500} required={panel === "cancel"} onChange={(event) => setReason(event.target.value)} rows={3} /></label>}
      <div className="action-row"><button className="button" disabled={mutation.isPending || panel === "cancel" && !reason.trim()} type="submit">{mutation.isPending ? "Saving…" : panel === "paid" ? "Record payment" : panel === "reject" ? "Reject first order" : "Confirm cancellation"}</button>
        <button type="button" className="button button-outline" onClick={() => { setPanel(null); setReason(""); }}>Keep order</button></div>
    </form>}
  </div>;
}
