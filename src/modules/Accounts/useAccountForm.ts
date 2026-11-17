import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import type { z } from "zod";
import { useAuthStore } from "@/lib/auth-state";

import { accountEditSchema, accountSchema } from "@/schemas/accounts";
import { accountKey } from "@/constants/account";

import { toast } from "sonner";
import { createAccount, updateAccount } from "@/api/accounts";

import type { AccountFormProps } from "@/types/accounts";

export function useAccountForm({
  account,
  onClose,
  onNotice,
}: AccountFormProps) {
  const client = useQueryClient();
  const [error, setError] = useState("");
  const actorId = useAuthStore((s) => s.user?.id);
  const self = account !== undefined && account.id === actorId;
  type Input = z.infer<typeof accountSchema>;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Input>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: account?.name ?? "",
      email: account?.email ?? "",
      role: account?.role ?? "staff",
    },
  });

  const submit = handleSubmit(async (input) => {
    setError("");
    try {
      if (account) {
        const change = accountEditSchema.parse({
          ...input,
          role: self ? account.role : input.role,
        });
        if (self && change.role !== account.role) {
          setError("You cannot change your own role.");
          return;
        }
        await updateAccount(account.id, change);
        toast.success("Account updated.");
      } else {
        const result = await createAccount(accountSchema.parse(input));
        onNotice(
          result.message ??
            (result.inviteEmailSent
              ? "Account created and invite emailed."
              : "Account created; invite email was not sent. Resend it after the email issue is fixed."),
        );
      }
      await client.invalidateQueries({ queryKey: accountKey });
      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not save account.",
      );
    }
  });

  return {
    register,
    errors,
    isSubmitting,
    error,
    self,
    submit,
  };
}
