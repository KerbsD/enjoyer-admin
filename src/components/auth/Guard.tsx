"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuthReady } from "./AuthProvider";
import { useAuthStore } from "@/lib/auth-state";

export function Guard({ children }: { children: ReactNode }) {
  const initializing = useAuthReady();
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (!initializing && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [initializing, user, pathname, router]);
  if (initializing || !user) return <div className="screen-center" role="status">{initializing ? "Restoring your session…" : "Opening sign in…"}</div>;
  return <>{children}</>;
}
