import type { OrderDetailsProps } from "@/types/staff";

export function OrderDetails({
  order,
  pending,
  error,
  onRetry,
}: OrderDetailsProps) {
  return (
    <div className="detail-panel">
      {pending && <p role="status">Refreshing order details…</p>}
      {error && (
        <p className="error" role="alert">
          {error.message}{" "}
          <button type="button" className="text-button" onClick={onRetry}>
            Retry
          </button>
        </p>
      )}
      {order.cancellationReason && (
        <p>Cancellation reason: {order.cancellationReason}</p>
      )}
      {order.rejectionReason && (
        <p>Rejection reason: {order.rejectionReason}</p>
      )}
      <p>
        Table session: <code>{order.tableSessionId}</code>
      </p>
    </div>
  );
}
