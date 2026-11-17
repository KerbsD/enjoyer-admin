"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/auth-state";
import { ManagerReports } from "./ManagerReports";

export default function Reports() {
  const role = useAuthStore((s) => s.user?.role);

  if (role !== "manager" && role !== "owner")
    return (
      <div className="feature-note" role="alert">
        <h1>Access restricted</h1>
        <p>Only a Manager or Owner can view reports.</p>
        <Link className="text-button" href="/board">
          Return to live orders
        </Link>
      </div>
    );

  return <ManagerReports />;
}
