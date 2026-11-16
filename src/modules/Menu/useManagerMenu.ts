"use client";

import { useState } from "react";
import type { MenuTab } from "@/constants/menu";
import { useStaffRealtime } from "@/modules/Staff/useStaffRealtime";

export function useManagerMenu() {
  const [tab, setTab] = useState<MenuTab>("items");
  const transport = useStaffRealtime();

  return { tab, setTab, transport };
}
