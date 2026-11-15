import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import {
  deactivateAccount,
  reactivateAccount,
  resendInvite,
} from "@/api/accounts";

import { ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-state";

import { accountKey } from "@/constants/account";

import type { AccountCardProps } from "@/types/accounts";

export function useAccountCard(props: AccountCardProps) {
  const { account, onNotice } = props;

  const client = useQueryClient();
  const actorId = useAuthStore((s) => s.user?.id);
  const self = actorId === account.id;
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  async function changeActive() {
    setWorking(true);
    setError("");
    try {
      const result = account.active
        ? await deactivateAccount(account.id)
        : await reactivateAccount(account.id);
      onNotice(result.message ?? "Account status updated.");
      await client.invalidateQueries({ queryKey: accountKey });
      setConfirming(false);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not change account status.",
      );
    } finally {
      setWorking(false);
    }
  }
  async function sendInvite() {
    setWorking(true);
    setError("");
    try {
      const result = await resendInvite(account.id);
      onNotice(result.message);
      await client.invalidateQueries({ queryKey: accountKey });
    } catch (cause) {
      setError(
        `${cause instanceof Error ? cause.message : "Could not resend invite."}${cause instanceof ApiError && cause.status === 502 ? " The old link may already have been replaced; wait for the email cooldown before retrying." : ""}`,
      );
      await client.invalidateQueries({ queryKey: accountKey });
    } finally {
      setWorking(false);
    }
  }

  return {
    self,
    editing,
    setEditing,
    confirming,
    setConfirming,
    working,
    error,
    changeActive,
    sendInvite,
  };
}
