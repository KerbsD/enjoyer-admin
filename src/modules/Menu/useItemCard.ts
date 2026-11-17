import { useState } from "react";
import { toast } from "sonner";
import { setAvailability, updateItem, type MenuItem } from "@/api/menu";
import { useRefreshMenu } from "./useMenu";

export function useItemCard(item: MenuItem) {
  const refresh = useRefreshMenu();
  const [editing, setEditing] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function mutate(action: () => Promise<unknown>) {
    setSaving(true);
    setError("");
    try {
      await action();
      await refresh();
      toast.success("Item updated.");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not update item.",
      );
    } finally {
      setSaving(false);
    }
  }

  const openEditor = () => {
    setEditing(true);
    setAssigning(false);
  };
  const closeEditor = () => setEditing(false);
  const openAssignments = () => {
    setAssigning(true);
    setEditing(false);
  };
  const closeAssignments = () => setAssigning(false);

  return {
    editing,
    assigning,
    saving,
    error,
    openEditor,
    closeEditor,
    openAssignments,
    closeAssignments,
    toggleAvailability: () =>
      mutate(() => setAvailability(item.id, !item.isAvailable)),
    toggleHidden: () =>
      mutate(() => updateItem(item.id, { isHidden: !item.isHidden })),
  };
}
