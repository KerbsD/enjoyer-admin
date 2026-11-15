"use client";

import Link from "next/link";

import { Field } from "@/components/ui/Field";
import { AuthFrame } from "@/components/layout/AuthFrame";

import { useForgotPassword } from "./useForgotPassword";

export default function ForgotPassword() {
  const { register, errors, isSubmitting, message, error, submit } =
    useForgotPassword();

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
          <form onSubmit={submit}>
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
