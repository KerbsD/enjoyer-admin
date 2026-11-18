import { useStaffRealtime } from "@/modules/Staff/useStaffRealtime";
import { DashboardSection } from "./DashboardSection";
import { ExportSection } from "./ExportSection";
import { HistorySection } from "./HistorySection";

export function ManagerReports() {
  useStaffRealtime();

  return (
    <div>
      <div className="page-head">
        <h1>
          Reports<span className="brand-dot">.</span>
        </h1>
      </div>
      <DashboardSection />
      <HistorySection />
      <ExportSection />
    </div>
  );
}
