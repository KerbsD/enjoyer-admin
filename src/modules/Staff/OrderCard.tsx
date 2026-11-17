import { peso, shopTime, statusLabel } from "@/lib/shop-format";
import type { OrderCardProps } from "@/types/staff";
import { OrderActions } from "./OrderActions";
import { OrderDetails } from "./OrderDetails";
import { useOrderCard } from "./useOrderCard";

export function OrderCard({ order: summary }: OrderCardProps) {
  const { expanded, detail, order, toggle } = useOrderCard({
    order: summary,
  });

  return (
    <article className="order-card">
      <div className="card-head">
        <span className="eyebrow">#{order.orderNumber}</span>
        <span className={`status-tag status-${order.status}`}>
          {statusLabel(order.status)}
        </span>
      </div>
      <h3>{order.tableName}</h3>
      <p className="order-time">
        {shopTime(order.createdAt)} · {order.itemCount} items
      </p>
      <ul className="order-items">
        {order.items.map((item) => (
          <li key={item.id}>
            <strong>
              {item.quantity} × {item.name}
            </strong>
            {item.options.length > 0 && (
              <small>
                {item.options
                  .map((option) => `${option.groupName}: ${option.name}`)
                  .join(" · ")}
              </small>
            )}
            {item.note && <small className="note">Note: {item.note}</small>}
          </li>
        ))}
      </ul>
      <div className="card-total">
        <span>Total</span>
        <strong>{peso(order.total)}</strong>
      </div>
      <div
        className={`payment-line ${order.paymentStatus === "unpaid" && order.status === "served" ? "unpaid-flag" : ""}`}
      >
        {order.paymentStatus === "paid"
          ? `Paid · ${statusLabel(order.paymentMethod || "")}`
          : "Unpaid"}
        {order.status === "served" && order.paymentStatus === "unpaid"
          ? " · Needs payment"
          : ""}
      </div>
      <button
        className="text-button"
        type="button"
        onClick={toggle}
        aria-expanded={expanded}
      >
        {expanded ? "Hide details" : "Full order details"}
      </button>
      {expanded && (
        <OrderDetails
          order={order}
          pending={detail.isPending}
          error={detail.error}
          onRetry={() => void detail.refetch()}
        />
      )}
      <OrderActions order={order} />
    </article>
  );
}
