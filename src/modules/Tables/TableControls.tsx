import { tableFilterOptions, type TableFilter } from "@/constants/tables";
import type { TableControlsProps } from "@/types/tables";

export function TableControls({
  filter,
  onFilterChange,
  onCreate,
  onDownloadSheet,
  sheetPending,
}: TableControlsProps) {
  return (
    <div className="table-manage-controls">
      <label className="field">
        <span className="eyebrow">Table status</span>
        <select
          value={filter}
          onChange={(event) =>
            onFilterChange(event.target.value as TableFilter)
          }
        >
          {tableFilterOptions.map(({ value, label }) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <button type="button" className="button" onClick={onCreate}>
        Add table
      </button>
      <button
        type="button"
        className="button button-outline"
        disabled={sheetPending}
        onClick={onDownloadSheet}
      >
        {sheetPending ? "Downloading…" : "Download printable QR sheet"}
      </button>
    </div>
  );
}
