"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { forgotPassword } from "@/lib/api";
import { Field } from "@/components/ui/Field";
import { AuthFrame } from "../../components/layout/AuthFrame";
import { emailSchema } from "./schemas";

export default function ForgotPassword() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
  });
  return (
    <AuthFrame>
      <div className="auth-card">
        <span className="eyebrow">ACCOUNT RECOVERY</span>
        <h2>Reset your password.</h2>
        <p>We’ll email a reset link if your account is eligible.</p>
        {message ? (
          <p className="success" role="status">
            {message}
          </p>
        ) : (
          <form
            onSubmit={handleSubmit(async ({ email }) => {
              setError("");
              try {
                const response = await forgotPassword(email);
                setMessage(response.message);
              } catch (cause) {
                setError(
                  cause instanceof Error
                    ? cause.message
                    : "Could not send the reset link.",
                );
              }
            })}
          >
            <div className="form-stack">
              <Field
                label="Email address"
                id="email"
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                {...register("email")}
              />
            </div>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <button className="button button-wide" disabled={isSubmitting}>
              {isSubmitting ? "Sending…" : "Send reset link →"}
            </button>
          </form>
        )}
        <p>
          <Link className="text-button" href="/login">
            Back to sign in
          </Link>
        </p>
      </div>
    </AuthFrame>
  );
}
