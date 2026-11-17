import type { HoursFormProps } from "@/types/settings";
import { useHoursForm } from "./useHoursForm";

export function HoursForm({
  initial,
  saving,
  onSave,
  onCancel,
  acknowledge,
}: HoursFormProps) {
  const {
    closed,
    setClosed,
    openTime,
    setOpenTime,
    closeTime,
    setCloseTime,
    acknowledged,
    setAcknowledged,
    error,
    submit,
  } = useHoursForm({ initial, onSave, acknowledge });

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
