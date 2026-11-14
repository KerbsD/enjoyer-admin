"use client";

import { useId, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

export function Field({
  label,
  error,
  id,
  type = "text",
  disabled,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  const fallbackId = useId();
  const inputId = id ?? fallbackId;
  const errorId = error ? `${inputId}-error` : undefined;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="field">
      <label className="eyebrow" htmlFor={inputId}>
        {label}
      </label>
      <div
        className={isPassword ? "field-control has-toggle" : "field-control"}
      >
        <input
          aria-invalid={!!error}
          aria-describedby={errorId}
          {...props}
          id={inputId}
          type={isPassword && showPassword ? "text" : type}
          disabled={disabled}
        />
        {isPassword && (
          <button
            type="button"
            className="field-toggle"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-controls={inputId}
            disabled={disabled}
            onClick={() => setShowPassword((visible) => !visible)}
          >
            {showPassword ? (
              <EyeOff size={18} aria-hidden="true" />
            ) : (
              <Eye size={18} aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {error && (
        <span id={errorId} className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
