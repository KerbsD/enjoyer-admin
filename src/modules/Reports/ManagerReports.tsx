import { useStaffRealtime } from "@/modules/Staff/useStaffRealtime";
import { DashboardSection } from "./DashboardSection";
import { ExportSection } from "./ExportSection";
import { HistorySection } from "./HistorySection";

export function ManagerReports() {
  useStaffRealtime();

  return (
    <div>
      <div className="page-head">
        <span className="eyebrow">ENJOYER / PERFORMANCE</span>
        <h1>
          Reports<span className="brand-dot">.</span>
        </h1>
        <p>Shop-local dates, Philippine peso totals, and order history.</p>
      </div>
      <DashboardSection />
      <HistorySection />
      <ExportSection />
    </div>
  );
}
