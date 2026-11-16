"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { categories, items, optionGroups, publicMenu } from "@/api/menu";
import { menuKeys } from "@/constants/menu";
import { staffKeys } from "@/modules/Staff/useStaffRealtime";

export const useCategories = () =>
  useQuery({
    queryKey: menuKeys.categories,
    queryFn: ({ signal }) => categories(signal),
  });
export const useItems = () =>
  useQuery({
    queryKey: menuKeys.items,
    queryFn: ({ signal }) => items(signal),
  });
export const useGroups = () =>
  useQuery({
    queryKey: menuKeys.groups,
    queryFn: ({ signal }) => optionGroups(signal),
  });
export const useVisibleMenu = () =>
  useQuery({
    queryKey: menuKeys.visible,
    queryFn: ({ signal }) => publicMenu(signal),
  });

export function useRefreshMenu() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: staffKeys.menu });
}
