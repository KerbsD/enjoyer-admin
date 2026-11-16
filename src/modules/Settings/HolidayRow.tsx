import type { HolidayRowProps } from "@/types/settings";

export function HolidayRow({
  holiday,
  removing,
  saving,
  onEdit,
  onAskRemove,
  onCancelRemove,
  onConfirmRemove,
}: HolidayRowProps) {
  return (
    <div className="holiday-row">
      <div>
        <strong>{holiday.date}</strong>
        <span>
          {holiday.closed
            ? "Closed all day"
            : `${holiday.openTime}–${holiday.closeTime} · Manila time`}
        </span>
      </div>
      <div className="action-row">
        <button
          type="button"
          className="button button-outline"
          onClick={onEdit}
        >
          Edit
        </button>
        <button
          type="button"
          className="button button-outline"
          onClick={onAskRemove}
        >
          Remove
        </button>
      </div>
      {removing && (
        <div className="action-panel holiday-confirm">
          <p>
            Remove the override on {holiday.date}? Its normal weekday schedule
            will apply.
          </p>
          <div className="action-row">
            <button
              type="button"
              className="button button-danger"
              disabled={saving}
              onClick={onConfirmRemove}
            >
              {saving ? "Removing…" : "Confirm removal"}
            </button>
            <button
              type="button"
              className="button button-outline"
              onClick={onCancelRemove}
            >
              Keep override
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
