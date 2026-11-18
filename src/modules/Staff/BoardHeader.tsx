import type { BoardHeaderProps } from "@/types/staff";
import { RealtimeStatus } from "@/components/ui/RealtimeStatus";

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
        <h1>
          Live orders<span className="brand-dot">.</span>
        </h1>
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
