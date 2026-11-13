"use client";

import { useState } from "react";
import { CategoryEditor } from "./CategoryEditor";
import { ItemEditor } from "./ItemEditor";
import { GroupEditor } from "./GroupEditor";
import { useStaffRealtime } from "@/modules/Staff/useStaffRealtime";
import { useAuthStore } from "@/lib/auth-state";
import Link from "next/link";

type Tab = "items" | "categories" | "groups";
export default function Menu() {
  const role = useAuthStore((s) => s.user?.role);
  if (role !== "manager" && role !== "owner") return <div className="feature-note" role="alert"><h1>Access restricted</h1><p>Only a Manager or Owner can manage the menu.</p><Link className="text-button" href="/availability">Go to sold-out items</Link></div>;
  return <ManagerMenu />;
}

function ManagerMenu() {
  const [tab, setTab] = useState<Tab>("items");
  const transport = useStaffRealtime();
  return <div><div className="page-head board-heading"><div><span className="eyebrow">ENJOYER / MENU MANAGEMENT</span><h1>Menu<span className="brand-dot">.</span></h1><p>Manage the categories, items and add-ons customers see right now.</p></div><span className="eyebrow" role="status">{transport === "sse" ? "● Live" : transport === "polling" ? "◌ Polling fallback" : "Connecting…"}</span></div>
    <nav className="menu-tabs" aria-label="Menu sections">{(["items", "categories", "groups"] as const).map((value) => <button type="button" key={value} aria-pressed={tab === value} className={tab === value ? "tab-active" : ""} onClick={() => setTab(value)}>{value === "groups" ? "Option groups" : value === "items" ? "Items" : "Categories"}</button>)}</nav>
    {tab === "items" ? <ItemEditor /> : tab === "categories" ? <CategoryEditor /> : <GroupEditor />}
  </div>;
}
