"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { boardColumns } from "@/constants/staff";
import { BoardColumn } from "./BoardColumn";
import { BoardHeader } from "./BoardHeader";
import { NewOrdersBanner } from "./NewOrdersBanner";
import { OrderCard } from "./OrderCard";
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
  const [servedOpen, setServedOpen] = useState(false);
  const served = orders.filter((order) => order.status === "served");

  return (
    <div className="board-page">
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
        <div className="board-panel">
          <div className="board-columns">
            {boardColumns.map((column) => (
              <BoardColumn
                column={column}
                key={column.status}
                orders={orders.filter(
                  (order) => order.status === column.status,
                )}
              />
            ))}
          </div>
          <footer className="board-footer">
            <button
              type="button"
              className="board-served"
              aria-haspopup="dialog"
              onClick={() => setServedOpen(true)}
            >
              <span>
                Served <span className="mono">· {served.length}</span>
              </span>
              <ChevronRight size={16} aria-hidden="true" />
            </button>
            <span className="board-hint">Tap a card to open its details.</span>
          </footer>
        </div>
      )}
      <Modal
        open={servedOpen}
        onClose={() => setServedOpen(false)}
        title="Served orders"
        description="Orders from active table sessions that have already been served."
        size="lg"
      >
        {served.length ? (
          <div className="served-order-grid">
            {served.map((order) => (
              <OrderCard order={order} key={order.id} />
            ))}
          </div>
        ) : (
          <p>No served orders in active sessions.</p>
        )}
      </Modal>
    </div>
  );
}
