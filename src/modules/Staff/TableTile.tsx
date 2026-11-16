import { peso, statusLabel } from "@/lib/shop-format";
import type { TableTileProps } from "@/types/staff";

export function TableTile({ table: row, onOpen }: TableTileProps) {
  return (
    <button className="table-tile" type="button" onClick={onOpen}>
      <span className="eyebrow">
        TABLE {row.table.id}{" "}
        <span className={`status-tag status-${row.status}`}>
          {statusLabel(row.status)}
        </span>
      </span>
      <strong>{row.table.name}</strong>
      <span>
        {row.ordersUsed} used · {row.ordersRemaining} remaining
      </span>
      <span className={row.unpaidOrderCount ? "unpaid-flag" : ""}>
        {row.unpaidOrderCount} unpaid · {peso(row.unpaidTotal)}
      </span>
      <span className="tile-link">View orders ↗</span>
    </button>
  );
}
