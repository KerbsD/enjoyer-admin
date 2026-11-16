"use client";

import { useState, type FormEvent } from "react";
import { daySchema } from "./schemas";
import type { HoursInput } from "@/api/settings";

type Initial = {
  closed: boolean;
  openTime: string | null;
  closeTime: string | null;
};

export function HoursForm({
  initial,
  saving,
  onSave,
  onCancel,
  acknowledge,
}: {
  initial?: Initial;
  saving: boolean;
  onSave: (input: HoursInput) => Promise<void>;
  onCancel: () => void;
  acknowledge?: string;
}) {
  const [closed, setClosed] = useState(initial?.closed ?? true);
  const [openTime, setOpenTime] = useState(initial?.openTime ?? "");
  const [closeTime, setCloseTime] = useState(initial?.closeTime ?? "");
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (acknowledge && !acknowledged) {
      setError("Confirm you understand the effect on unconfigured weekdays.");
      return;
    }
    const parsed = daySchema.safeParse(
      closed ? { closed: true } : { closed: false, openTime, closeTime },
    );
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check these hours.");
      return;
    }
    void onSave(parsed.data).catch((cause) =>
      setError(
        cause instanceof Error ? cause.message : "Could not save hours.",
      ),
    );
  };
  return (
    <form className="menu-editor hours-form" onSubmit={submit}>
      <label className="check-item">
        <input
          type="checkbox"
          checked={closed}
          onChange={(event) => setClosed(event.target.checked)}
        />{" "}
        Closed all day
      </label>
      {!closed && (
        <div className="editor-grid">
          <label className="field">
            <span className="eyebrow">Opens at (Manila time)</span>
            <input
              type="time"
              step={60}
              required
              value={openTime}
              onChange={(event) => setOpenTime(event.target.value)}
            />
          </label>
          <label className="field">
            <span className="eyebrow">Closes at (Manila time)</span>
            <input
              type="time"
              step={60}
              required
              value={closeTime}
              onChange={(event) => setCloseTime(event.target.value)}
            />
          </label>
        </div>
      )}
      {acknowledge && (
        <label className="check-item warning-check">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(event) => setAcknowledged(event.target.checked)}
          />
          <span>{acknowledge}</span>
        </label>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="action-row">
        <button className="button" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save hours"}
        </button>
        <button
          className="button button-outline"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
