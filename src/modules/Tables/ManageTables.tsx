"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/auth-state";
import { ManagerTables } from "./ManagerTables";

export default function ManageTables() {
  const role = useAuthStore((s) => s.user?.role);

  if (role !== "owner" && role !== "manager")
    return (
      <div className="feature-note" role="alert">
        <h1>Access restricted</h1>
        <p>Only a Manager or Owner can manage tables and QR codes.</p>
        <Link className="text-button" href="/tables">
          View live tables
        </Link>
      </div>
    );

  return <ManagerTables />;
}
