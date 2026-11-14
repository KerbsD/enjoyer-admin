"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { z } from "zod";
import { login, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-state";
import { useAuthReady } from "@/components/auth/AuthProvider";
import { safeNext } from "@/lib/safe-next";
import { loginSchema } from "./schemas";

export function useLogin() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  // useAuthReady() reports whether session restoration is still in progress.
  const initializing = useAuthReady();
  const ready = !initializing;
  const signedIn = useAuthStore((s) => !!s.user);
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (ready && signedIn) router.replace(next);
  }, [ready, signedIn, router, next]);

  const submit = handleSubmit(async ({ email, pwd }) => {
    setFormError("");
    try {
      await login(email, pwd);
    } catch (cause) {
      setFormError(
        cause instanceof ApiError && cause.status === 401
          ? "Incorrect email or password."
          : cause instanceof Error
            ? cause.message
            : "Sign in failed.",
      );
    }
  });

  return {
    register,
    errors,
    isSubmitting,
    formError,
    signedIn,
    ready,
    submit,
  };
}
