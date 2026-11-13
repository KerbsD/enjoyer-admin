"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { items } from "@/api/menu";
import { listManagedTables } from "@/api/tables";
import { exportOrders, getDashboard, getHistoricalOrder, listHistory, type DashboardData, type DashboardParams, type HistoryFilters } from "@/api/reports";
import type { Order, OrderStatus, PaymentStatus } from "@/api/staff";
import { useAuthStore } from "@/lib/auth-state";
import { peso, shopTime, statusLabel } from "@/lib/shop-format";
import { saveAttachment } from "@/lib/save-attachment";
import { useStaffRealtime } from "@/modules/Staff/useStaffRealtime";
import { rangeError, rangeOf } from "./validation";

const statuses: OrderStatus[] = ["pending_confirmation", "received", "preparing", "ready", "served", "cancelled", "rejected"];
const pageSize = 25;

function DateFields({ from, to, setFrom, setTo }: { from: string; to: string; setFrom: (v: string) => void; setTo: (v: string) => void }) {
  return <><label className="field"><span>From (Manila date)</span><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
    <label className="field"><span>To (Manila date)</span><input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label></>;
}

function Bars({ rows, label }: { rows: { name: string; value: number; detail?: string }[]; label: string }) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  return <div className="report-bars" role="img" aria-label={`${label}: ${rows.map((row) => `${row.name} ${row.value}`).join(", ")}`}>
    {rows.map((row) => <div className="report-bar" key={row.name}><span>{row.name}</span><div className="report-track"><div style={{ width: `${row.value / max * 100}%` }} /></div><strong>{row.value}</strong>{row.detail && <small>{row.detail}</small>}</div>)}
  </div>;
}

function DashboardView({ data }: { data: DashboardData }) {
  return <><p className="report-caption">{data.range.from} to {data.range.to} · {data.range.timezone} · inclusive shop dates</p>
    <div className="report-metrics"><div><span>Total orders</span><strong>{data.totalOrders}</strong></div><div><span>Paid revenue</span><strong>{peso(data.revenue)}</strong></div><div><span>Paid orders</span><strong>{data.paidOrders}</strong></div><div><span>Unpaid active orders</span><strong>{data.unpaidOrders}</strong></div></div>
    <p className="report-caption">Revenue includes paid cancelled orders. Unpaid count excludes cancelled and rejected orders. Best sellers and peak hours exclude cancelled and rejected orders.</p>
    <div className="report-charts"><section><h3>Order status</h3>{data.statusBreakdown.length ? <Bars label="Order status" rows={data.statusBreakdown.map((s) => ({ name: statusLabel(s.status), value: s.count }))} /> : <p>No orders in this range.</p>}</section>
      <section><h3>Best sellers · quantity</h3>{data.bestSellers.length ? <Bars label="Best sellers" rows={data.bestSellers.map((s) => ({ name: s.name, value: s.quantity, detail: peso(s.revenue) }))} /> : <p>No qualifying items in this range.</p>}</section>
      <section className="report-wide"><h3>Orders by hour · Manila time</h3><Bars label="Orders by hour (24-hour shop clock)" rows={data.peakHours.map((h) => ({ name: `${String(h.hour).padStart(2, "0")}:00`, value: h.orders }))} /></section></div></>;
}

function DashboardSection() {
  const [period, setPeriod] = useState<"today" | "7days" | "30days" | "custom">("today");
  const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  const [applied, setApplied] = useState<DashboardParams>({ period: "today" });
  const [error, setError] = useState("");
  const query = useQuery({ queryKey: ["reports", "dashboard", applied], queryFn: ({ signal }) => getDashboard(applied, signal) });
  function apply(e: FormEvent) {
    e.preventDefault();
    const message = period === "custom" ? rangeError(from, to, true) : null;
    if (message) { setError(message); return; }
    setError(""); setApplied(period === "custom" ? rangeOf(from, to) : { period });
  }
  return <section className="menu-section"><h2>Dashboard</h2><form className="report-controls" onSubmit={apply}><label className="field"><span>Period</span><select value={period} onChange={(e) => setPeriod(e.target.value as typeof period)}><option value="today">Today</option><option value="7days">Last 7 shop dates</option><option value="30days">Last 30 shop dates</option><option value="custom">Custom dates</option></select></label>
    {period === "custom" && <DateFields from={from} to={to} setFrom={setFrom} setTo={setTo} />}
    <button className="button" type="submit">Show dashboard</button><button className="button button-outline" type="button" disabled={query.isFetching} onClick={() => void query.refetch()}>Refresh</button></form>
    {error && <p role="alert" className="error">{error}</p>}
    {query.isPending && <p role="status">Loading dashboard…</p>}
    {query.isError && <p role="alert" className="error">{query.error.message} <button className="text-button" onClick={() => void query.refetch()}>Retry</button></p>}
    {query.data && <DashboardView data={query.data.data} />}</section>;
}

function HistoricalDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const detail = useQuery({ queryKey: ["reports", "order", id], queryFn: ({ signal }) => getHistoricalOrder(id, signal) });
  const order = detail.data?.data;
  return <div className="report-detail" aria-label="Historical order details"><button className="text-button" type="button" onClick={onClose}>Close details</button>
    {detail.isPending && <p role="status">Loading order details…</p>}
    {detail.isError && <p role="alert" className="error">{detail.error.message} <button className="text-button" onClick={() => void detail.refetch()}>Retry</button></p>}
    {order && <><h3>Order #{order.orderNumber} · {order.tableName}</h3><p>{statusLabel(order.status)} · {statusLabel(order.paymentStatus)}{order.paymentMethod ? ` (${statusLabel(order.paymentMethod)})` : ""}</p>
      <p>Placed {shopTime(order.createdAt)} · Updated {shopTime(order.updatedAt)}</p>
      {order.confirmedAt && <p>Confirmed {shopTime(order.confirmedAt)}</p>}{order.paidAt && <p>Paid {shopTime(order.paidAt)}</p>}{order.cancelledAt && <p>Cancelled {shopTime(order.cancelledAt)}{order.cancelledBy ? ` by ${order.cancelledBy}` : ""}</p>}
      {order.cancellationReason && <p>Cancellation reason: {order.cancellationReason}</p>}{order.rejectionReason && <p>Rejection reason: {order.rejectionReason}</p>}
      <p>Table session: <code>{order.tableSessionId}</code></p><ul className="order-items">{order.items.map((item) => <li key={item.id}><strong>{item.quantity} × {item.name} · {peso(item.lineTotal)}</strong><small>Unit price: {peso(item.unitPrice)}</small>
        {item.options.map((option) => <small key={option.id}>{option.groupName}: {option.name} ({peso(option.priceDelta)})</small>)}{item.note && <small className="note">Note: {item.note}</small>}</li>)}</ul>
      <p>Subtotal: {peso(order.subtotal)} · <strong>Total: {peso(order.total)}</strong></p></>}
  </div>;
}

function HistorySection() {
  const [draft, setDraft] = useState({ from: "", to: "", tableId: "", itemId: "", status: "", paymentStatus: "", q: "" });
  const [filters, setFilters] = useState<HistoryFilters>({});
  const [offset, setOffset] = useState(0); const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState("");
  const tables = useQuery({ queryKey: ["tables", "manage"], queryFn: ({ signal }) => listManagedTables(signal) });
  const menu = useQuery({ queryKey: ["menu", "items"], queryFn: ({ signal }) => items(signal) });
  const history = useQuery({ queryKey: ["reports", "history", filters, offset], queryFn: ({ signal }) => listHistory({ ...filters, limit: pageSize, offset }, signal) });
  function change(key: keyof typeof draft, value: string) { setDraft((previous) => ({ ...previous, [key]: value })); }
  function apply(e: FormEvent) {
    e.preventDefault();
    const message = rangeError(draft.from, draft.to);
    if (message) { setError(message); return; }
    if (draft.q.trim().length > 100) { setError("Search must be 100 characters or fewer."); return; }
    setError(""); setOffset(0); setSelected(null);
    setFilters({ ...(draft.from ? rangeOf(draft.from, draft.to) : {}), tableId: draft.tableId ? Number(draft.tableId) : undefined,
      itemId: draft.itemId ? Number(draft.itemId) : undefined, status: draft.status ? draft.status as OrderStatus : undefined,
      paymentStatus: draft.paymentStatus ? draft.paymentStatus as PaymentStatus : undefined, q: draft.q.trim() || undefined });
  }
  return <section className="menu-section"><h2>Order history</h2><p>Search order number, table name, or snapshotted item name. All statuses, including cancelled and rejected, appear unless filtered.</p>
    <form onSubmit={apply} className="report-controls"><DateFields from={draft.from} to={draft.to} setFrom={(v) => change("from", v)} setTo={(v) => change("to", v)} />
      <label className="field"><span>Table</span><select value={draft.tableId} onChange={(e) => change("tableId", e.target.value)}><option value="">All tables</option>{tables.data?.map((t) => <option value={t.id} key={t.id}>{t.name}</option>)}</select></label>
      <label className="field"><span>Item</span><select value={draft.itemId} onChange={(e) => change("itemId", e.target.value)}><option value="">All items</option>{menu.data?.map((i) => <option value={i.id} key={i.id}>{i.name}</option>)}</select></label>
      <label className="field"><span>Status</span><select value={draft.status} onChange={(e) => change("status", e.target.value)}><option value="">All statuses</option>{statuses.map((s) => <option value={s} key={s}>{statusLabel(s)}</option>)}</select></label>
      <label className="field"><span>Payment</span><select value={draft.paymentStatus} onChange={(e) => change("paymentStatus", e.target.value)}><option value="">All payments</option><option value="paid">Paid</option><option value="unpaid">Unpaid</option></select></label>
      <label className="field"><span>Search</span><input type="search" maxLength={100} value={draft.q} onChange={(e) => change("q", e.target.value)} placeholder="Order, table, or item" /></label>
      <button className="button" type="submit">Apply filters</button>
      <button className="button button-outline" type="button" onClick={() => { setDraft({ from: "", to: "", tableId: "", itemId: "", status: "", paymentStatus: "", q: "" }); setFilters({}); setOffset(0); setSelected(null); setError(""); }}>Clear filters</button></form>
    {error && <p role="alert" className="error">{error}</p>}
    {tables.isError && <p role="alert" className="error">Table choices: {tables.error.message} <button className="text-button" onClick={() => void tables.refetch()}>Retry</button></p>}
    {menu.isError && <p role="alert" className="error">Item choices: {menu.error.message} <button className="text-button" onClick={() => void menu.refetch()}>Retry</button></p>}
    {history.isPending && <p role="status">Loading history…</p>}
    {history.isError && <p role="alert" className="error">{history.error.message} <button className="text-button" onClick={() => void history.refetch()}>Retry</button></p>}
    {history.data && <><p className="report-caption">{history.data.pagination.total} orders · {history.data.range ? `${history.data.range.from} to ${history.data.range.to} (${history.data.range.timezone})` : "All dates"}</p>
      {history.data.data.length === 0 ? <p>No orders match these filters.</p> : <div className="report-history">{history.data.data.map((order: Order) => <article className="report-history-row" key={order.id}><div><strong>#{order.orderNumber} · {order.tableName}</strong><span>{shopTime(order.createdAt)} · {statusLabel(order.status)} · {statusLabel(order.paymentStatus)}</span></div><strong>{peso(order.total)}</strong><button type="button" className="button button-outline" aria-expanded={selected === order.id} onClick={() => setSelected(selected === order.id ? null : order.id)}>{selected === order.id ? "Hide details" : "Details"}</button>
        {selected === order.id && <HistoricalDetail id={order.id} onClose={() => setSelected(null)} />}</article>)}</div>}
      <div className="report-pagination"><button className="button button-outline" type="button" disabled={offset === 0} onClick={() => { setSelected(null); setOffset(Math.max(0, offset - pageSize)); }}>Previous</button><span>Showing {history.data.pagination.total ? offset + 1 : 0}–{offset + history.data.data.length} of {history.data.pagination.total}</span><button className="button button-outline" type="button" disabled={!history.data.pagination.hasMore} onClick={() => { setSelected(null); setOffset(offset + pageSize); }}>Next</button></div></>}
  </section>;
}

function ExportSection() {
  const [from, setFrom] = useState(""); const [to, setTo] = useState(""); const [error, setError] = useState(""); const [saving, setSaving] = useState(false);
  async function download(e: FormEvent) {
    e.preventDefault(); const message = rangeError(from, to, true);
    if (message) { setError(message); return; }
    setError(""); setSaving(true);
    try { saveAttachment(await exportOrders(rangeOf(from, to)), `enjoyer-orders-${from}-to-${to}.csv`); toast.success("CSV download started."); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not download CSV."); }
    finally { setSaving(false); }
  }
  return <section className="menu-section"><h2>Export orders · CSV</h2><p>Choose an inclusive Manila date range. Export includes every order in that range, regardless of the history filters above. The CSV timestamps are UTC.</p>
    <form onSubmit={(e) => void download(e)} className="report-controls"><DateFields from={from} to={to} setFrom={setFrom} setTo={setTo} /><button className="button" type="submit" disabled={saving}>{saving ? "Downloading…" : "Download CSV"}</button></form>
    {error && <p role="alert" className="error">{error}</p>}</section>;
}

function ManagerReports() {
  useStaffRealtime();
  return <div><div className="page-head"><span className="eyebrow">ENJOYER / PERFORMANCE</span><h1>Reports<span className="brand-dot">.</span></h1><p>Shop-local dates, Philippine peso totals, and order history.</p></div><DashboardSection /><HistorySection /><ExportSection /></div>;
}

export default function Reports() {
  const role = useAuthStore((s) => s.user?.role);
  if (role !== "manager" && role !== "owner") return <div className="feature-note" role="alert"><h1>Access restricted</h1><p>Only a Manager or Owner can view reports.</p><Link className="text-button" href="/board">Return to live orders</Link></div>;
  return <ManagerReports />;
}
