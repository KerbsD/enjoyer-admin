import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { downloadQr, updateTable, type QrFormat } from "@/api/tables";
import { staffKeys } from "@/constants/staff";
import { saveAttachment } from "@/lib/save-attachment";
import type { TableCardProps } from "@/types/tables";

export function useTableCard({ table }: TableCardProps) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState<QrFormat | null>(null);
  const target = new URL(table.qrUrl);

  const saveQr = async (format: QrFormat) => {
    setDownloading(format);
    try {
      saveAttachment(
        await downloadQr(table.id, format),
        `table-${table.id}.${format}`,
      );
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Could not download QR code.",
      );
    } finally {
      setDownloading(null);
    }
  };

  const changeActivation = async () => {
    setSaving(true);
    try {
      await updateTable(table.id, { active: !table.active });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: staffKeys.managedTables }),
        queryClient.invalidateQueries({ queryKey: staffKeys.tables }),
      ]);
      toast.success(
        table.active
          ? `${table.name} deactivated.`
          : `${table.name} reactivated.`,
      );
      setConfirming(false);
    } catch (cause) {
      toast.error(
        cause instanceof Error
          ? cause.message
          : "Could not change table status.",
      );
    } finally {
      setSaving(false);
    }
  };

  const openEdit = () => {
    setEditing(true);
    setConfirming(false);
  };

  const toggleConfirming = () => {
    setConfirming((current) => !current);
    setEditing(false);
  };

  return {
    editing,
    confirming,
    saving,
    downloading,
    target,
    saveQr,
    changeActivation,
    openEdit,
    toggleConfirming,
    closeEdit: () => setEditing(false),
    cancelConfirm: () => setConfirming(false),
  };
}
