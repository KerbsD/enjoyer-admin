import type { TableActivationPanelProps } from "@/types/tables";

export function TableActivationPanel({
  active,
  saving,
  onConfirm,
  onCancel,
}: TableActivationPanelProps) {
  return (
    <div className="action-panel">
      <p>
        {active
          ? "Deactivate this table? Its QR code will no longer resolve. Existing sessions are not closed by this change."
          : "Reactivate this table? Its existing QR code will work again."}
      </p>
      <div className="action-row">
        <button
          type="button"
          className={`button ${active ? "button-danger" : ""}`}
          disabled={saving}
          onClick={onConfirm}
        >
          {saving
            ? "Saving…"
            : active
              ? "Confirm deactivation"
              : "Confirm reactivation"}
        </button>
        <button
          type="button"
          className="button button-outline"
          onClick={onCancel}
        >
          Keep as is
        </button>
      </div>
    </div>
  );
}
