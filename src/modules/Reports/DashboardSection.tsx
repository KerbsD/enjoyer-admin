import type { DashboardPeriodChoice } from "@/types/reports";
import { DashboardView } from "./DashboardView";
import { DateFields } from "./DateFields";
import { useDashboardSection } from "./useDashboardSection";

export function DashboardSection() {
  const { period, setPeriod, from, setFrom, to, setTo, error, query, apply } =
    useDashboardSection();

  return (
    <section className="menu-section">
      <h2>Dashboard</h2>
      <form className="report-controls" onSubmit={apply}>
        <label className="field">
          <span>Period</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as DashboardPeriodChoice)}
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 shop dates</option>
            <option value="30days">Last 30 shop dates</option>
            <option value="custom">Custom dates</option>
          </select>
        </label>
        {period === "custom" && (
          <DateFields from={from} to={to} setFrom={setFrom} setTo={setTo} />
        )}
        <button className="button" type="submit">
          Show dashboard
        </button>
        <button
          className="button button-outline"
          type="button"
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
        >
          Refresh
        </button>
      </form>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {query.isPending && <p role="status">Loading dashboard…</p>}
      {query.isError && (
        <p role="alert" className="error">
          {query.error.message}{" "}
          <button className="text-button" onClick={() => void query.refetch()}>
            Retry
          </button>
        </p>
      )}
      {query.data && <DashboardView data={query.data.data} />}
    </section>
  );
}
