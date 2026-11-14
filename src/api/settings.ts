import { request } from "@/lib/api";

type Envelope<T> = { success: true; data: T };
export type ShopSettings = {
  idleTimeoutMinutes: number;
  confirmationExpiryMinutes: number;
  shopTimezone: string;
};
export type WeeklyDay = {
  dayOfWeek: number;
  openTime: string | null;
  closeTime: string | null;
  closed: boolean;
  configured: boolean;
};
export type Holiday = {
  date: string;
  openTime: string | null;
  closeTime: string | null;
  closed: boolean;
};
export type HoursInput =
  { closed: true } | { closed: false; openTime: string; closeTime: string };
export type StoreStatus = {
  isOpen: boolean;
  configured: boolean;
  timezone: string;
  localDate: string;
  localTime: string;
  today: {
    date: string;
    dayOfWeek: number;
    openTime: string | null;
    closeTime: string | null;
    closed: boolean;
    source: string;
  };
  closesAt: string | null;
  nextOpen: string | null;
  week: {
    date: string;
    closed: boolean;
    openTime: string | null;
    closeTime: string | null;
    source: string;
  }[];
};

export const getSettings = (signal?: AbortSignal) =>
  request<Envelope<ShopSettings>>("/admin/settings", { signal });
export const updateSettings = (
  body: Pick<ShopSettings, "idleTimeoutMinutes" | "confirmationExpiryMinutes">,
) =>
  request<Envelope<ShopSettings>>("/admin/settings", { method: "PATCH", body });
export const getWeeklyHours = (signal?: AbortSignal) =>
  request<Envelope<WeeklyDay[]> & { timezone: string }>("/admin/store-hours", {
    signal,
  });
export const saveWeeklyDay = (day: number, body: HoursInput) =>
  request<Envelope<WeeklyDay>>(`/admin/store-hours/${day}`, {
    method: "PUT",
    body,
  });
export const getStoreStatus = (signal?: AbortSignal) =>
  request<Envelope<StoreStatus>>("/store/status", { auth: false, signal });

export async function getHolidays(signal?: AbortSignal): Promise<Holiday[]> {
  const rows: Holiday[] = [];
  let offset = 0;
  while (true) {
    const result = await request<
      Envelope<Holiday[]> & { pagination: { hasMore: boolean } }
    >(`/admin/holiday-overrides?limit=100&offset=${offset}`, { signal });
    rows.push(...result.data);
    if (!result.pagination.hasMore) return rows;
    if (!result.data.length)
      throw new Error("Holiday pagination did not advance.");
    offset += result.data.length;
  }
}

export const saveHoliday = (date: string, body: HoursInput) =>
  request<Envelope<Holiday>>(
    `/admin/holiday-overrides/${encodeURIComponent(date)}`,
    { method: "PUT", body },
  );
export const deleteHoliday = (date: string) =>
  request<void>(`/admin/holiday-overrides/${encodeURIComponent(date)}`, {
    method: "DELETE",
  });
