"use client";

import Link from "next/link";

import { Field } from "@/components/ui/Field";
import { AuthFrame } from "@/components/layout/AuthFrame";

import { useTokenPassword } from "./useTokenPassword";

export default function TokenPassword({ invite }: { invite: boolean }) {
  const {
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
  } = useTokenPassword({ invite });

  return (
    <AuthFrame>
      <div className="auth-card">
        <span className="eyebrow">
          {invite ? "STAFF INVITATION" : "ACCOUNT RECOVERY"}
        </span>
        <h2>{invite ? "Join the team." : "Choose a new password."}</h2>
        {!hydrated ? (
          <p role="status">Checking link…</p>
        ) : !token ? (
          <p className="error" role="alert">
            This link is missing a token. Request a new link.
          </p>
        ) : done ? (
          <p className="success" role="status">
            Your password is set. You can now sign in.
          </p>
        ) : (
          <>
            <p>Choose a password of at least 12 characters.</p>
            <form onSubmit={submit}>
              <div className="form-stack">
                <Field
                  label="New password"
                  id="newPwd"
                  type="password"
                  autoComplete="new-password"
                  error={errors.newPwd?.message}
                  {...register("newPwd")}
                />
              </div>
              {(error || invalid) && (
                <p className="error" role="alert">
                  {error ||
                    (validation.error instanceof Error
                      ? validation.error.message
                      : "Invalid invitation.")}
                </p>
              )}
              <button
                className="button button-wide"
                disabled={!token || validating || invalid || isSubmitting}
              >
                {validating
                  ? "Checking link…"
                  : isSubmitting
                    ? "Saving…"
                    : "Set password →"}
              </button>
            </form>
          </>
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
