import type { HolidayFiltersProps } from "@/types/settings";

export function HolidayFilters({
  from,
  to,
  setFrom,
  setTo,
}: HolidayFiltersProps) {
  return (
    <div className="editor-grid holiday-filters">
      <label className="field">
        <span className="eyebrow">From date</span>
        <input
          type="date"
          value={from}
          onChange={(event) => setFrom(event.target.value)}
        />
      </label>
      <label className="field">
        <span className="eyebrow">To date</span>
        <input
          type="date"
          value={to}
          onChange={(event) => setTo(event.target.value)}
        />
      </label>
    </div>
  );
}
