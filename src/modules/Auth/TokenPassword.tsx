"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { acceptInvite, resetPassword, validateInvite } from "@/lib/api";
import { Field } from "@/components/ui/Field";
import { AuthFrame } from "./AuthFrame";
import { passwordSchema } from "./schemas";
import { useHashToken, useHydrated } from "@/lib/use-hash";

export default function TokenPassword({ invite }: { invite: boolean }) {
  const token = useHashToken();
  const hydrated = useHydrated();
  const [error, setError] = useState(""); const [done, setDone] = useState(false);
  const validation = useQuery({ queryKey: ["invite", token], queryFn: () => validateInvite(token), enabled: invite && !!token, retry: false });
  const invalid = invite && validation.isError;
  const validating = invite && validation.isPending && !!token;
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema) });
  return <AuthFrame><div className="auth-card"><span className="eyebrow">{invite ? "STAFF INVITATION" : "ACCOUNT RECOVERY"}</span><h2>{invite ? "Join the team." : "Choose a new password."}</h2>
    {!hydrated ? <p role="status">Checking link…</p> : !token ? <p className="error" role="alert">This link is missing a token. Request a new link.</p> : done ? <p className="success" role="status">Your password is set. You can now sign in.</p> : <><p>Choose a password of at least 12 characters.</p>
      <form onSubmit={handleSubmit(async ({ newPwd }) => { if (!token) return; setError(""); try { await (invite ? acceptInvite(token, newPwd) : resetPassword(token, newPwd)); setDone(true); } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not set password."); } })}>
        <div className="form-stack"><Field label="New password" id="newPwd" type="password" autoComplete="new-password" error={errors.newPwd?.message} {...register("newPwd")} /></div>
        {(error || invalid) && <p className="error" role="alert">{error || (validation.error instanceof Error ? validation.error.message : "Invalid invitation.")}</p>}<button className="button button-wide" disabled={!token || validating || invalid || isSubmitting}>{validating ? "Checking link…" : isSubmitting ? "Saving…" : "Set password →"}</button>
      </form></>}
    <p><Link className="text-button" href="/login">Back to sign in</Link></p></div></AuthFrame>;
}
