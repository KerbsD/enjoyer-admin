import type { HolidayEditorProps } from "@/types/settings";
import { HoursForm } from "./HoursForm";
import { useHolidayEditor } from "./useHolidayEditor";

export function HolidayEditor({ holiday, onClose }: HolidayEditorProps) {
  const { date, dateError, saving, updateDate, save } = useHolidayEditor({
    holiday,
    onClose,
  });

  return (
    <div className="holiday-editor">
      <label className="field">
        <span className="eyebrow">Date (Manila calendar)</span>
        <input
          type="date"
          value={date}
          disabled={!!holiday}
          onChange={(event) => updateDate(event.target.value)}
        />
      </label>
      {dateError && (
        <p className="error" role="alert">
          {dateError}
        </p>
      )}
      {holiday && (
        <p>
          To move an override to a different date, remove it and create a new
          one.
        </p>
      )}
      <HoursForm
        key={holiday?.date ?? "new"}
        initial={holiday}
        saving={saving}
        onSave={save}
        onCancel={onClose}
      />
    </div>
  );
}
