import { peso, shopTime, statusLabel } from "@/lib/shop-format";
import type { HistoricalDetailProps } from "@/types/reports";
import { useHistoricalDetail } from "./useHistoricalDetail";

export function HistoricalDetail({ id, onClose }: HistoricalDetailProps) {
  const detail = useHistoricalDetail(id);
  const order = detail.data?.data;

  return (
    <div className="report-detail" aria-label="Historical order details">
      <button className="text-button" type="button" onClick={onClose}>
        Close details
      </button>
      {detail.isPending && <p role="status">Loading order details…</p>}
      {detail.isError && (
        <p role="alert" className="error">
          {detail.error.message}{" "}
          <button className="text-button" onClick={() => void detail.refetch()}>
            Retry
          </button>
        </p>
      )}
      {order && (
        <>
          <h3>
            Order #{order.orderNumber} · {order.tableName}
          </h3>
          <p>
            {statusLabel(order.status)} · {statusLabel(order.paymentStatus)}
            {order.paymentMethod
              ? ` (${statusLabel(order.paymentMethod)})`
              : ""}
          </p>
          <p>
            Placed {shopTime(order.createdAt)} · Updated{" "}
            {shopTime(order.updatedAt)}
          </p>
          {order.confirmedAt && <p>Confirmed {shopTime(order.confirmedAt)}</p>}
          {order.paidAt && <p>Paid {shopTime(order.paidAt)}</p>}
          {order.cancelledAt && (
            <p>
              Cancelled {shopTime(order.cancelledAt)}
              {order.cancelledBy ? ` by ${order.cancelledBy}` : ""}
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
          <ul className="order-items">
            {order.items.map((item) => (
              <li key={item.id}>
                <strong>
                  {item.quantity} × {item.name} · {peso(item.lineTotal)}
                </strong>
                <small>Unit price: {peso(item.unitPrice)}</small>
                {item.options.map((option) => (
                  <small key={option.id}>
                    {option.groupName}: {option.name} ({peso(option.priceDelta)}
                    )
                  </small>
                ))}
                {item.note && <small className="note">Note: {item.note}</small>}
              </li>
            ))}
          </ul>
          <p>
            Subtotal: {peso(order.subtotal)} ·{" "}
            <strong>Total: {peso(order.total)}</strong>
          </p>
        </>
      )}
    </div>
  );
}
