import type { QueryClient } from "@tanstack/react-query";
import { useAuthStore } from "./auth-state";

// Query keys are shared across roles and accounts. Drop cached responses as
// soon as the authenticated identity changes, including involuntary logout.
export function bindAuthQueryCache(client: QueryClient) {
  return useAuthStore.subscribe((state, previous) => {
    if (
      state.user?.id !== previous.user?.id ||
      state.user?.role !== previous.user?.role
    )
      client.clear();
  });
}
