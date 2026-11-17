import { shopTime } from "@/lib/shop-format";
import { useStatusPanel } from "./useStatusPanel";

export function StatusPanel() {
  const status = useStatusPanel();

  return (
    <section className="store-status" aria-label="Current shop status">
      <div className="section-heading">
        <h2>Current shop status</h2>
        <button
          type="button"
          className="button button-outline"
          disabled={status.isFetching}
          onClick={() => void status.refetch()}
        >
          Refresh status
        </button>
      </div>
      {status.isPending && <p role="status">Loading shop status…</p>}
      {status.isError && (
        <p className="error" role="alert">
          {status.error.message}
        </p>
      )}
      {status.data && (
        <>
          <strong>
            {!status.data.data.configured &&
            status.data.data.today.source === "unconfigured"
              ? "Hours not configured — ordering is unrestricted"
              : status.data.data.isOpen
                ? "Open for ordering"
                : "Closed for ordering"}
          </strong>
          <p>
            Shop date and time: {status.data.data.localDate} ·{" "}
            {status.data.data.localTime} ({status.data.data.timezone}).
          </p>
          {status.data.data.nextOpen && (
            <p>Next opening: {shopTime(status.data.data.nextOpen)}</p>
          )}
          {status.data.data.closesAt && (
            <p>Closes: {shopTime(status.data.data.closesAt)}</p>
          )}
        </>
      )}
    </section>
  );
}
