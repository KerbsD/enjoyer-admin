import { Modal } from "@/components/ui/Modal";
import { HolidayEditor } from "./HolidayEditor";
import { HolidayFilters } from "./HolidayFilters";
import { HolidayRow } from "./HolidayRow";
import { useHolidays } from "./useHolidays";

export function Holidays() {
  const {
    query,
    editing,
    setEditing,
    removing,
    setRemoving,
    saving,
    from,
    setFrom,
    to,
    setTo,
    selected,
    shown,
    remove,
  } = useHolidays();

  return (
    <section className="menu-section">
      <div className="section-heading">
        <div>
          <h2>Holiday overrides</h2>
          <p>
            One date overrides its usual weekday hours. Removing it returns to
            the weekly schedule.
          </p>
        </div>
        <button
          type="button"
          className="button"
          onClick={() => setEditing("new")}
        >
          Add date override
        </button>
      </div>
      <HolidayFilters from={from} to={to} setFrom={setFrom} setTo={setTo} />
      {query.isPending && <p role="status">Loading holiday overrides…</p>}
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
      {shown?.length === 0 && <p>No holiday overrides match these dates.</p>}
      {shown?.map((holiday) => (
        <HolidayRow
          key={holiday.date}
          holiday={holiday}
          removing={removing === holiday.date}
          saving={saving}
          onEdit={() => setEditing(holiday.date)}
          onAskRemove={() => setRemoving(holiday.date)}
          onCancelRemove={() => setRemoving(null)}
          onConfirmRemove={() => void remove(holiday.date)}
        />
      ))}
      {editing !== null && (editing === "new" || selected) && (
        <Modal
          open
          onClose={() => setEditing(null)}
          title={
            selected ? `Override for ${selected.date}` : "New date override"
          }
        >
          <HolidayEditor
            key={editing}
            holiday={selected}
            onClose={() => setEditing(null)}
          />
        </Modal>
      )}
    </section>
  );
}
