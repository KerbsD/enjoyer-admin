import { Modal } from "@/components/ui/Modal";
import { daysOfWeek } from "@/constants/settings";
import type { WeeklyDayRowProps } from "@/types/settings";
import { HoursForm } from "./HoursForm";

export function WeeklyDayRow({
  day,
  editing,
  saving,
  firstConfiguration,
  onEdit,
  onClose,
  onSave,
}: WeeklyDayRowProps) {
  return (
    <div className="weekly-day">
      <div>
        <strong>{daysOfWeek[day.dayOfWeek]}</strong>
        <span>
          {day.configured
            ? day.closed
              ? "Closed"
              : `${day.openTime}–${day.closeTime} · Manila time`
            : "Not set — treated closed once weekly hours are configured"}
        </span>
      </div>
      <button type="button" className="button button-outline" onClick={onEdit}>
        {day.configured ? "Edit" : "Set hours"}
      </button>
      {editing && (
        <Modal
          open
          onClose={onClose}
          title={`${daysOfWeek[day.dayOfWeek]} hours`}
        >
          <HoursForm
            key={day.dayOfWeek}
            initial={day}
            saving={saving}
            onSave={onSave}
            onCancel={onClose}
            acknowledge={
              firstConfiguration
                ? "I understand that saving the first day makes every other unconfigured weekday closed."
                : undefined
            }
          />
        </Modal>
      )}
    </div>
  );
}
