"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/auth-state";
import { ManagerMenu } from "./ManagerMenu";

export default function Menu() {
  const role = useAuthStore((s) => s.user?.role);

  if (role !== "manager" && role !== "owner")
    return (
      <div className="feature-note" role="alert">
        <h1>Access restricted</h1>
        <p>Only a Manager or Owner can manage the menu.</p>
        <Link className="text-button" href="/availability">
          Go to sold-out items
        </Link>
      </div>
    );

  return <ManagerMenu />;
}
