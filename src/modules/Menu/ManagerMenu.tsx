import { menuTabs } from "@/constants/menu";
import { Categories } from "./Categories";
import { Groups } from "./Groups";
import { Items } from "./Items";
import { useManagerMenu } from "./useManagerMenu";

export function ManagerMenu() {
  const { tab, setTab, transport } = useManagerMenu();

  return (
    <div>
      <div className="page-head board-heading">
        <div>
          <span className="eyebrow">ENJOYER / MENU MANAGEMENT</span>
          <h1>
            Menu<span className="brand-dot">.</span>
          </h1>
          <p>
            Manage the categories, items and add-ons customers see right now.
          </p>
        </div>
        <span className="eyebrow" role="status">
          {transport === "sse"
            ? "● Live"
            : transport === "polling"
              ? "◌ Polling fallback"
              : "Connecting…"}
        </span>
      </div>
      <nav className="menu-tabs" aria-label="Menu sections">
        {menuTabs.map(({ value, label }) => (
          <button
            type="button"
            key={value}
            aria-pressed={tab === value}
            className={tab === value ? "tab-active" : ""}
            onClick={() => setTab(value)}
          >
            {label}
          </button>
        ))}
      </nav>
      {tab === "items" ? (
        <Items />
      ) : tab === "categories" ? (
        <Categories />
      ) : (
        <Groups />
      )}
    </div>
  );
}
