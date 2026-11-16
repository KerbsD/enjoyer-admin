import { peso, shopTime, statusLabel } from "@/lib/shop-format";
import type { HistoryRowProps } from "@/types/reports";
import { HistoricalDetail } from "./HistoricalDetail";

export function HistoryRow({
  order,
  expanded,
  onToggle,
  onCloseDetail,
}: HistoryRowProps) {
  return (
    <article className="report-history-row">
      <div>
        <strong>
          #{order.orderNumber} · {order.tableName}
        </strong>
        <span>
          {shopTime(order.createdAt)} · {statusLabel(order.status)} ·{" "}
          {statusLabel(order.paymentStatus)}
        </span>
      </div>
      <strong>{peso(order.total)}</strong>
      <button
        type="button"
        className="button button-outline"
        aria-expanded={expanded}
        onClick={onToggle}
      >
        {expanded ? "Hide details" : "Details"}
      </button>
      {expanded && <HistoricalDetail id={order.id} onClose={onCloseDetail} />}
    </article>
  );
}
