"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { clearSession, currentUser, restoreSession } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-state";

const AuthContext = createContext<{ initializing: boolean }>({ initializing: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initializing, setInitializing] = useState(true);
  useEffect(() => {
    let mounted = true;
    void (async () => {
      const session = await restoreSession();
      if (session && mounted) {
        try {
          const { data } = await currentUser();
          if (!data.active) clearSession();
          else if (mounted && useAuthStore.getState().accessToken === session.accessToken) {
            useAuthStore.getState().setSession(session.accessToken, data);
          }
        } catch { if (mounted && useAuthStore.getState().accessToken === session.accessToken) clearSession(); }
      }
      if (mounted) setInitializing(false);
    })();
    return () => { mounted = false; };
  }, []);
  return <AuthContext.Provider value={{ initializing }}>{children}</AuthContext.Provider>;
}

export const useAuthReady = () => useContext(AuthContext).initializing;
