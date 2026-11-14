"use client";

import Link from "next/link";
import { Field } from "@/components/ui/Field";
import { AuthFrame } from "../../components/layout/AuthFrame";
import { useLogin } from "./useLogin";

export default function Login() {
  const { register, errors, isSubmitting, formError, signedIn, ready, submit } =
    useLogin();

  if (ready && signedIn)
    return <div className="screen-center">Opening workspace…</div>;

  return (
    <AuthFrame>
      <div className="auth-card">
        <span className="eyebrow">WELCOME BACK</span>
        <h2>Sign in to Enjoyer.</h2>
        <p>Manage the shop with your staff account.</p>
        <form onSubmit={submit}>
          <div className="form-stack">
            <Field
              label="Email address"
              id="email"
              type="email"
              autoComplete="username"
              error={errors.email?.message}
              {...register("email")}
            />
            <Field
              label="Password"
              id="pwd"
              type="password"
              autoComplete="current-password"
              error={errors.pwd?.message}
              {...register("pwd")}
            />
          </div>
          {formError && (
            <p className="error" role="alert">
              {formError}
            </p>
          )}
          <button
            className="button button-wide"
            disabled={!ready || isSubmitting}
          >
            {isSubmitting ? "Signing in…" : "Sign in →"}
          </button>
        </form>
        <p>
          <Link className="text-button" href="/forgot-password">
            Forgot your password?
          </Link>
        </p>
      </div>
    </AuthFrame>
  );
}
