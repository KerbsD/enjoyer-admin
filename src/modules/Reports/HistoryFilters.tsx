import { statusLabel } from "@/lib/shop-format";
import { reportStatuses } from "@/constants/reports";
import type { HistoryFiltersProps } from "@/types/reports";
import { DateFields } from "./DateFields";

export function HistoryFilters({
  draft,
  change,
  apply,
  clear,
  tables,
  menu,
}: HistoryFiltersProps) {
  return (
    <form onSubmit={apply} className="report-controls">
      <DateFields
        from={draft.from}
        to={draft.to}
        setFrom={(v) => change("from", v)}
        setTo={(v) => change("to", v)}
      />
      <label className="field">
        <span>Table</span>
        <select
          value={draft.tableId}
          onChange={(e) => change("tableId", e.target.value)}
        >
          <option value="">All tables</option>
          {tables.map((t) => (
            <option value={t.id} key={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Item</span>
        <select
          value={draft.itemId}
          onChange={(e) => change("itemId", e.target.value)}
        >
          <option value="">All items</option>
          {menu.map((i) => (
            <option value={i.id} key={i.id}>
              {i.name}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Status</span>
        <select
          value={draft.status}
          onChange={(e) => change("status", e.target.value)}
        >
          <option value="">All statuses</option>
          {reportStatuses.map((s) => (
            <option value={s} key={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Payment</span>
        <select
          value={draft.paymentStatus}
          onChange={(e) => change("paymentStatus", e.target.value)}
        >
          <option value="">All payments</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </label>
      <label className="field">
        <span>Search</span>
        <input
          type="search"
          maxLength={100}
          value={draft.q}
          onChange={(e) => change("q", e.target.value)}
          placeholder="Order, table, or item"
        />
      </label>
      <button className="button" type="submit">
        Apply filters
      </button>
      <button className="button button-outline" type="button" onClick={clear}>
        Clear filters
      </button>
    </form>
  );
}
