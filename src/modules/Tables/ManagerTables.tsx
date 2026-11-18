import { TableCard } from "./TableCard";
import { TableControls } from "./TableControls";
import { TableForm } from "./TableForm";
import { useManagerTables } from "./useManagerTables";

import { Modal } from "@/components/ui/Modal";
import { RealtimeStatus } from "@/components/ui/RealtimeStatus";

export function ManagerTables() {
  const {
    filter,
    setFilter,
    creating,
    setCreating,
    sheetPending,
    query,
    transport,
    visible,
    sheet,
  } = useManagerTables();

  return (
    <div>
      <div className="page-head board-heading">
        <div>
          <h1>
            Manage tables<span className="brand-dot">.</span>
          </h1>
        </div>
        <RealtimeStatus transport={transport} />
      </div>
      <TableControls
        filter={filter}
        onFilterChange={setFilter}
        onCreate={() => setCreating(true)}
        onDownloadSheet={() => void sheet()}
        sheetPending={sheetPending}
      />
      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Add physical table"
      >
        <TableForm onClose={() => setCreating(false)} />
      </Modal>
      {query.isPending && (
        <p role="status" className="feature-note">
          Loading tables…
        </p>
      )}
      {query.isError && (
        <div className="feature-note error" role="alert">
          {query.error.message}{" "}
          <button
            type="button"
            className="text-button"
            onClick={() => void query.refetch()}
          >
            Retry
          </button>
        </div>
      )}
      {visible?.length === 0 && (
        <p className="feature-note">
          {filter === "all"
            ? "No tables have been created yet."
            : "No tables match this filter."}
        </p>
      )}
      {visible && (
        <div className="managed-table-grid">
          {visible.map((table) => (
            <TableCard key={table.id} table={table} />
          ))}
        </div>
      )}
    </div>
  );
}
