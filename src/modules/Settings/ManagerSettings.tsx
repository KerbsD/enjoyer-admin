import { settingsTabs } from "@/constants/settings";
import { Holidays } from "./Holidays";
import { StatusPanel } from "./StatusPanel";
import { TimingsForm } from "./TimingsForm";
import { useManagerSettings } from "./useManagerSettings";
import { WeeklyHours } from "./WeeklyHours";

export function ManagerSettings() {
  const { tab, setTab, settings } = useManagerSettings();

  return (
    <div>
      <div className="page-head">
        <span className="eyebrow">ENJOYER / SHOP OPERATIONS</span>
        <h1>
          Shop settings<span className="brand-dot">.</span>
        </h1>
        <p>Control session timing and the shop-local ordering schedule.</p>
      </div>
      <StatusPanel />
      <nav className="menu-tabs" aria-label="Settings sections">
        {settingsTabs.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={tab === value}
            className={tab === value ? "tab-active" : ""}
            onClick={() => setTab(value)}
          >
            {label}
          </button>
        ))}
      </nav>
      {tab === "timings" && (
        <>
          {settings.isPending && <p role="status">Loading settings…</p>}
          {settings.isError && (
            <p role="alert" className="error">
              {settings.error.message}{" "}
              <button
                type="button"
                className="text-button"
                onClick={() => void settings.refetch()}
              >
                Retry
              </button>
            </p>
          )}
          {settings.data && (
            <TimingsForm
              key={`${settings.data.data.idleTimeoutMinutes}-${settings.data.data.confirmationExpiryMinutes}`}
              settings={settings.data.data}
            />
          )}
        </>
      )}
      {tab === "weekly" && <WeeklyHours />}
      {tab === "holidays" && <Holidays />}
    </div>
  );
}
