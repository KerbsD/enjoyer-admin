import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listTableOverview } from "@/api/staff";
import { staffKeys } from "@/constants/staff";
import { useStaffRealtime } from "./useStaffRealtime";

export function useTables() {
  const [selected, setSelected] = useState<number | null>(null);
  const transport = useStaffRealtime();
  const overview = useQuery({
    queryKey: staffKeys.tables,
    queryFn: ({ signal }) => listTableOverview(signal),
  });
  const table = overview.data?.data.find((row) => row.table.id === selected);

  return { selected, setSelected, transport, overview, table };
}
