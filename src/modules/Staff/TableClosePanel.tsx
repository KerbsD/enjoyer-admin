import { peso } from "@/lib/shop-format";
import type { TableClosePanelProps } from "@/types/staff";

export function TableClosePanel({
  unpaidCount,
  unpaidTotal,
  canOverride,
  confirming,
  warning,
  pending,
  onStart,
  onCancel,
  onConfirm,
}: TableClosePanelProps) {
  return (
    <div className="close-section">
      {unpaidCount > 0 && (
        <p className="error">
          <strong>
            {unpaidCount} unpaid {unpaidCount === 1 ? "order" : "orders"} ·{" "}
            {peso(unpaidTotal)}.
          </strong>{" "}
          Only a Manager or Owner may override this warning.
        </p>
      )}
      {warning && (
        <p role="alert" className="error">
          {warning}
        </p>
      )}
      {!confirming ? (
        <button
          className="button button-outline"
          type="button"
          disabled={unpaidCount > 0 && !canOverride}
          onClick={onStart}
        >
          Close table
        </button>
      ) : (
        <div className="action-panel">
          <p>
            {unpaidCount > 0
              ? `Override ${peso(unpaidTotal)} unpaid and close this table?`
              : "Close this table and reset the session?"}
          </p>
          <div className="action-row">
            <button
              className="button button-danger"
              disabled={pending || (unpaidCount > 0 && !canOverride)}
              onClick={onConfirm}
            >
              {pending
                ? "Closing…"
                : unpaidCount > 0
                  ? "Override and close"
                  : "Confirm close"}
            </button>
            <button
              className="button button-outline"
              type="button"
              onClick={onCancel}
            >
              Keep open
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
