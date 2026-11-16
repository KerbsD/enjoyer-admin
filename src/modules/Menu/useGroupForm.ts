import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { createGroup, updateGroup } from "@/api/menu";
import { blankGroup, blankOption } from "@/constants/menu";
import { groupSchema, optionSchema } from "@/schemas/menu";
import type { GroupFormProps } from "@/types/menu";
import { useRefreshMenu } from "./useMenu";

export function useGroupForm({ group, onClose }: GroupFormProps) {
  const [values, setValues] = useState(
    group
      ? {
          name: group.name,
          minSelections: group.minSelections,
          maxSelections: group.maxSelections,
          sortOrder: group.sortOrder,
        }
      : blankGroup,
  );
  const [choice, setChoice] = useState(blankOption);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const refresh = useRefreshMenu();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const parsed = groupSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Check selections.");
      return;
    }
    const initial = group ? null : optionSchema.safeParse(choice);
    if (initial && !initial.success) {
      setError(initial.error.issues[0]?.message || "Add a choice.");
      return;
    }
    if (!group && parsed.data.minSelections > 1) {
      setError(
        "Create with a minimum of at most one; add choices before increasing it.",
      );
      return;
    }
    setSaving(true);
    try {
      if (group) await updateGroup(group.id, parsed.data);
      else if (initial?.success)
        await createGroup({ ...parsed.data, options: [initial.data] });
      await refresh();
      toast.success(group ? "Group updated." : "Group created.");
      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not save group.",
      );
    } finally {
      setSaving(false);
    }
  };

  const updateValues = (patch: Partial<typeof values>) =>
    setValues((current) => ({ ...current, ...patch }));
  const updateChoice = (patch: Partial<typeof choice>) =>
    setChoice((current) => ({ ...current, ...patch }));

  return { values, updateValues, choice, updateChoice, error, saving, submit };
}
