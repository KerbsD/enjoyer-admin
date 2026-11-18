"use client";

import { peso } from "@/lib/shop-format";
import { RealtimeStatus } from "@/components/ui/RealtimeStatus";

import { useAvailability } from "./useAvailability";

export default function Availability() {
  const { menu, transport, savingId, mutation, setSavingId } = useAvailability();

  return (
    <div>
      <div className="page-head board-heading">
        <div>
          <h1>
            Sold-out items<span className="brand-dot">.</span>
          </h1>
        </div>
        <RealtimeStatus transport={transport} />
      </div>
      {menu.isPending && (
        <p className="feature-note" role="status">
          Loading menu…
        </p>
      )}
      {menu.isError && (
        <div className="feature-note error" role="alert">
          {menu.error.message}{" "}
          <button
            type="button"
            className="text-button"
            onClick={() => void menu.refetch()}
          >
            Retry
          </button>
        </div>
      )}
      {menu.data?.data.length === 0 && (
        <p className="feature-note">
          No visible menu items yet. Ask a Manager to set up the menu.
        </p>
      )}
      {menu.data?.data.map((category) => (
        <section key={category.id} className="menu-section">
          <h2>{category.name}</h2>
          <div className="menu-rows">
            {category.items.map((item) => (
              <div key={item.id} className="menu-row">
                <div>
                  <strong>
                    {item.name}
                    {item.isSpicy ? " · Spicy" : ""}
                  </strong>
                  <span>
                    {peso(item.price)} ·{" "}
                    {item.isAvailable ? "Available" : "Sold out"}
                  </span>
                </div>
                <button
                  type="button"
                  className={`button ${item.isAvailable ? "button-outline" : ""}`}
                  disabled={mutation.isPending}
                  onClick={() => {
                    setSavingId(item.id);
                    mutation.mutate({
                      id: item.id,
                      isAvailable: !item.isAvailable,
                    });
                  }}
                >
                  {savingId === item.id
                    ? "Saving…"
                    : item.isAvailable
                      ? "Mark sold out"
                      : "Mark available"}
                </button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
