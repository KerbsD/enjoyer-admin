import { peso } from "@/lib/shop-format";
import type { TableSummaryProps } from "@/types/staff";

export function TableSummary({
  summary,
  unpaidCount,
  unpaidTotal,
}: TableSummaryProps) {
  return (
    <div className="table-summary">
      <div>
        <span className="eyebrow">ORDERS USED</span>
        <strong>{summary.ordersUsed}</strong>
      </div>
      <div>
        <span className="eyebrow">REMAINING</span>
        <strong>{summary.ordersRemaining}</strong>
      </div>
      <div>
        <span className="eyebrow">TABLE TOTAL</span>
        <strong>{peso(summary.total)}</strong>
      </div>
      <div className={unpaidCount ? "unpaid-flag" : ""}>
        <span className="eyebrow">UNPAID · {unpaidCount}</span>
        <strong>{peso(unpaidTotal)}</strong>
      </div>
    </div>
  );
}
