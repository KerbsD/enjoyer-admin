import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { setAvailability } from "@/api/menu";

import { useStaffRealtime } from "@/modules/Staff/useStaffRealtime";
import { useRefreshMenu, useVisibleMenu } from "./useMenu";

export function useAvailability() {
  const menu = useVisibleMenu();
  const refresh = useRefreshMenu();
  const transport = useStaffRealtime();
  const [savingId, setSavingId] = useState<number | null>(null);
  const mutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: number; isAvailable: boolean }) =>
      setAvailability(id, isAvailable),
    onSuccess: async () => {
      await refresh();
      toast.success("Availability updated.");
    },
    onError: (error) => {
      toast.error(error.message);
      void refresh();
    },
    onSettled: () => setSavingId(null),
  });

  return { menu, transport, savingId, mutation, setSavingId };
}
