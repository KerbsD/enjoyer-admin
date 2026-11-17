"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { clearSession, currentUser, restoreSession } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-state";
import { locallySignedOut } from "@/lib/session-restore";

const AuthContext = createContext<{ initializing: boolean }>({
  initializing: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;
    const onStorage = () => {
      if (locallySignedOut()) clearSession();
    };
    window.addEventListener("storage", onStorage);

    void (async () => {
      const session = locallySignedOut() ? null : await restoreSession();
      if (session && mounted) {
        try {
          const { data } = await currentUser();
          if (!data.active) clearSession();
          else if (
            mounted &&
            useAuthStore.getState().accessToken === session.accessToken
          ) {
            useAuthStore.getState().setSession(session.accessToken, data);
          }
        } catch {
          if (
            mounted &&
            useAuthStore.getState().accessToken === session.accessToken
          )
            clearSession();
        }
      }
      if (mounted) setInitializing(false);
    })();
    return () => {
      mounted = false;
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ initializing }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthReady = () => useContext(AuthContext).initializing;
