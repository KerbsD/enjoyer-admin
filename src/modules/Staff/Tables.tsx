"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { closeTable, getTableOrders, listTableOverview, type TableOverview } from "@/api/staff";
import { ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-state";
import { peso, shopTime, statusLabel } from "@/lib/shop-format";
import { OrderCard } from "./OrderCard";
import { staffKeys, useStaffRealtime } from "./useStaffRealtime";

function TablePanel({ table, onBack }: { table: TableOverview; onBack: () => void }) {
  const user = useAuthStore((s) => s.user);
  const client = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const [warning, setWarning] = useState("");
  const detail = useQuery({ queryKey: staffKeys.table(table.table.id), queryFn: ({ signal }) => getTableOrders(table.table.id, signal) });
  const active = detail.data?.data;
  const unpaidCount = active?.summary.unpaidOrderCount ?? table.unpaidOrderCount;
  const unpaidTotal = active?.summary.unpaidTotal ?? table.unpaidTotal;
  const canOverride = user?.role === "manager" || user?.role === "owner";
  const closing = useMutation({
    mutationFn: (override: boolean) => closeTable(table.table.id, override),
    onSuccess: async () => {
      setConfirming(false); setWarning("");
      await Promise.all([
        client.invalidateQueries({ queryKey: staffKeys.tables }),
        client.invalidateQueries({ queryKey: staffKeys.orders }),
        client.invalidateQueries({ queryKey: staffKeys.table(table.table.id) }),
      ]);
      toast.success(`${table.table.name} is closed.`);
      onBack();
    },
    onError: async (error) => {
      if (error instanceof ApiError && error.code === "UNPAID_ORDERS_REMAIN") {
        setWarning("The unpaid total changed. Review it before closing. A Manager or Owner must override unpaid orders.");
        await Promise.all([client.invalidateQueries({ queryKey: staffKeys.table(table.table.id) }), client.invalidateQueries({ queryKey: staffKeys.tables })]);
      } else { toast.error(error.message); setConfirming(false); }
    },
  });
  return <div className="table-detail"><button className="text-button" type="button" onClick={onBack}>← All tables</button>
    <div className="page-head"><span className="eyebrow">TABLE / {statusLabel(table.status)}</span><h1>{table.table.name}<span className="brand-dot">.</span></h1>
      <p>{active?.session ? `Session started ${shopTime(active.session.startedAt || active.session.createdAt)}` : "No open session"}</p></div>
    {detail.isPending && <p role="status">Loading table orders…</p>}
    {detail.isError && <div className="feature-note error" role="alert">{detail.error.message} <button className="text-button" onClick={() => void detail.refetch()}>Retry</button></div>}
    {active && <><div className="table-summary"><div><span className="eyebrow">ORDERS USED</span><strong>{active.summary.ordersUsed}</strong></div><div><span className="eyebrow">REMAINING</span><strong>{active.summary.ordersRemaining}</strong></div><div><span className="eyebrow">TABLE TOTAL</span><strong>{peso(active.summary.total)}</strong></div><div className={unpaidCount ? "unpaid-flag" : ""}><span className="eyebrow">UNPAID · {unpaidCount}</span><strong>{peso(unpaidTotal)}</strong></div></div>
      {active.session && <div className="close-section">{unpaidCount > 0 && <p className="error"><strong>{unpaidCount} unpaid {unpaidCount === 1 ? "order" : "orders"} · {peso(unpaidTotal)}.</strong> Only a Manager or Owner may override this warning.</p>}
        {warning && <p role="alert" className="error">{warning}</p>}
        {!confirming ? <button className="button button-outline" type="button" disabled={unpaidCount > 0 && !canOverride} onClick={() => setConfirming(true)}>Close table</button>
          : <div className="action-panel"><p>{unpaidCount > 0 ? `Override ${peso(unpaidTotal)} unpaid and close this table?` : `Close ${table.table.name} and reset the session?`}</p>
            <div className="action-row"><button className="button button-danger" disabled={closing.isPending || unpaidCount > 0 && !canOverride} onClick={() => closing.mutate(unpaidCount > 0)}>{closing.isPending ? "Closing…" : unpaidCount > 0 ? "Override and close" : "Confirm close"}</button><button className="button button-outline" type="button" onClick={() => setConfirming(false)}>Keep open</button></div></div>}
      </div>}
      <h2>Current session orders</h2><div className="table-order-grid">{active.orders.length ? active.orders.map((order) => <OrderCard key={order.id} order={order} />) : <p>No orders yet.</p>}</div>
    </>}
  </div>;
}

export default function Tables() {
  const [selected, setSelected] = useState<number | null>(null);
  const transport = useStaffRealtime();
  const overview = useQuery({ queryKey: staffKeys.tables, queryFn: ({ signal }) => listTableOverview(signal) });
  const table = overview.data?.data.find((row) => row.table.id === selected);
  if (table) return <TablePanel table={table} onBack={() => setSelected(null)} />;
  return <div><div className="page-head board-heading"><div><span className="eyebrow">ENJOYER / FLOOR SERVICE</span><h1>Tables<span className="brand-dot">.</span></h1><p>Track sessions, unpaid balances and current orders.</p></div>
    <div className="board-tools"><span className="eyebrow" role="status">{transport === "sse" ? "● Live" : transport === "polling" ? "◌ Polling fallback" : transport === "ended" ? "Connection ended" : "Connecting…"}</span><button className="button button-outline" type="button" disabled={overview.isFetching} onClick={() => void overview.refetch()}>Refresh</button></div></div>
    {overview.isPending && <p role="status" className="feature-note">Loading tables…</p>}
    {overview.isError && <div className="feature-note error" role="alert">{overview.error.message} <button className="text-button" onClick={() => void overview.refetch()}>Retry</button></div>}
    {overview.data && <div className="table-grid">{overview.data.data.length ? overview.data.data.map((row) => <button className="table-tile" key={row.table.id} type="button" onClick={() => setSelected(row.table.id)}>
      <span className="eyebrow">TABLE {row.table.id} <span className={`status-tag status-${row.status}`}>{statusLabel(row.status)}</span></span><strong>{row.table.name}</strong>
      <span>{row.ordersUsed} used · {row.ordersRemaining} remaining</span><span className={row.unpaidOrderCount ? "unpaid-flag" : ""}>{row.unpaidOrderCount} unpaid · {peso(row.unpaidTotal)}</span><span className="tile-link">View orders ↗</span>
    </button>) : <p className="feature-note">No active tables are configured.</p>}</div>}
  </div>;
}
