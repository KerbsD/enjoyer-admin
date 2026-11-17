import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { exportOrders } from "@/api/reports";
import { saveAttachment } from "@/lib/save-attachment";
import { rangeError, rangeOf } from "@/schemas/reports";

export function useExportSection() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function download(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const message = rangeError(from, to, true);
    if (message) {
      setError(message);
      return;
    }
    setError("");
    setSaving(true);
    try {
      saveAttachment(
        await exportOrders(rangeOf(from, to)),
        `enjoyer-orders-${from}-to-${to}.csv`,
      );
      toast.success("CSV download started.");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not download CSV.",
      );
    } finally {
      setSaving(false);
    }
  }

  return { from, setFrom, to, setTo, error, saving, download };
}
