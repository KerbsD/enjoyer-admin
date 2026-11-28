import { settingsTabs } from "@/constants/settings";
import { Holidays } from "./Holidays";
import { OrderingNetworkPanel } from "./OrderingNetworkPanel";
import { StatusPanel } from "./StatusPanel";
import { TimingsForm } from "./TimingsForm";
import { useManagerSettings } from "./useManagerSettings";
import { WeeklyHours } from "./WeeklyHours";

export function ManagerSettings({
  canManageOrderingNetwork,
}: {
  canManageOrderingNetwork: boolean;
}) {
  const { tab, setTab, settings } = useManagerSettings();
  const tabs = canManageOrderingNetwork
    ? settingsTabs
    : settingsTabs.filter(({ value }) => value !== "ordering-network");

  return (
    <div>
      <div className="page-head">
        <h1>
          Shop settings<span className="brand-dot">.</span>
        </h1>
      </div>
      <StatusPanel />
      <nav className="menu-tabs" aria-label="Settings sections">
        {tabs.map(({ value, label }) => (
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
      {canManageOrderingNetwork && tab === "ordering-network" && (
        <OrderingNetworkPanel />
      )}
    </div>
  );
}
