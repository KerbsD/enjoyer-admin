"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { logout } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-state";
import { can, type Permission } from "@/lib/permissions";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const navigation: { href: string; label: string; permission: Permission }[] = [
  { href: "/board", label: "Live orders", permission: "board" },
  { href: "/tables", label: "Tables", permission: "tables" },
  { href: "/table-management", label: "Manage tables & QR", permission: "tableManage" },
  { href: "/availability", label: "Sold-out items", permission: "soldOut" },
  { href: "/menu", label: "Menu", permission: "menu" },
  { href: "/settings", label: "Shop settings", permission: "settings" },
  { href: "/reports", label: "Reports", permission: "reports" },
  { href: "/accounts", label: "Accounts", permission: "accounts" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const path = usePathname();
  const router = useRouter();
  const client = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (!open) return;
    firstLink.current?.focus();
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); menuButton.current?.focus(); }
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [open]);
  if (!user) return null;
  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <header className="topbar"><Link href="/board" className="brand">ENJOYER<span className="brand-dot">.</span></Link>
      <button ref={menuButton} type="button" className="mobile-menu" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="main-nav">Menu</button>
      <span className="topbar-caption">JUST ENJOY.</span></header>
    {open && <button type="button" className="nav-backdrop" aria-label="Close navigation" onClick={() => { setOpen(false); menuButton.current?.focus(); }} />}
    <aside id="main-nav" className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="eyebrow sidebar-label">WORKSPACE / {user.role.toUpperCase()}</div>
      <nav aria-label="Main navigation">{navigation.filter((item) => can(user.role, item.permission)).map((item, index) =>
        <Link ref={index === 0 ? firstLink : undefined} key={item.href} href={item.href} onClick={() => setOpen(false)} aria-current={path === item.href ? "page" : undefined}
          className={`nav-link ${path === item.href ? "nav-active" : ""}`}>{item.label}<span aria-hidden="true">↗</span></Link>)}</nav>
      <div className="sidebar-footer"><strong>{user.name}</strong><span className="eyebrow">{user.role}</span>
        <button disabled={busy} className="text-button" onClick={async () => { setBusy(true); try { await logout(); client.clear(); router.replace("/login"); } catch { toast.error("Could not sign out. Check your connection and try again."); } finally { setBusy(false); } }}>Sign out →</button></div>
    </aside>
    <main id="main-content" tabIndex={-1} className="main-content">{children}</main>
  </div>;
}
