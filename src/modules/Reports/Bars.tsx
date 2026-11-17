import type { BarsProps } from "@/types/reports";

export function Bars({ rows, label }: BarsProps) {
  const max = Math.max(1, ...rows.map((row) => row.value));

  return (
    <div
      className="report-bars"
      role="img"
      aria-label={`${label}: ${rows.map((row) => `${row.name} ${row.value}`).join(", ")}`}
    >
      {rows.map((row) => (
        <div className="report-bar" key={row.name}>
          <span>{row.name}</span>
          <div className="report-track">
            <div style={{ width: `${(row.value / max) * 100}%` }} />
          </div>
          <strong>{row.value}</strong>
          {row.detail && <small>{row.detail}</small>}
        </div>
      ))}
    </div>
  );
}
