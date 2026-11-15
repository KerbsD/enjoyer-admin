import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { acceptInvite, resetPassword, validateInvite } from "@/lib/api";

import { passwordSchema } from "@/schemas/auth";
import { useHashToken, useHydrated } from "@/lib/use-hash";

export function useTokenPassword({ invite }: { invite: boolean }) {
  const token = useHashToken();
  const hydrated = useHydrated();
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const validation = useQuery({
    queryKey: ["invite", token],
    queryFn: () => validateInvite(token),
    enabled: invite && !!token,
    retry: false,
  });
  const invalid = invite && validation.isError;
  const validating = invite && validation.isPending && !!token;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
  });

  const submit = handleSubmit(async ({ newPwd }) => {
    if (!token) return;
    setError("");
    try {
      await (invite
        ? acceptInvite(token, newPwd)
        : resetPassword(token, newPwd));
      setDone(true);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not set password.",
      );
    }
  });

  return {
    token,
    hydrated,
    error,
    done,
    validation,
    invalid,
    validating,
    register,
    errors,
    isSubmitting,
    submit,
  };
}
