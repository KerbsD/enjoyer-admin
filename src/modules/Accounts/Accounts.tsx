"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/auth-state";
import { OwnerAccounts } from "./OwnerAccounts";

export default function Accounts() {
  const role = useAuthStore((s) => s.user?.role);

  if (role !== "owner")
    return (
      <div className="feature-note" role="alert">
        <h1>Access restricted</h1>
        <p>Only an Owner can manage accounts.</p>
        <Link className="text-button" href="/board">
          Return to live orders
        </Link>
      </div>
    );

  return <OwnerAccounts />;
}
