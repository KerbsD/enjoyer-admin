import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { updateSettings } from "@/api/settings";
import { timingsSchema } from "@/schemas/settings";
import type { TimingsFormProps } from "@/types/settings";
import { useRefreshSettings } from "./useSettings";

export function useTimingsForm({ settings }: TimingsFormProps) {
  const refresh = useRefreshSettings();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof timingsSchema>>({
    resolver: zodResolver(timingsSchema),
    defaultValues: settings,
  });

  const submit = handleSubmit(async (input) => {
    setError("");
    try {
      await updateSettings(input);
      await refresh();
      toast.success("Shop settings saved.");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not save settings.",
      );
    }
  });

  return { register, errors, isSubmitting, error, submit };
}
