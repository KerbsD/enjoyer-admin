import { useId, useState } from "react";
import { useStaffRealtime } from "@/modules/Staff/useStaffRealtime";
import { DashboardSection } from "./DashboardSection";
import { ExportSection } from "./ExportSection";
import { HistorySection } from "./HistorySection";

const reportSections = [
  { value: "dashboard", label: "Dashboard", Section: DashboardSection },
  { value: "history", label: "Order history", Section: HistorySection },
  { value: "export", label: "Export CSV", Section: ExportSection },
] as const;

export function ManagerReports() {
  useStaffRealtime();
  const [tab, setTab] =
    useState<(typeof reportSections)[number]["value"]>("dashboard");
  const sectionsId = useId();

  return (
    <div>
      <div className="page-head">
        <h1>
          Reports<span className="brand-dot">.</span>
        </h1>
      </div>
      <nav className="menu-tabs" aria-label="Report sections">
        {reportSections.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={tab === value}
            aria-controls={`${sectionsId}-${value}`}
            className={tab === value ? "tab-active" : ""}
            onClick={() => setTab(value)}
          >
            {label}
          </button>
        ))}
      </nav>
      {reportSections.map(({ value, Section }) => (
        <div key={value} id={`${sectionsId}-${value}`} hidden={tab !== value}>
          <Section />
        </div>
      ))}
    </div>
  );
}
