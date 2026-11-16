"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { bindAuthQueryCache } from "@/lib/auth-query-cache";
import { AuthProvider } from "./auth/AuthProvider";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
      }),
  );
  useEffect(() => bindAuthQueryCache(client), [client]);
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>{children}</AuthProvider>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
