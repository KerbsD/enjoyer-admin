"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Order, OrderStatus } from "@/api/staff";
import { listAllOrders } from "@/api/staff";
import { OrderCard } from "./OrderCard";
import { staffKeys, useStaffRealtime } from "./useStaffRealtime";

const columns: { status: OrderStatus; title: string }[] = [
  { status: "pending_confirmation", title: "Confirm" },
  { status: "received", title: "Received" },
  { status: "preparing", title: "Preparing" },
  { status: "ready", title: "Ready" },
  { status: "served", title: "Served" },
];

function playAlert(context: AudioContext) {
  if (context.state === "suspended") void context.resume();
  const tone = context.createOscillator(); const gain = context.createGain();
  tone.type = "sine"; tone.frequency.setValueAtTime(660, context.currentTime);
  tone.frequency.setValueAtTime(880, context.currentTime + .12);
  gain.gain.setValueAtTime(.08, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .28);
  tone.connect(gain); gain.connect(context.destination);
  tone.start(); tone.stop(context.currentTime + .28);
}

export default function Board() {
  const [sound, setSound] = useState(false);
  const [arrivals, setArrivals] = useState<Order[]>([]);
  const audio = useRef<AudioContext | null>(null);
  useEffect(() => () => { void audio.current?.close(); }, []);
  const onNewOrders = useCallback((added: Order[]) => {
    setArrivals((current) => [...added, ...current].slice(0, 10));
    if (audio.current) playAlert(audio.current);
  }, []);
  const transport = useStaffRealtime(onNewOrders);
  const board = useQuery({ queryKey: staffKeys.orders, queryFn: async ({ signal }) => {
    const pages = await Promise.all(columns.map(({ status }) => listAllOrders(status, undefined, signal)));
    return pages.flat();
  } });
  const orders = board.data || [];
  return <div><div className="page-head board-heading"><div><span className="eyebrow">ENJOYER / LIVE SERVICE</span><h1>Live orders<span className="brand-dot">.</span></h1><p>Oldest first. Times shown in Manila.</p></div>
    <div className="board-tools"><span className="eyebrow" role="status">{transport === "sse" ? "● Live" : transport === "polling" ? "◌ Polling fallback" : transport === "ended" ? "Connection ended" : "Connecting…"}</span>
      <button type="button" className="button button-outline" onClick={() => { if (sound) { void audio.current?.close(); audio.current = null; setSound(false); } else { audio.current = new AudioContext(); void audio.current.resume(); setSound(true); } }} aria-pressed={sound}>{sound ? "Sound on" : "Enable sound"}</button>
      <button type="button" className="button button-outline" disabled={board.isFetching} onClick={() => void board.refetch()}>Refresh</button></div></div>
    {arrivals.length > 0 && <div className="new-orders-banner" role="alert"><strong>{arrivals.length} new {arrivals.length === 1 ? "order" : "orders"}</strong> · {arrivals.map((order) => `#${order.orderNumber} (${order.tableName})`).join(", ")}
      <button type="button" className="text-button" onClick={() => setArrivals([])}>Dismiss</button></div>}
    {board.isPending && <p role="status" className="feature-note">Loading live orders…</p>}
    {board.isError && <div className="feature-note error" role="alert">{board.error.message} <button className="text-button" onClick={() => void board.refetch()}>Try again</button></div>}
    {board.data && <div className="board-columns">{columns.map(({ status, title }) => {
      const rows = orders.filter((order) => order.status === status);
      return <section className="board-column" key={status} aria-label={title}><div className="column-head"><h2>{title}</h2><span className="mono count">{rows.length}</span></div>
        {rows.length ? rows.map((order) => <OrderCard order={order} key={order.id} />) : <div className="empty-column">No orders here.</div>}</section>;
    })}</div>}
  </div>;
}
