import { statusLabel } from "@/lib/shop-format";
import {
  advanceActionLabel,
  nextOrderStatus,
  previousOrderStatus,
} from "@/constants/staff";
import type { OrderActionsProps } from "@/types/staff";
import { OrderActionPanel } from "./OrderActionPanel";
import { useOrderActions } from "./useOrderActions";

export function OrderActions({ order, detailed = false }: OrderActionsProps) {
  const {
    canRevert,
    panel,
    openPanel,
    reason,
    setReason,
    method,
    setMethod,
    mutation,
    submit,
    submitPanel,
    closePanel,
  } = useOrderActions(order.id);
  const next = nextOrderStatus[order.status];
  const previous = previousOrderStatus[order.status];
  const canCancel = order.status !== "cancelled" && order.status !== "rejected";

  return (
    <div className="order-actions">
      <div className="action-row action-row-primary">
        {order.status === "pending_confirmation" && (
          <>
            <button
              className="button"
              disabled={mutation.isPending}
              onClick={() => submit("confirm")}
            >
              Confirm
            </button>
            <button
              className="button button-outline"
              disabled={mutation.isPending}
              onClick={() => openPanel("reject")}
            >
              Reject
            </button>
          </>
        )}
        {next && (
          <button
            className="button"
            disabled={mutation.isPending}
            onClick={() => submit("advance")}
          >
            {advanceActionLabel[order.status] ?? `Move to ${statusLabel(next)}`}
          </button>
        )}
        {order.status === "served" && order.paymentStatus === "unpaid" && (
          <button
            className="button"
            aria-haspopup="dialog"
            disabled={mutation.isPending}
            onClick={() => openPanel("paid")}
          >
            Mark paid
          </button>
        )}
      </div>
      {detailed && (canRevert || canCancel) && (
        <div className="action-row action-row-secondary">
          {canRevert && previous && (
            <button
              type="button"
              className="text-button order-secondary-link"
              disabled={mutation.isPending}
              onClick={() => submit("revert")}
            >
              Back to {statusLabel(previous)}
            </button>
          )}
          {canCancel && (
            <button
              type="button"
              className="text-button order-secondary-link danger"
              aria-haspopup="dialog"
              disabled={mutation.isPending}
              onClick={() => openPanel("cancel")}
            >
              Cancel order
            </button>
          )}
        </div>
      )}
      {panel && (
        <OrderActionPanel
          panel={panel}
          orderNumber={order.orderNumber}
          reason={reason}
          method={method}
          pending={mutation.isPending}
          error={mutation.error?.message}
          onReasonChange={setReason}
          onMethodChange={setMethod}
          onSubmit={submitPanel}
          onClose={closePanel}
        />
      )}
    </div>
  );
}
