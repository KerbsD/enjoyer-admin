import type { GroupFormProps } from "@/types/menu";
import { useGroupForm } from "./useGroupForm";

export function GroupForm({ group, onClose }: GroupFormProps) {
  const { values, updateValues, choice, updateChoice, error, saving, submit } =
    useGroupForm({ group, onClose });

  return (
    <form className="menu-editor" onSubmit={(event) => void submit(event)}>
      <div className="editor-grid">
        <label className="field">
          <span className="eyebrow">Group name</span>
          <input
            required
            maxLength={100}
            value={values.name}
            onChange={(event) => updateValues({ name: event.target.value })}
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
              updateValues({ sortOrder: Number(event.target.value) })
            }
          />
        </label>
        <label className="field">
          <span className="eyebrow">Minimum selections (0 = optional)</span>
          <input
            type="number"
            min={0}
            max={50}
            required
            value={values.minSelections}
            onChange={(event) =>
              updateValues({ minSelections: Number(event.target.value) })
            }
          />
        </label>
        <label className="field">
          <span className="eyebrow">Maximum selections</span>
          <input
            type="number"
            min={1}
            max={50}
            required
            value={values.maxSelections}
            onChange={(event) =>
              updateValues({ maxSelections: Number(event.target.value) })
            }
          />
        </label>
      </div>
      {!group && (
        <div className="editor-grid">
          <label className="field">
            <span className="eyebrow">First choice (required)</span>
            <input
              required
              maxLength={100}
              value={choice.name}
              onChange={(event) => updateChoice({ name: event.target.value })}
            />
          </label>
          <label className="field">
            <span className="eyebrow">Surcharge (PHP)</span>
            <input
              inputMode="decimal"
              value={choice.priceDelta}
              onChange={(event) =>
                updateChoice({ priceDelta: event.target.value })
              }
            />
          </label>
        </div>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="action-row">
        <button className="button" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save group"}
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
