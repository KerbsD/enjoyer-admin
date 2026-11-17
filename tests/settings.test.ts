import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { clearSession, setSession } from "../src/lib/api.ts";
import {
  getSettings,
  updateSettings,
  getWeeklyHours,
  saveWeeklyDay,
  getHolidays,
  saveHoliday,
  deleteHoliday,
  getStoreStatus,
} from "../src/api/settings.ts";
import {
  calendarDate,
  daySchema,
  timingsSchema,
} from "../src/schemas/settings.ts";
import { can } from "../src/lib/permissions.ts";

const originalFetch = globalThis.fetch;
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
afterEach(() => {
  globalThis.fetch = originalFetch;
  clearSession();
});

test("shop timing and hours validators match API boundaries without inventing overnight hours", () => {
  assert.equal(
    timingsSchema.safeParse({
      idleTimeoutMinutes: 180,
      confirmationExpiryMinutes: 10,
    }).success,
    true,
  );
  for (const timings of [
    { idleTimeoutMinutes: 0, confirmationExpiryMinutes: 10 },
    { idleTimeoutMinutes: 1441, confirmationExpiryMinutes: 10 },
    { idleTimeoutMinutes: 180, confirmationExpiryMinutes: 121 },
    { idleTimeoutMinutes: 180.5, confirmationExpiryMinutes: 10 },
  ])
    assert.equal(timingsSchema.safeParse(timings).success, false);
  assert.deepEqual(daySchema.parse({ closed: true }), { closed: true });
  assert.deepEqual(
    daySchema.parse({ closed: false, openTime: "08:30", closeTime: "17:00" }),
    { closed: false, openTime: "08:30", closeTime: "17:00" },
  );
  for (const hours of [
    { closed: false, openTime: "17:00", closeTime: "08:30" },
    { closed: false, openTime: "09:00", closeTime: "09:00" },
    { closed: false, openTime: "25:00", closeTime: "09:00" },
    { closed: false, openTime: "09:00" },
  ])
    assert.equal(daySchema.safeParse(hours).success, false);
  assert.equal(calendarDate.safeParse("2024-02-29").success, true);
  assert.equal(calendarDate.safeParse("2025-02-29").success, false);
  assert.equal(calendarDate.safeParse("2026-13-01").success, false);
  assert.equal(can("staff", "settings"), false);
  assert.equal(can("manager", "settings"), true);
});

test("settings, weekday, and holiday writes send only supported fields and exact local dates", async () => {
  setSession({
    accessToken: "manager",
    user: { id: 1, name: "Manager", role: "manager" },
  });
  const calls: { path: string; method: string; body: unknown }[] = [];
  globalThis.fetch = async (url, init) => {
    assert.equal(
      (init?.headers as Record<string, string>).Authorization,
      "Bearer manager",
    );
    calls.push({
      path: new URL(String(url)).pathname,
      method: init?.method || "GET",
      body: init?.body ? JSON.parse(String(init.body)) : null,
    });
    return init?.method === "DELETE"
      ? new Response(null, { status: 204 })
      : json({ success: true, data: { shopTimezone: "Asia/Manila" } });
  };
  await getSettings();
  await updateSettings({
    idleTimeoutMinutes: 240,
    confirmationExpiryMinutes: 12,
  });
  await getWeeklyHours();
  await saveWeeklyDay(0, { closed: true });
  await saveWeeklyDay(1, {
    closed: false,
    openTime: "08:00",
    closeTime: "17:00",
  });
  await saveHoliday("2026-12-25", { closed: true });
  await deleteHoliday("2026-12-25");
  assert.deepEqual(calls, [
    { path: "/admin/settings", method: "GET", body: null },
    {
      path: "/admin/settings",
      method: "PATCH",
      body: { idleTimeoutMinutes: 240, confirmationExpiryMinutes: 12 },
    },
    { path: "/admin/store-hours", method: "GET", body: null },
    { path: "/admin/store-hours/0", method: "PUT", body: { closed: true } },
    {
      path: "/admin/store-hours/1",
      method: "PUT",
      body: { closed: false, openTime: "08:00", closeTime: "17:00" },
    },
    {
      path: "/admin/holiday-overrides/2026-12-25",
      method: "PUT",
      body: { closed: true },
    },
    {
      path: "/admin/holiday-overrides/2026-12-25",
      method: "DELETE",
      body: null,
    },
  ]);
});

test("holiday list retrieves all API pages; public shop status does not send bearer auth", async () => {
  setSession({
    accessToken: "manager",
    user: { id: 1, name: "Manager", role: "manager" },
  });
  const offsets: number[] = [];
  globalThis.fetch = async (url, init) => {
    const path = new URL(String(url));
    if (path.pathname === "/store/status") {
      assert.equal(
        (init?.headers as Record<string, string>).Authorization,
        undefined,
      );
      return json({
        success: true,
        data: {
          timezone: "Asia/Manila",
          localDate: "2026-11-13",
          isOpen: false,
          configured: true,
        },
      });
    }
    assert.equal(
      (init?.headers as Record<string, string>).Authorization,
      "Bearer manager",
    );
    assert.equal(path.searchParams.get("limit"), "100");
    const offset = Number(path.searchParams.get("offset"));
    offsets.push(offset);
    return json({
      success: true,
      data: Array.from({ length: offset ? 1 : 100 }, (_, i) => ({
        date: `2026-11-${String(i + 1).padStart(2, "0")}`,
      })),
      pagination: { hasMore: offset === 0 },
    });
  };
  assert.equal((await getHolidays()).length, 101);
  assert.deepEqual(offsets, [0, 100]);
  assert.equal((await getStoreStatus()).data.timezone, "Asia/Manila");
});
