import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOrder } from "@/api/staff";
import { staffKeys } from "@/constants/staff";
import type { OrderCardProps } from "@/types/staff";

export function useOrderCard({ order: summary }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const detail = useQuery({
    queryKey: staffKeys.order(summary.id),
    queryFn: ({ signal }) => getOrder(summary.id, signal),
    enabled: expanded,
  });
  const order = (expanded && detail.data?.data) || summary;
  const toggle = () => setExpanded((current) => !current);

  return { expanded, detail, order, toggle };
}
