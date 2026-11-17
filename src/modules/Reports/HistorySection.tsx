import { HistoryFilters } from "./HistoryFilters";
import { HistoryRow } from "./HistoryRow";
import { useHistorySection } from "./useHistorySection";

export function HistorySection() {
  const {
    draft,
    change,
    apply,
    clear,
    tables,
    menu,
    history,
    offset,
    selected,
    error,
    toggle,
    closeDetail,
    previous,
    next,
  } = useHistorySection();

  return (
    <section className="menu-section">
      <h2>Order history</h2>
      <p>
        Search order number, table name, or snapshotted item name. All statuses,
        including cancelled and rejected, appear unless filtered.
      </p>
      <HistoryFilters
        draft={draft}
        change={change}
        apply={apply}
        clear={clear}
        tables={tables.data ?? []}
        menu={menu.data ?? []}
      />
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {tables.isError && (
        <p role="alert" className="error">
          Table choices: {tables.error.message}{" "}
          <button className="text-button" onClick={() => void tables.refetch()}>
            Retry
          </button>
        </p>
      )}
      {menu.isError && (
        <p role="alert" className="error">
          Item choices: {menu.error.message}{" "}
          <button className="text-button" onClick={() => void menu.refetch()}>
            Retry
          </button>
        </p>
      )}
      {history.isPending && <p role="status">Loading history…</p>}
      {history.isError && (
        <p role="alert" className="error">
          {history.error.message}{" "}
          <button
            className="text-button"
            onClick={() => void history.refetch()}
          >
            Retry
          </button>
        </p>
      )}
      {history.data && (
        <>
          <p className="report-caption">
            {history.data.pagination.total} orders ·{" "}
            {history.data.range
              ? `${history.data.range.from} to ${history.data.range.to} (${history.data.range.timezone})`
              : "All dates"}
          </p>
          {history.data.data.length === 0 ? (
            <p>No orders match these filters.</p>
          ) : (
            <div className="report-history">
              {history.data.data.map((order) => (
                <HistoryRow
                  key={order.id}
                  order={order}
                  expanded={selected === order.id}
                  onToggle={() => toggle(order.id)}
                  onCloseDetail={closeDetail}
                />
              ))}
            </div>
          )}
          <div className="report-pagination">
            <button
              className="button button-outline"
              type="button"
              disabled={offset === 0}
              onClick={previous}
            >
              Previous
            </button>
            <span>
              Showing {history.data.pagination.total ? offset + 1 : 0}–
              {offset + history.data.data.length} of{" "}
              {history.data.pagination.total}
            </span>
            <button
              className="button button-outline"
              type="button"
              disabled={!history.data.pagination.hasMore}
              onClick={next}
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  );
}
