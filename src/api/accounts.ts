import { request } from "@/lib/api";
import type { Role } from "@/lib/auth-state";

export type Account = {
  id: number;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  invitePending: boolean;
  inviteExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};
type Envelope<T> = { success: true; data: T; message?: string };
export type AccountFilters = {
  role?: Role;
  active?: boolean;
  search?: string;
  sort: "createdAt" | "name";
  order: "asc" | "desc";
};
export type AccountPage = Envelope<Account[]> & {
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
};
export type CreateAccountInput = { name: string; email: string; role: Role };

export function accountQuery(
  filters: AccountFilters,
  offset: number,
  limit = 25,
) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    sort: filters.sort,
    order: filters.order,
  });
  if (filters.role) params.set("role", filters.role);
  if (filters.active !== undefined)
    params.set("active", String(filters.active));
  if (filters.search) params.set("search", filters.search.trim());
  return params.toString();
}

export const listAccounts = (
  filters: AccountFilters,
  offset: number,
  signal?: AbortSignal,
) =>
  request<AccountPage>(`/admin/accounts?${accountQuery(filters, offset)}`, {
    signal,
  });
export const createAccount = (body: CreateAccountInput) =>
  request<Envelope<Account> & { inviteEmailSent: boolean }>("/admin/accounts", {
    method: "POST",
    body,
  });
export const updateAccount = (
  id: number,
  body: { name?: string; role?: Role },
) =>
  request<Envelope<Account>>(`/admin/accounts/${id}`, {
    method: "PATCH",
    body,
  });
export const deactivateAccount = (id: number) =>
  request<Envelope<Account>>(`/admin/accounts/${id}/deactivate`, {
    method: "POST",
  });
export const reactivateAccount = (id: number) =>
  request<Envelope<Account>>(`/admin/accounts/${id}/reactivate`, {
    method: "POST",
  });
export const resendInvite = (id: number) =>
  request<{ success: true; message: string }>(
    `/admin/accounts/${id}/resend-invite`,
    { method: "POST" },
  );
