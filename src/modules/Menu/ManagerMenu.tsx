import { Categories } from "./Categories";
import { Groups } from "./Groups";
import { Items } from "./Items";
import { useManagerMenu } from "./useManagerMenu";

import { menuTabs } from "@/constants/menu";

import { RealtimeStatus } from "@/components/ui/RealtimeStatus";

export function ManagerMenu() {
  const { tab, setTab, transport } = useManagerMenu();

  return (
    <div>
      <div className="page-head board-heading">
        <div>
          <h1>
            Menu<span className="brand-dot">.</span>
          </h1>
        </div>
        <RealtimeStatus transport={transport} />
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
