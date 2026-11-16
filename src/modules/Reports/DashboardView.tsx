import { peso, statusLabel } from "@/lib/shop-format";
import type { DashboardViewProps } from "@/types/reports";
import { Bars } from "./Bars";

export function DashboardView({ data }: DashboardViewProps) {
  return (
    <>
      <p className="report-caption">
        {data.range.from} to {data.range.to} · {data.range.timezone} · inclusive
        shop dates
      </p>
      <div className="report-metrics">
        <div>
          <span>Total orders</span>
          <strong>{data.totalOrders}</strong>
        </div>
        <div>
          <span>Paid revenue</span>
          <strong>{peso(data.revenue)}</strong>
        </div>
        <div>
          <span>Paid orders</span>
          <strong>{data.paidOrders}</strong>
        </div>
        <div>
          <span>Unpaid active orders</span>
          <strong>{data.unpaidOrders}</strong>
        </div>
      </div>
      <p className="report-caption">
        Revenue includes paid cancelled orders. Unpaid count excludes cancelled
        and rejected orders. Best sellers and peak hours exclude cancelled and
        rejected orders.
      </p>
      <div className="report-charts">
        <section>
          <h3>Order status</h3>
          {data.statusBreakdown.length ? (
            <Bars
              label="Order status"
              rows={data.statusBreakdown.map((s) => ({
                name: statusLabel(s.status),
                value: s.count,
              }))}
            />
          ) : (
            <p>No orders in this range.</p>
          )}
        </section>
        <section>
          <h3>Best sellers · quantity</h3>
          {data.bestSellers.length ? (
            <Bars
              label="Best sellers"
              rows={data.bestSellers.map((s) => ({
                name: s.name,
                value: s.quantity,
                detail: peso(s.revenue),
              }))}
            />
          ) : (
            <p>No qualifying items in this range.</p>
          )}
        </section>
        <section className="report-wide">
          <h3>Orders by hour · Manila time</h3>
          <Bars
            label="Orders by hour (24-hour shop clock)"
            rows={data.peakHours.map((h) => ({
              name: `${String(h.hour).padStart(2, "0")}:00`,
              value: h.orders,
            }))}
          />
        </section>
      </div>
    </>
  );
}
