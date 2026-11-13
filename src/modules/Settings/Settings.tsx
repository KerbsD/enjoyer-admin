"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { getSettings, getStoreStatus, updateSettings, type ShopSettings } from "@/api/settings";
import { Field } from "@/components/ui/Field";
import { useAuthStore } from "@/lib/auth-state";
import { shopTime } from "@/lib/shop-format";
import { staffKeys, useStaffRealtime } from "@/modules/Staff/useStaffRealtime";
import { WeeklyHours } from "./WeeklyHours";
import { Holidays } from "./Holidays";
import { timingsSchema } from "./schemas";

const keys = {
  timings: ["settings", "timings"] as const,
  weekly: ["settings", "weekly"] as const,
  holidays: ["settings", "holidays"] as const,
  status: ["settings", "status"] as const,
};
export { keys as settingsKeys };

function TimingsForm({ settings }: { settings: ShopSettings }) {
  const client = useQueryClient();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof timingsSchema>>({
    resolver: zodResolver(timingsSchema), defaultValues: settings,
  });
  return <form className="menu-editor" onSubmit={handleSubmit(async (input) => {
    setError("");
    try { await updateSettings(input); await client.invalidateQueries({ queryKey: staffKeys.settings }); toast.success("Shop settings saved."); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save settings."); }
  })}><h2>Session timing</h2><div className="editor-grid">
    <Field label="Idle table timeout (minutes)" id="idle-timeout" type="number" min={1} max={1440} error={errors.idleTimeoutMinutes?.message} {...register("idleTimeoutMinutes", { valueAsNumber: true })} />
    <Field label="First-order confirmation expiry (minutes)" id="confirmation-expiry" type="number" min={1} max={120} error={errors.confirmationExpiryMinutes?.message} {...register("confirmationExpiryMinutes", { valueAsNumber: true })} /></div>
    <p>Default: 180 minutes idle, 10 minutes for first-order confirmation. Shop timezone: <strong>{settings.shopTimezone}</strong> (read-only).</p>
    {error && <p className="error" role="alert">{error}</p>}<button className="button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Save timings"}</button>
  </form>;
}

function StatusPanel() {
  const status = useQuery({ queryKey: keys.status, queryFn: ({ signal }) => getStoreStatus(signal) });
  return <section className="store-status" aria-label="Current shop status"><div className="section-heading"><h2>Current shop status</h2><button type="button" className="button button-outline" disabled={status.isFetching} onClick={() => void status.refetch()}>Refresh status</button></div>
    {status.isPending && <p role="status">Loading shop status…</p>}
    {status.isError && <p className="error" role="alert">{status.error.message}</p>}
    {status.data && <><strong>{!status.data.data.configured && status.data.data.today.source === "unconfigured" ? "Hours not configured — ordering is unrestricted" : status.data.data.isOpen ? "Open for ordering" : "Closed for ordering"}</strong>
      <p>Shop date and time: {status.data.data.localDate} · {status.data.data.localTime} ({status.data.data.timezone}).</p>
      {status.data.data.nextOpen && <p>Next opening: {shopTime(status.data.data.nextOpen)}</p>}
      {status.data.data.closesAt && <p>Closes: {shopTime(status.data.data.closesAt)}</p>}</>}
  </section>;
}

function ManagerSettings() {
  useStaffRealtime();
  const settings = useQuery({ queryKey: keys.timings, queryFn: ({ signal }) => getSettings(signal) });
  const [tab, setTab] = useState<"timings" | "weekly" | "holidays">("timings");
  return <div><div className="page-head"><span className="eyebrow">ENJOYER / SHOP OPERATIONS</span><h1>Shop settings<span className="brand-dot">.</span></h1><p>Control session timing and the shop-local ordering schedule.</p></div>
    <StatusPanel />
    <nav className="menu-tabs" aria-label="Settings sections">{(["timings", "weekly", "holidays"] as const).map((value) => <button key={value} type="button" aria-pressed={tab === value} className={tab === value ? "tab-active" : ""} onClick={() => setTab(value)}>{value === "timings" ? "Session timing" : value === "weekly" ? "Weekly hours" : "Holiday overrides"}</button>)}</nav>
    {tab === "timings" && <>{settings.isPending && <p role="status">Loading settings…</p>}
      {settings.isError && <p role="alert" className="error">{settings.error.message} <button type="button" className="text-button" onClick={() => void settings.refetch()}>Retry</button></p>}
      {settings.data && <TimingsForm key={`${settings.data.data.idleTimeoutMinutes}-${settings.data.data.confirmationExpiryMinutes}`} settings={settings.data.data} />}</>}
    {tab === "weekly" && <WeeklyHours />}
    {tab === "holidays" && <Holidays />}
  </div>;
}

export default function Settings() {
  const role = useAuthStore((s) => s.user?.role);
  if (role !== "manager" && role !== "owner") return <div className="feature-note" role="alert"><h1>Access restricted</h1><p>Only a Manager or Owner can change shop settings.</p><Link className="text-button" href="/board">Return to live orders</Link></div>;
  return <ManagerSettings />;
}
