import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { syncOrderingTerminal } from "@/api/orderingNetwork";
import {
  ORDERING_NETWORK_QUERY,
  TERMINAL_HINT_EVENT,
  TERMINAL_HINT_KEY,
  TERMINAL_SYNC_INTERVAL_MS,
} from "@/constants/orderingNetwork";

// This marker only schedules checks. The server requires an HttpOnly
// credential AND a current authorized admin, regardless of this value.
export function setTerminalHint(enrolled: boolean) {
  // Non-secret generation marker: a delayed sync must not reset a newer
  // enrollment, including one created in another tab.
  const generation = enrolled
    ? crypto.getRandomValues(new Uint32Array(4)).join("-")
    : null;
  try {
    if (generation) localStorage.setItem(TERMINAL_HINT_KEY, generation);
    else localStorage.removeItem(TERMINAL_HINT_KEY);
  } catch {
    // The enrolled tab can still sync while this browser session is open.
  }
  window.dispatchEvent(
    new CustomEvent(TERMINAL_HINT_EVENT, { detail: generation }),
  );
}

export function useOrderingTerminal(activeUserId: number | undefined) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!activeUserId) return;
    const controller = new AbortController();
    let hint: string | null = null;
    let inFlight = false;
    const readHint = () => {
      try {
        return localStorage.getItem(TERMINAL_HINT_KEY);
      } catch {
        return hint;
      }
    };
    const sync = async () => {
      if (
        !hint ||
        inFlight ||
        document.visibilityState === "hidden" ||
        controller.signal.aborted
      )
        return;
      const generation = hint;
      inFlight = true;
      try {
        const { data } = await syncOrderingTerminal(
          AbortSignal.any([controller.signal, AbortSignal.timeout(10_000)]),
        );
        if (
          controller.signal.aborted ||
          hint !== generation ||
          readHint() !== generation
        )
          return;
        if (!data.enrolled) setTerminalHint(false);
        if (data.changed || !data.enrolled)
          void queryClient.invalidateQueries({
            queryKey: ORDERING_NETWORK_QUERY,
          });
      } catch {
        // Retry on the next scheduled check or when this terminal regains focus.
      } finally {
        inFlight = false;
      }
    };
    const localChange = (event: Event) => {
      hint = (event as CustomEvent<string | null>).detail;
      void sync();
    };
    const storageChange = (event: StorageEvent) => {
      if (event.key === TERMINAL_HINT_KEY || event.key === null) {
        hint = readHint();
        void sync();
      }
    };
    hint = readHint();
    void sync();
    const timer = window.setInterval(sync, TERMINAL_SYNC_INTERVAL_MS);
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener(TERMINAL_HINT_EVENT, localChange);
    window.addEventListener("storage", storageChange);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener(TERMINAL_HINT_EVENT, localChange);
      window.removeEventListener("storage", storageChange);
    };
  }, [activeUserId, queryClient]);
}
