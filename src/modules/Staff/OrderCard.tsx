"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { Order } from "@/api/staff";
import { getOrder } from "@/api/staff";
import { peso, shopTime, statusLabel } from "@/lib/shop-format";
import { OrderActions } from "./OrderActions";
import { staffKeys } from "./useStaffRealtime";

export function OrderCard({ order: summary }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const detail = useQuery({ queryKey: staffKeys.order(summary.id), queryFn: ({ signal }) => getOrder(summary.id, signal), enabled: expanded });
  const order = expanded && detail.data?.data || summary;
  return <article className="order-card">
    <div className="card-head"><span className="eyebrow">#{order.orderNumber}</span><span className={`status-tag status-${order.status}`}>{statusLabel(order.status)}</span></div>
    <h3>{order.tableName}</h3><p className="order-time">{shopTime(order.createdAt)} · {order.itemCount} items</p>
    <ul className="order-items">{order.items.map((item) => <li key={item.id}><strong>{item.quantity} × {item.name}</strong>
      {item.options.length > 0 && <small>{item.options.map((option) => `${option.groupName}: ${option.name}`).join(" · ")}</small>}
      {item.note && <small className="note">Note: {item.note}</small>}</li>)}</ul>
    <div className="card-total"><span>Total</span><strong>{peso(order.total)}</strong></div>
    <div className={`payment-line ${order.paymentStatus === "unpaid" && order.status === "served" ? "unpaid-flag" : ""}`}>{order.paymentStatus === "paid" ? `Paid · ${statusLabel(order.paymentMethod || "")}` : "Unpaid"}{order.status === "served" && order.paymentStatus === "unpaid" ? " · Needs payment" : ""}</div>
    <button className="text-button" type="button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>{expanded ? "Hide details" : "Full order details"}</button>
    {expanded && <div className="detail-panel">{detail.isPending && <p role="status">Refreshing order details…</p>}
      {detail.isError && <p className="error" role="alert">{detail.error.message} <button type="button" className="text-button" onClick={() => void detail.refetch()}>Retry</button></p>}
      {order.cancellationReason && <p>Cancellation reason: {order.cancellationReason}</p>}
      {order.rejectionReason && <p>Rejection reason: {order.rejectionReason}</p>}
      <p>Table session: <code>{order.tableSessionId}</code></p>
    </div>}
    <OrderActions order={order} />
  </article>;
}
