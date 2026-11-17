import { Field } from "@/components/ui/Field";
import type { TimingsFormProps } from "@/types/settings";
import { useTimingsForm } from "./useTimingsForm";

export function TimingsForm({ settings }: TimingsFormProps) {
  const { register, errors, isSubmitting, error, submit } = useTimingsForm({
    settings,
  });

  return (
    <form className="menu-editor" onSubmit={submit}>
      <h2>Session timing</h2>
      <div className="editor-grid">
        <Field
          label="Idle table timeout (minutes)"
          id="idle-timeout"
          type="number"
          min={1}
          max={1440}
          error={errors.idleTimeoutMinutes?.message}
          {...register("idleTimeoutMinutes", { valueAsNumber: true })}
        />
        <Field
          label="First-order confirmation expiry (minutes)"
          id="confirmation-expiry"
          type="number"
          min={1}
          max={120}
          error={errors.confirmationExpiryMinutes?.message}
          {...register("confirmationExpiryMinutes", { valueAsNumber: true })}
        />
      </div>
      <p>
        Default: 180 minutes idle, 10 minutes for first-order confirmation. Shop
        timezone: <strong>{settings.shopTimezone}</strong> (read-only).
      </p>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button className="button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save timings"}
      </button>
    </form>
  );
}
