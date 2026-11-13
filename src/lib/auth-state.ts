import { create } from "zustand";

export type Role = "staff" | "manager" | "owner";
export type User = { id: number; name: string; role: Role; email?: string };

type AuthState = {
  accessToken: string | null;
  user: User | null;
  setSession: (accessToken: string, user: User) => void;
  clear: () => void;
};

// Never persist the access token; the HttpOnly refresh cookie survives reloads.
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  setSession: (accessToken, user) => set({ accessToken, user }),
  clear: () => set({ accessToken: null, user: null }),
}));
