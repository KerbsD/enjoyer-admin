import { DateFields } from "./DateFields";
import { useExportSection } from "./useExportSection";

export function ExportSection() {
  const { from, setFrom, to, setTo, error, saving, download } =
    useExportSection();

  return (
    <section className="menu-section">
      <h2>Export orders · CSV</h2>
      <p>
        Choose an inclusive Manila date range. Export includes every order in
        that range, regardless of the Order history filters. The CSV timestamps
        are UTC.
      </p>
      <form onSubmit={(e) => void download(e)} className="report-controls">
        <DateFields from={from} to={to} setFrom={setFrom} setTo={setTo} />
        <button className="button" type="submit" disabled={saving}>
          {saving ? "Downloading…" : "Download CSV"}
        </button>
      </form>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </section>
  );
}
