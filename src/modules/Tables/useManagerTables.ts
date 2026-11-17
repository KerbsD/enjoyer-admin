import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { downloadQrSheet, listManagedTables } from "@/api/tables";
import { staffKeys } from "@/constants/staff";
import { qrSheetFilename, type TableFilter } from "@/constants/tables";
import { saveAttachment } from "@/lib/save-attachment";
import { useStaffRealtime } from "@/modules/Staff/useStaffRealtime";

export function useManagerTables() {
  const [filter, setFilter] = useState<TableFilter>("all");
  const [creating, setCreating] = useState(false);
  const [sheetPending, setSheetPending] = useState(false);
  const query = useQuery({
    queryKey: staffKeys.managedTables,
    queryFn: ({ signal }) => listManagedTables(signal),
  });
  const transport = useStaffRealtime();
  const visible = query.data?.filter(
    (table) => filter === "all" || table.active === (filter === "active"),
  );

  const sheet = async () => {
    setSheetPending(true);
    try {
      saveAttachment(await downloadQrSheet(), qrSheetFilename);
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Could not download QR sheet.",
      );
    } finally {
      setSheetPending(false);
    }
  };

  return {
    filter,
    setFilter,
    creating,
    setCreating,
    sheetPending,
    query,
    transport,
    visible,
    sheet,
  };
}
