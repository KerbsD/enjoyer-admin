import { shopTime, statusLabel } from "@/lib/shop-format";
import type { TablePanelProps } from "@/types/staff";
import { OrderCard } from "./OrderCard";
import { TableClosePanel } from "./TableClosePanel";
import { TableSummary } from "./TableSummary";
import { useTablePanel } from "./useTablePanel";

export function TablePanel({ table, onBack }: TablePanelProps) {
  const {
    detail,
    active,
    unpaidCount,
    unpaidTotal,
    canOverride,
    confirming,
    warning,
    closing,
    startClose,
    cancelClose,
    confirmClose,
  } = useTablePanel({ table, onBack });

  return (
    <div className="table-detail">
      <button className="text-button" type="button" onClick={onBack}>
        ← All tables
      </button>
      <div className="page-head">
        <span className="eyebrow">TABLE / {statusLabel(table.status)}</span>
        <h1>
          {table.table.name}
          <span className="brand-dot">.</span>
        </h1>
        <p>
          {active?.session
            ? `Session started ${shopTime(active.session.startedAt || active.session.createdAt)}`
            : "No open session"}
        </p>
      </div>
      {detail.isPending && <p role="status">Loading table orders…</p>}
      {detail.isError && (
        <div className="feature-note error" role="alert">
          {detail.error.message}{" "}
          <button className="text-button" onClick={() => void detail.refetch()}>
            Retry
          </button>
        </div>
      )}
      {active && (
        <>
          <TableSummary
            summary={active.summary}
            unpaidCount={unpaidCount}
            unpaidTotal={unpaidTotal}
          />
          {active.session && (
            <TableClosePanel
              unpaidCount={unpaidCount}
              unpaidTotal={unpaidTotal}
              canOverride={canOverride}
              confirming={confirming}
              warning={warning}
              pending={closing.isPending}
              onStart={startClose}
              onCancel={cancelClose}
              onConfirm={confirmClose}
            />
          )}
          <h2>Current session orders</h2>
          <div className="table-order-grid">
            {active.orders.length ? (
              active.orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))
            ) : (
              <p>No orders yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
