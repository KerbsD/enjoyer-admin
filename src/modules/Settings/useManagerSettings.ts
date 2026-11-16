"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSettings } from "@/api/settings";
import { settingsKeys, type SettingsTab } from "@/constants/settings";
import { useStaffRealtime } from "@/modules/Staff/useStaffRealtime";

export function useManagerSettings() {
  const [tab, setTab] = useState<SettingsTab>("timings");
  useStaffRealtime();

  const settings = useQuery({
    queryKey: settingsKeys.timings,
    queryFn: ({ signal }) => getSettings(signal),
  });

  return { tab, setTab, settings };
}
