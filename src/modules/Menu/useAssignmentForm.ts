import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { assignGroups } from "@/api/menu";
import type { AssignmentFormProps } from "@/types/menu";
import { useRefreshMenu } from "./useMenu";

export function useAssignmentForm({
  item,
  initialIds,
  onClose,
}: AssignmentFormProps & { initialIds: number[] }) {
  const [selected, setSelected] = useState(initialIds);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const refresh = useRefreshMenu();

  const toggle = (groupId: number, checked: boolean) =>
    setSelected((ids) =>
      checked ? [...ids, groupId] : ids.filter((value) => value !== groupId),
    );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await assignGroups(item.id, selected);
      await refresh();
      toast.success("Add-ons updated.");
      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not save add-ons.",
      );
    } finally {
      setSaving(false);
    }
  };

  return { selected, toggle, saving, error, submit };
}
