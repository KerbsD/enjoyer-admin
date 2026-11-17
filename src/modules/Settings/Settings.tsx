"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/auth-state";
import { ManagerSettings } from "./ManagerSettings";

export default function Settings() {
  const role = useAuthStore((s) => s.user?.role);

  if (role !== "manager" && role !== "owner")
    return (
      <div className="feature-note" role="alert">
        <h1>Access restricted</h1>
        <p>Only a Manager or Owner can change shop settings.</p>
        <Link className="text-button" href="/board">
          Return to live orders
        </Link>
      </div>
    );

  return <ManagerSettings />;
}
