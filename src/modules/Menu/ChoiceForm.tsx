import type { ChoiceFormProps } from "@/types/menu";
import { useChoiceForm } from "./useChoiceForm";

export function ChoiceForm({ group, option, onClose }: ChoiceFormProps) {
  const { values, update, error, saving, submit } = useChoiceForm({
    group,
    option,
    onClose,
  });

  return (
    <form className="menu-editor" onSubmit={(event) => void submit(event)}>
      <div className="editor-grid">
        <label className="field">
          <span className="eyebrow">Choice name</span>
          <input
            required
            maxLength={100}
            value={values.name}
            onChange={(event) => update({ name: event.target.value })}
          />
        </label>
        <label className="field">
          <span className="eyebrow">Surcharge (PHP)</span>
          <input
            inputMode="decimal"
            value={values.priceDelta}
            onChange={(event) => update({ priceDelta: event.target.value })}
          />
        </label>
        <label className="field">
          <span className="eyebrow">Position</span>
          <input
            type="number"
            min={0}
            max={2_147_483_647}
            required
            value={values.sortOrder}
            onChange={(event) =>
              update({ sortOrder: Number(event.target.value) })
            }
          />
        </label>
      </div>
      <label className="check-item">
        <input
          type="checkbox"
          checked={values.isAvailable}
          onChange={(event) => update({ isAvailable: event.target.checked })}
        />{" "}
        Available for orders
      </label>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="action-row">
        <button className="button" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save choice"}
        </button>
        <button
          className="button button-outline"
          type="button"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
