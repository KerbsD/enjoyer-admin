import type { BoardColumnProps } from "@/types/staff";
import { OrderCard } from "./OrderCard";

export function BoardColumn({ column, orders }: BoardColumnProps) {
  return (
    <section className="board-column" aria-label={column.title}>
      <div className="column-head">
        <h2>
          {column.title}
          <span className="column-count">· {orders.length}</span>
        </h2>
      </div>
      <div className="column-list">
        {orders.length ? (
          orders.map((order) => <OrderCard order={order} key={order.id} />)
        ) : (
          <div className="empty-column">No orders here.</div>
        )}
      </div>
    </section>
  );
}
