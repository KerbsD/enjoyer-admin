"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/auth-state";
import { can, type Permission } from "@/lib/permissions";

export function PhasePage({ title, permission, phase }: { title: string; permission: Permission; phase: number }) {
  const user = useAuthStore((s) => s.user);
  if (!user || !can(user.role, permission)) return <div className="feature-note" role="alert"><h1>Access restricted</h1><p>Your account cannot access this workspace.</p><Link className="text-button" href="/board">Back to live orders</Link></div>;
  return <><div className="page-head"><span className="eyebrow">ENJOYER / OPERATIONS</span><h1>{title}<span className="brand-dot">.</span></h1><p>Everything your team needs to keep the shop moving.</p></div>
    <div className="feature-note"><span className="eyebrow">COMING IN FRONTEND PHASE {phase}</span><h2>{title} is next on the roadmap.</h2><p>This screen is not connected yet. No data is being shown or changed here.</p></div></>;
}
