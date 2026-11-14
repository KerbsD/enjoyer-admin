import type { ReactNode } from "react";

export function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <div className="auth-page">
      <header className="auth-side">
        <span className="eyebrow">ENJOYER / ADMIN CONSOLE</span>
        <h1>
          Good work.
          <br />
          <span className="accent">Great coffee.</span>
        </h1>
        <span className="eyebrow">
          JUST ENJOY. · EST. IN ANTIPOLO CITY, 1870
        </span>
      </header>
      <main className="auth-panel">{children}</main>
    </div>
  );
}
