import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteHoliday, getHolidays } from "@/api/settings";
import { settingsKeys } from "@/constants/settings";
import { useRefreshSettings } from "./useSettings";

export function useHolidays() {
  const refresh = useRefreshSettings();
  const query = useQuery({
    queryKey: settingsKeys.holidays,
    queryFn: ({ signal }) => getHolidays(signal),
  });
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const selected = query.data?.find((holiday) => holiday.date === editing);
  const shown = query.data?.filter(
    (holiday) => (!from || holiday.date >= from) && (!to || holiday.date <= to),
  );

  const remove = async (date: string) => {
    setSaving(true);
    try {
      await deleteHoliday(date);
      await refresh();
      toast.success("Override removed; weekly hours apply again.");
      setRemoving(null);
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Could not remove override.",
      );
    } finally {
      setSaving(false);
    }
  };

  return {
    query,
    editing,
    setEditing,
    removing,
    setRemoving,
    saving,
    from,
    setFrom,
    to,
    setTo,
    selected,
    shown,
    remove,
  };
}
