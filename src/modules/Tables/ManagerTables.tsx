import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { TableCard } from "./TableCard";
import { TableControls } from "./TableControls";
import { TableForm } from "./TableForm";
import { useManagerTables } from "./useManagerTables";

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
          <span className="eyebrow">ENJOYER / TABLE MANAGEMENT</span>
          <h1>
            Manage tables<span className="brand-dot">.</span>
          </h1>
          <p>
            Create physical tables, control order limits and print their QR
            codes.
          </p>
        </div>
        <span className="eyebrow" role="status">
          {transport === "sse"
            ? "● Live"
            : transport === "polling"
              ? "◌ Polling fallback"
              : "Connecting…"}
        </span>
      </div>
      <TableControls
        filter={filter}
        onFilterChange={setFilter}
        onCreate={() => setCreating(true)}
        onDownloadSheet={() => void sheet()}
        sheetPending={sheetPending}
      />

      <p className="table-help">
        The sheet contains only active tables. Open the downloaded HTML file in
        a browser and select Print. QR codes point to the API-configured{" "}
        <code>CUSTOMER_URL</code> (or <code>CLIENT_URL</code> fallback). The
        customer app is not built yet; configure and verify its{" "}
        <code>/order</code> page before printing QR codes for service.{" "}
        <Link className="text-button" href="/tables">
          View live table sessions →
        </Link>
      </p>

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
