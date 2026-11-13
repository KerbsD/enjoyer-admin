"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { setAvailability } from "@/api/menu";
import { peso } from "@/lib/shop-format";
import { useStaffRealtime } from "@/modules/Staff/useStaffRealtime";
import { useRefreshMenu, useVisibleMenu } from "./useMenu";

export default function Availability() {
  const menu = useVisibleMenu();
  const refresh = useRefreshMenu();
  const transport = useStaffRealtime();
  const [savingId, setSavingId] = useState<number | null>(null);
  const mutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: number; isAvailable: boolean }) => setAvailability(id, isAvailable),
    onSuccess: async () => { await refresh(); toast.success("Availability updated."); },
    onError: (error) => { toast.error(error.message); void refresh(); },
    onSettled: () => setSavingId(null),
  });
  return <div><div className="page-head board-heading"><div><span className="eyebrow">ENJOYER / DAILY MENU</span><h1>Sold-out items<span className="brand-dot">.</span></h1><p>Available items can be ordered; sold-out items remain visible to customers.</p></div><span className="eyebrow" role="status">{transport === "sse" ? "● Live" : transport === "polling" ? "◌ Polling fallback" : "Connecting…"}</span></div>
    {menu.isPending && <p className="feature-note" role="status">Loading menu…</p>}
    {menu.isError && <div className="feature-note error" role="alert">{menu.error.message} <button type="button" className="text-button" onClick={() => void menu.refetch()}>Retry</button></div>}
    {menu.data?.data.length === 0 && <p className="feature-note">No visible menu items yet. Ask a Manager to set up the menu.</p>}
    {menu.data?.data.map((category) => <section key={category.id} className="menu-section"><h2>{category.name}</h2><div className="menu-rows">{category.items.map((item) => <div key={item.id} className="menu-row"><div><strong>{item.name}{item.isSpicy ? " · Spicy" : ""}</strong><span>{peso(item.price)} · {item.isAvailable ? "Available" : "Sold out"}</span></div>
      <button type="button" className={`button ${item.isAvailable ? "button-outline" : ""}`} disabled={mutation.isPending} onClick={() => { setSavingId(item.id); mutation.mutate({ id: item.id, isAvailable: !item.isAvailable }); }}>{savingId === item.id ? "Saving…" : item.isAvailable ? "Mark sold out" : "Mark available"}</button></div>)}</div></section>)}
  </div>;
}
