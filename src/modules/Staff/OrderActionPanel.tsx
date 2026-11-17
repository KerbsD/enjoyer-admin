import type { OrderActionPanelProps, PaymentMethod } from "@/types/staff";

export function OrderActionPanel({
  panel,
  reason,
  method,
  pending,
  onReasonChange,
  onMethodChange,
  onSubmit,
  onClose,
}: OrderActionPanelProps) {
  return (
    <form className="action-panel" onSubmit={onSubmit}>
      {panel === "paid" ? (
        <label className="field">
          <span className="eyebrow">Payment method</span>
          <select
            value={method}
            onChange={(event) =>
              onMethodChange(event.target.value as PaymentMethod)
            }
          >
            <option value="cash">Cash</option>
            <option value="other">Other</option>
          </select>
        </label>
      ) : (
        <label className="field">
          <span className="eyebrow">
            {panel === "cancel" ? "Reason (required)" : "Reason (optional)"}
          </span>
          <textarea
            value={reason}
            maxLength={500}
            required={panel === "cancel"}
            onChange={(event) => onReasonChange(event.target.value)}
            rows={3}
          />
        </label>
      )}
      <div className="action-row">
        <button
          className="button"
          disabled={pending || (panel === "cancel" && !reason.trim())}
          type="submit"
        >
          {pending
            ? "Saving…"
            : panel === "paid"
              ? "Record payment"
              : panel === "reject"
                ? "Reject first order"
                : "Confirm cancellation"}
        </button>
        <button
          type="button"
          className="button button-outline"
          onClick={onClose}
        >
          Keep order
        </button>
      </div>
    </form>
  );
}
