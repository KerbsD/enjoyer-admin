"use client";

import { useQueryClient } from "@tanstack/react-query";
import { staffKeys } from "@/constants/staff";

export function useRefreshSettings() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: staffKeys.settings });
}
