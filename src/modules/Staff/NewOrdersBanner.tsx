import type { NewOrdersBannerProps } from "@/types/staff";

export function NewOrdersBanner({ orders, onDismiss }: NewOrdersBannerProps) {
  return (
    <div className="new-orders-banner" role="alert">
      <strong>
        {orders.length} new {orders.length === 1 ? "order" : "orders"}
      </strong>{" "}
      ·{" "}
      {orders
        .map((order) => `#${order.orderNumber} (${order.tableName})`)
        .join(", ")}
      <button type="button" className="text-button" onClick={onDismiss}>
        Dismiss
      </button>
    </div>
  );
}
