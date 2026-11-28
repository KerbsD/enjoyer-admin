import { Modal } from "@/components/ui/Modal";
import type { OrderActionPanelProps, PaymentMethod } from "@/types/staff";

export function OrderActionPanel({
  panel,
  orderNumber,
  reason,
  method,
  pending,
  error,
  onReasonChange,
  onMethodChange,
  onSubmit,
  onClose,
}: OrderActionPanelProps) {
  const form = (
    <form
      className={panel === "reject" ? "action-panel" : undefined}
      onSubmit={onSubmit}
    >
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
      {panel !== "reject" && error && (
        <p className="feature-note error" role="alert">
          {error}
        </p>
      )}
      <div className="action-row">
        <button
          className={panel === "cancel" ? "button button-danger" : "button"}
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
          {panel === "paid" ? "Back" : "Keep order"}
        </button>
      </div>
    </form>
  );

  if (panel === "reject") return form;

  return (
    <Modal
      open
      onClose={onClose}
      title={panel === "paid" ? "Record payment" : "Cancel order"}
      description={`Order #${orderNumber}`}
      size="sm"
    >
      {form}
    </Modal>
  );
}
