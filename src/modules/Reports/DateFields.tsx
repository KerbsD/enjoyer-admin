import type { DateFieldsProps } from "@/types/reports";

export function DateFields({ from, to, setFrom, setTo }: DateFieldsProps) {
  return (
    <>
      <label className="field">
        <span>From (Manila date)</span>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
      </label>
      <label className="field">
        <span>To (Manila date)</span>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </label>
    </>
  );
}
