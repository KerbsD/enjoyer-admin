import { useQuery } from "@tanstack/react-query";
import { getHistoricalOrder } from "@/api/reports";
import { reportKeys } from "@/constants/reports";

export function useHistoricalDetail(id: string) {
  return useQuery({
    queryKey: reportKeys.order(id),
    queryFn: ({ signal }) => getHistoricalOrder(id, signal),
  });
}
