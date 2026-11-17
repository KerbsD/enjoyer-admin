import { useState } from "react";
import { toast } from "sonner";
import { saveHoliday, type HoursInput } from "@/api/settings";
import { calendarDate } from "@/schemas/settings";
import type { HolidayEditorProps } from "@/types/settings";
import { useRefreshSettings } from "./useSettings";

export function useHolidayEditor({ holiday, onClose }: HolidayEditorProps) {
  const refresh = useRefreshSettings();
  const [date, setDate] = useState(holiday?.date ?? "");
  const [dateError, setDateError] = useState("");
  const [saving, setSaving] = useState(false);

  const updateDate = (value: string) => {
    setDate(value);
    setDateError("");
  };

  const save = async (input: HoursInput) => {
    const parsed = calendarDate.safeParse(date);
    if (!parsed.success) {
      setDateError("Enter a real date (YYYY-MM-DD).");
      return;
    }
    setDateError("");
    setSaving(true);
    try {
      await saveHoliday(parsed.data, input);
      await refresh();
      toast.success(
        holiday ? "Holiday override updated." : "Holiday override created.",
      );
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return { date, dateError, saving, updateDate, save };
}
