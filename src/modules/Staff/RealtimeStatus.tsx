import type { StaffTransport } from "@/types/staff";

export function RealtimeStatus({ transport }: { transport: StaffTransport }) {
  return (
    <span className="eyebrow" role="status">
      {transport === "sse"
        ? "● Live"
        : transport === "polling"
          ? "◌ Polling fallback"
          : transport === "ended"
            ? "Connection ended"
            : "Connecting…"}
    </span>
  );
}
