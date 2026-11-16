"use client";

import { useQueryClient } from "@tanstack/react-query";
import { staffKeys } from "@/modules/Staff/useStaffRealtime";

export function useRefreshSettings() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: staffKeys.settings });
}
