import type { InputHTMLAttributes } from "react";

export function Field({ label, error, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return <label className="field"><span className="eyebrow">{label}</span><input aria-invalid={!!error} aria-describedby={error ? `${props.id}-error` : undefined} {...props} />
    {error && <span id={`${props.id}-error`} className="field-error" role="alert">{error}</span>}</label>;
}
