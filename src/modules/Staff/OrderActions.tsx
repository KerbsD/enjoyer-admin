import { statusLabel } from "@/lib/shop-format";
import { nextOrderStatus, previousOrderStatus } from "@/constants/staff";
import type { OrderActionsProps } from "@/types/staff";
import { OrderActionPanel } from "./OrderActionPanel";
import { useOrderActions } from "./useOrderActions";

export function OrderActions({ order }: OrderActionsProps) {
  const {
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
  } = useOrderActions(order.id);

  return (
    <div className="order-actions">
      <div className="action-row">
        {order.status === "pending_confirmation" && (
          <>
            <button
              className="button"
              disabled={mutation.isPending}
              onClick={() => submit("confirm")}
            >
              Confirm order
            </button>
            <button
              className="button button-outline"
              disabled={mutation.isPending}
              onClick={() => setPanel("reject")}
            >
              Reject
            </button>
          </>
        )}
        {nextOrderStatus[order.status] && (
          <button
            className="button"
            disabled={mutation.isPending}
            onClick={() => submit("advance")}
          >
            Move to {statusLabel(nextOrderStatus[order.status]!)}
          </button>
        )}
        {canRevert && previousOrderStatus[order.status] && (
          <button
            className="button button-outline"
            disabled={mutation.isPending}
            onClick={() => submit("revert")}
          >
            Back to {statusLabel(previousOrderStatus[order.status]!)}
          </button>
        )}
        {order.status === "served" && order.paymentStatus === "unpaid" && (
          <button
            className="button"
            disabled={mutation.isPending}
            onClick={() => setPanel("paid")}
          >
            Mark paid
          </button>
        )}
        {order.status !== "cancelled" && order.status !== "rejected" && (
          <button
            className="button button-danger"
            disabled={mutation.isPending}
            onClick={() => setPanel("cancel")}
          >
            Cancel order
          </button>
        )}
      </div>
      {panel && (
        <OrderActionPanel
          panel={panel}
          reason={reason}
          method={method}
          pending={mutation.isPending}
          onReasonChange={setReason}
          onMethodChange={setMethod}
          onSubmit={submitPanel}
          onClose={closePanel}
        />
      )}
    </div>
  );
}
