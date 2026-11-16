import { useQuery } from "@tanstack/react-query";
import { getStoreStatus } from "@/api/settings";
import { settingsKeys } from "@/constants/settings";

export function useStatusPanel() {
  return useQuery({
    queryKey: settingsKeys.status,
    queryFn: ({ signal }) => getStoreStatus(signal),
  });
}
