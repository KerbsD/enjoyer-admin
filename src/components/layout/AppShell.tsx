"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { logout } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-state";
import { can, type Permission } from "@/lib/permissions";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useOrderingTerminal } from "@/modules/Settings/useOrderingTerminal";
import {
  Armchair,
  BarChart3,
  ClipboardList,
  LogOut,
  PackageX,
  PanelLeftClose,
  PanelLeftOpen,
  QrCode,
  Settings,
  Users,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

const navigation: {
  href: string;
  label: string;
  permission: Permission;
  icon: LucideIcon;
}[] = [
  {
    href: "/board",
    label: "Live orders",
    permission: "board",
    icon: ClipboardList,
  },
  { href: "/tables", label: "Tables", permission: "tables", icon: Armchair },
  {
    href: "/table-management",
    label: "Manage tables & QR",
    permission: "tableManage",
    icon: QrCode,
  },
  {
    href: "/availability",
    label: "Sold-out items",
    permission: "soldOut",
    icon: PackageX,
  },
  { href: "/menu", label: "Menu", permission: "menu", icon: UtensilsCrossed },
  {
    href: "/settings",
    label: "Shop settings",
    permission: "settings",
    icon: Settings,
  },
  {
    href: "/reports",
    label: "Reports",
    permission: "reports",
    icon: BarChart3,
  },
  { href: "/accounts", label: "Accounts", permission: "accounts", icon: Users },
];

const SIDEBAR_STORAGE_KEY = "enjoyer:sidebar-collapsed";

export function AppShell({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  useOrderingTerminal(
    user && (user.role === "owner" || user.role === "manager")
      ? user.id
      : undefined,
  );
  const path = usePathname();
  const router = useRouter();
  const client = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);
  const toggleCollapsed = () =>
    setCollapsed((current) => {
      const next = !current;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? "1" : "0");
      } catch {
        // Collapsing still works for this visit when storage is blocked.
      }
      return next;
    });

  useEffect(() => {
    if (!open) return;
    firstLink.current?.focus();
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [open]);
  if (!user) return null;
  const initials = user.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  const collapseLabel = collapsed ? "Expand sidebar" : "Collapse sidebar";
  const CollapseIcon = collapsed ? PanelLeftOpen : PanelLeftClose;
  return (
    <div className={`app-shell ${collapsed ? "is-sidebar-collapsed" : ""}`}>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="topbar">
        <div className="topbar-left">
          <Link href="/board" className="brand">
            ENJOYER<span className="brand-dot">.</span>
          </Link>
        </div>
        <button
          ref={menuButton}
          type="button"
          className="mobile-menu"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="main-nav"
        >
          Menu
        </button>
        <span className="topbar-caption">JUST ENJOY.</span>
      </header>
      {open && (
        <button
          type="button"
          className="nav-backdrop"
          aria-label="Close navigation"
          onClick={() => {
            setOpen(false);
            menuButton.current?.focus();
          }}
        />
      )}
      <aside id="main-nav" className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-head">
          <div className="eyebrow sidebar-label">WORKSPACE</div>
          <button
            type="button"
            className="sidebar-toggle"
            onClick={toggleCollapsed}
            aria-label={collapseLabel}
            title={collapseLabel}
          >
            <CollapseIcon size={18} aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Main navigation">
          {navigation
            .filter((item) => can(user.role, item.permission))
            .map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  ref={index === 0 ? firstLink : undefined}
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={path === item.href ? "page" : undefined}
                  aria-label={item.label}
                  data-label={item.label}
                  className={`nav-link ${path === item.href ? "nav-active" : ""}`}
                >
                  <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
                  <span className="nav-text">{item.label}</span>
                  <span className="nav-arrow" aria-hidden="true">
                    ↗
                  </span>
                </Link>
              );
            })}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="sidebar-avatar" aria-hidden="true">
              {initials}
            </span>
            <div className="sidebar-user-meta">
              <strong>{user.name}</strong>
              <span className="eyebrow">{user.role}</span>
            </div>
          </div>
          <button
            disabled={busy}
            className="text-button sidebar-signout"
            aria-label="Sign out"
            onClick={async () => {
              setBusy(true);
              try {
                await logout();
              } catch {
                toast.warning(
                  "Signed out on this device, but server sign-out could not be confirmed. Close other sessions when connected.",
                );
              } finally {
                client.clear();
                router.replace("/login");
                setBusy(false);
              }
            }}
          >
            <LogOut size={18} aria-hidden="true" />
            <span className="sidebar-signout-text">Sign out →</span>
          </button>
        </div>
      </aside>
      <main id="main-content" tabIndex={-1} className="main-content">
        {children}
      </main>
    </div>
  );
}
