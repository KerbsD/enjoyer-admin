import { useId } from "react";
import { ChevronDown } from "lucide-react";
import { peso, relativeTime, shopClock } from "@/lib/shop-format";
import { useNow } from "@/lib/use-now";
import type { OrderCardProps } from "@/types/staff";
import { OrderActions } from "./OrderActions";
import { OrderDetails } from "./OrderDetails";
import { useOrderCard } from "./useOrderCard";

const itemPreviewLimit = 4;

export function OrderCard({ order: summary, showItemPreview }: OrderCardProps) {
  const { expanded, detail, order, toggle } = useOrderCard({
    order: summary,
  });
  const now = useNow();
  const detailsId = useId();
  const awaitingConfirmation = order.status === "pending_confirmation";
  const hasNote = order.items.some((item) => item.note.trim());
  const itemLabel = `${order.itemCount} ${order.itemCount === 1 ? "item" : "items"}`;
  const remainingItems = order.items.length - itemPreviewLimit;

  return (
    <article className="order-card">
      <button
        type="button"
        className="order-summary"
        onClick={toggle}
        aria-expanded={expanded}
        aria-controls={detailsId}
      >
        <span className="order-summary-top">
          <strong className="order-title">
            #{order.orderNumber} <span>– {order.tableName}</span>
          </strong>
          <span className="order-age">
            {relativeTime(order.createdAt, now)}
            <ChevronDown size={14} aria-hidden="true" />
          </span>
        </span>
        <span className="order-summary-meta">
          <span>
            {awaitingConfirmation ? "First order" : itemLabel}
            {hasNote ? " – Note" : ""}
          </span>
          {awaitingConfirmation ? (
            <span className="order-placed">
              Placed: {shopClock(order.createdAt)}
            </span>
          ) : (
            <span
              className={`pay-badge ${
                order.paymentStatus === "paid" ? "pay-paid" : "pay-unpaid"
              }`}
            >
              {order.paymentStatus === "paid" ? "Paid" : "Unpaid"}
            </span>
          )}
        </span>
        {order.customerName && (
          <span className="wrap-anywhere text-left text-sm font-semibold">
            For {order.customerName}
          </span>
        )}
      </button>
      {showItemPreview && !expanded && order.items.length > 0 && (
        <div className="order-item-preview">
          <ul className="order-items">
            {order.items.slice(0, itemPreviewLimit).map((item) => (
              <li key={item.id}>
                {item.quantity} × {item.name}
              </li>
            ))}
          </ul>
          {remainingItems > 0 && (
            <p className="order-item-preview-more">+{remainingItems} more</p>
          )}
        </div>
      )}
      {expanded && (
        <div className="order-card-details" id={detailsId}>
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
            className={`payment-line ${
              order.paymentStatus === "unpaid" && order.status === "served"
                ? "unpaid-flag"
                : ""
            }`}
          >
            {order.paymentStatus === "paid"
              ? `Paid · ${order.paymentMethod === "cash" ? "Cash" : "Other"}`
              : "Unpaid"}
            {order.status === "served" && order.paymentStatus === "unpaid"
              ? " · Needs payment"
              : ""}
          </div>
          <OrderDetails
            order={order}
            pending={detail.isPending}
            error={detail.error}
            onRetry={() => void detail.refetch()}
          />
        </div>
      )}
      <OrderActions order={order} detailed={expanded} />
    </article>
  );
}
