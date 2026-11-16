import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { createOption, updateOption, type OptionBody } from "@/api/menu";
import { blankOption } from "@/constants/menu";
import { optionSchema } from "@/schemas/menu";
import type { ChoiceFormProps } from "@/types/menu";
import { useRefreshMenu } from "./useMenu";

export function useChoiceForm({ group, option, onClose }: ChoiceFormProps) {
  const [values, setValues] = useState<OptionBody>(
    option
      ? {
          name: option.name,
          priceDelta: option.priceDelta,
          isAvailable: option.isAvailable,
          sortOrder: option.sortOrder,
        }
      : blankOption,
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const refresh = useRefreshMenu();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const parsed = optionSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Check choice fields.");
      return;
    }
    setSaving(true);
    try {
      if (option) await updateOption(group.id, option.id, parsed.data);
      else await createOption(group.id, parsed.data);
      await refresh();
      toast.success("Choice saved.");
      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not save choice.",
      );
    } finally {
      setSaving(false);
    }
  };

  const update = (patch: Partial<OptionBody>) =>
    setValues((current) => ({ ...current, ...patch }));

  return { values, update, error, saving, submit };
}
