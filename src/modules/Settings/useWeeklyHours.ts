import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getWeeklyHours, saveWeeklyDay, type HoursInput } from "@/api/settings";
import { daysOfWeek, settingsKeys } from "@/constants/settings";
import { useRefreshSettings } from "./useSettings";

export function useWeeklyHours() {
  const refresh = useRefreshSettings();
  const query = useQuery({
    queryKey: settingsKeys.weekly,
    queryFn: ({ signal }) => getWeeklyHours(signal),
  });
  const [editing, setEditing] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const firstConfiguration = !query.data?.data.some((day) => day.configured);

  const save = async (day: number, input: HoursInput) => {
    setSaving(true);
    try {
      await saveWeeklyDay(day, input);
      await refresh();
      toast.success(`${daysOfWeek[day]} hours saved.`);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  return {
    query,
    editing,
    setEditing,
    saving,
    firstConfiguration,
    save,
  };
}
