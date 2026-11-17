import type { BoardHeaderProps } from "@/types/staff";
import { RealtimeStatus } from "./RealtimeStatus";

export function BoardHeader({
  transport,
  sound,
  fetching,
  onToggleSound,
  onRefresh,
}: BoardHeaderProps) {
  return (
    <div className="page-head board-heading">
      <div>
        <span className="eyebrow">ENJOYER / LIVE SERVICE</span>
        <h1>
          Live orders<span className="brand-dot">.</span>
        </h1>
        <p>Oldest first. Times shown in Manila.</p>
      </div>
      <div className="board-tools">
        <RealtimeStatus transport={transport} />
        <button
          type="button"
          className="button button-outline"
          onClick={onToggleSound}
          aria-pressed={sound}
        >
          {sound ? "Sound on" : "Enable sound"}
        </button>
        <button
          type="button"
          className="button button-outline"
          disabled={fetching}
          onClick={onRefresh}
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
