"use client";

import { RealtimeStatus } from "./RealtimeStatus";
import { TablePanel } from "./TablePanel";
import { TableTile } from "./TableTile";
import { useTables } from "./useTables";

export default function Tables() {
  const { setSelected, transport, overview, table } = useTables();

  if (table)
    return <TablePanel table={table} onBack={() => setSelected(null)} />;

  return (
    <div>
      <div className="page-head board-heading">
        <div>
          <span className="eyebrow">ENJOYER / FLOOR SERVICE</span>
          <h1>
            Tables<span className="brand-dot">.</span>
          </h1>
          <p>Track sessions, unpaid balances and current orders.</p>
        </div>
        <div className="board-tools">
          <RealtimeStatus transport={transport} />
          <button
            className="button button-outline"
            type="button"
            disabled={overview.isFetching}
            onClick={() => void overview.refetch()}
          >
            Refresh
          </button>
        </div>
      </div>
      {overview.isPending && (
        <p role="status" className="feature-note">
          Loading tables…
        </p>
      )}
      {overview.isError && (
        <div className="feature-note error" role="alert">
          {overview.error.message}{" "}
          <button
            className="text-button"
            onClick={() => void overview.refetch()}
          >
            Retry
          </button>
        </div>
      )}
      {overview.data && (
        <div className="table-grid">
          {overview.data.data.length ? (
            overview.data.data.map((row) => (
              <TableTile
                key={row.table.id}
                table={row}
                onOpen={() => setSelected(row.table.id)}
              />
            ))
          ) : (
            <p className="feature-note">No active tables are configured.</p>
          )}
        </div>
      )}
    </div>
  );
}
