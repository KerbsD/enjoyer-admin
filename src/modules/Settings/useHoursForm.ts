import { useState, type FormEvent } from "react";
import { daySchema } from "@/schemas/settings";
import type { HoursFormProps } from "@/types/settings";

export function useHoursForm({
  initial,
  onSave,
  acknowledge,
}: Pick<HoursFormProps, "initial" | "onSave" | "acknowledge">) {
  const [closed, setClosed] = useState(initial?.closed ?? true);
  const [openTime, setOpenTime] = useState(initial?.openTime ?? "");
  const [closeTime, setCloseTime] = useState(initial?.closeTime ?? "");
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (acknowledge && !acknowledged) {
      setError("Confirm you understand the effect on unconfigured weekdays.");
      return;
    }
    const parsed = daySchema.safeParse(
      closed ? { closed: true } : { closed: false, openTime, closeTime },
    );
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check these hours.");
      return;
    }
    void onSave(parsed.data).catch((cause) =>
      setError(
        cause instanceof Error ? cause.message : "Could not save hours.",
      ),
    );
  };

  return {
    closed,
    setClosed,
    openTime,
    setOpenTime,
    closeTime,
    setCloseTime,
    acknowledged,
    setAcknowledged,
    error,
    submit,
  };
}
