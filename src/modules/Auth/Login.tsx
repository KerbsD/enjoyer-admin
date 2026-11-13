"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { z } from "zod";
import { login, ApiError } from "@/lib/api";
import { safeNext } from "@/lib/safe-next";
import { useAuthStore } from "@/lib/auth-state";
import { useAuthReady } from "@/components/auth/AuthProvider";
import { Field } from "@/components/ui/Field";
import { AuthFrame } from "./AuthFrame";
import { loginSchema } from "./schemas";

export default function Login() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const ready = !useAuthReady();
  const signedIn = useAuthStore((s) => !!s.user);
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof loginSchema>>({ resolver: zodResolver(loginSchema) });
  useEffect(() => { if (ready && signedIn) router.replace(next); }, [ready, signedIn, router, next]);
  if (ready && signedIn) return <div className="screen-center">Opening workspace…</div>;
  return <AuthFrame><div className="auth-card"><span className="eyebrow">WELCOME BACK</span><h2>Sign in to Enjoyer.</h2><p>Manage the shop with your staff account.</p>
    <form onSubmit={handleSubmit(async ({ email, pwd }) => { setError(""); try { await login(email, pwd); router.replace(next); } catch (cause) { setError(cause instanceof ApiError && cause.status === 401 ? "Incorrect email or password." : cause instanceof Error ? cause.message : "Sign in failed."); } })}>
      <div className="form-stack"><Field label="Email address" id="email" type="email" autoComplete="username" error={errors.email?.message} {...register("email")} /><Field label="Password" id="pwd" type="password" autoComplete="current-password" error={errors.pwd?.message} {...register("pwd")} /></div>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="button button-wide" disabled={!ready || isSubmitting}>{isSubmitting ? "Signing in…" : "Sign in →"}</button>
    </form><p><Link className="text-button" href="/forgot-password">Forgot your password?</Link></p></div></AuthFrame>;
}
