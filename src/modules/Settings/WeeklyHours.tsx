import { useWeeklyHours } from "./useWeeklyHours";
import { WeeklyDayRow } from "./WeeklyDayRow";

export function WeeklyHours() {
  const { query, editing, setEditing, saving, firstConfiguration, save } =
    useWeeklyHours();

  return (
    <section className="menu-section">
      <div className="section-heading">
        <div>
          <h2>Weekly opening hours</h2>
          <p>
            Sunday = day 0 through Saturday = day 6. Enter 24-hour times in
            Asia/Manila; overnight hours are not supported.
          </p>
        </div>
      </div>
      {firstConfiguration && query.data && (
        <p className="hours-warning" role="note">
          <strong>Hours are not configured.</strong> Ordering is currently
          unrestricted. Saving the first weekday switches ordering to the weekly
          schedule: every weekday not yet configured will be treated as closed.
          Configure each day you intend to open.
        </p>
      )}
      {query.isPending && <p role="status">Loading weekly hours…</p>}
      {query.isError && (
        <p className="error" role="alert">
          {query.error.message}{" "}
          <button
            type="button"
            className="text-button"
            onClick={() => void query.refetch()}
          >
            Retry
          </button>
        </p>
      )}
      {query.data?.data.map((day) => (
        <WeeklyDayRow
          key={day.dayOfWeek}
          day={day}
          editing={editing === day.dayOfWeek}
          saving={saving}
          firstConfiguration={firstConfiguration}
          onEdit={() => setEditing(day.dayOfWeek)}
          onClose={() => setEditing(null)}
          onSave={(input) => save(day.dayOfWeek, input)}
        />
      ))}
    </section>
  );
}
