"use client";

import { boardColumns } from "@/constants/staff";
import { BoardColumn } from "./BoardColumn";
import { BoardHeader } from "./BoardHeader";
import { NewOrdersBanner } from "./NewOrdersBanner";
import { useBoard } from "./useBoard";

export default function Board() {
  const {
    sound,
    arrivals,
    transport,
    board,
    orders,
    toggleSound,
    dismissArrivals,
  } = useBoard();

  return (
    <div>
      <BoardHeader
        transport={transport}
        sound={sound}
        fetching={board.isFetching}
        onToggleSound={toggleSound}
        onRefresh={() => void board.refetch()}
      />
      {arrivals.length > 0 && (
        <NewOrdersBanner orders={arrivals} onDismiss={dismissArrivals} />
      )}
      {board.isPending && (
        <p role="status" className="feature-note">
          Loading live orders…
        </p>
      )}
      {board.isError && (
        <div className="feature-note error" role="alert">
          {board.error.message}{" "}
          <button className="text-button" onClick={() => void board.refetch()}>
            Try again
          </button>
        </div>
      )}
      {board.data && (
        <div className="board-columns">
          {boardColumns.map((column) => (
            <BoardColumn
              column={column}
              key={column.status}
              orders={orders.filter((order) => order.status === column.status)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
