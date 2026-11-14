import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { clearSession, setSession } from "../src/lib/api.ts";
import {
  getDashboard,
  getHistoricalOrder,
  listHistory,
  exportOrders,
  queryString,
} from "../src/api/reports.ts";
import { rangeError, rangeOf } from "../src/modules/Reports/validation.ts";
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

test("dashboard preset and custom ranges use exclusive query shapes, with Manila calendar validation", async () => {
  setSession({
    accessToken: "manager",
    user: { id: 1, name: "Manager", role: "manager" },
  });
  const calls: string[] = [];
  globalThis.fetch = async (url, init) => {
    assert.equal(
      (init?.headers as Record<string, string>).Authorization,
      "Bearer manager",
    );
    calls.push(String(url));
    return json({
      success: true,
      currency: "PHP",
      data: {
        range: {
          from: "2024-02-29",
          to: "2024-02-29",
          timezone: "Asia/Manila",
        },
        revenue: "100.00",
      },
    });
  };
  await getDashboard({ period: "today" });
  await getDashboard({ period: "7days" });
  await getDashboard({ period: "30days" });
  const dashboard = await getDashboard(rangeOf("2024-02-29", "2024-03-01"));
  assert.equal(dashboard.data.revenue, "100.00");
  assert.deepEqual(
    calls.map((url) => new URL(url).search),
    [
      "?period=today",
      "?period=7days",
      "?period=30days",
      "?from=2024-02-29&to=2024-03-01",
    ],
  );
  assert.equal(rangeError("", ""), null);
  assert.ok(rangeError("", "", true));
  assert.ok(rangeError("2026-01-01", ""));
  assert.ok(rangeError("2025-02-29", "2025-03-01"));
  assert.ok(rangeError("2026-12-01", "2026-11-30"));
  assert.equal(rangeError("2024-02-29", "2024-02-29", true), null);
  assert.equal(can("staff", "reports"), false);
  assert.equal(can("manager", "reports"), true);
  assert.equal(can("owner", "reports"), true);
});

test("history passes pagination and filters, fetches full detail, and omits blank search", async () => {
  setSession({
    accessToken: "owner",
    user: { id: 2, name: "Owner", role: "owner" },
  });
  const paths: string[] = [];
  globalThis.fetch = async (url, init) => {
    assert.equal(
      (init?.headers as Record<string, string>).Authorization,
      "Bearer owner",
    );
    paths.push(String(url));
    return json({
      success: true,
      currency: "PHP",
      data: [],
      pagination: { limit: 25, offset: 25, total: 26, hasMore: false },
    });
  };
  const page = await listHistory({
    ...rangeOf("2026-11-01", "2026-11-13"),
    tableId: 5,
    itemId: 9,
    status: "cancelled",
    paymentStatus: "paid",
    q: "  noodles  ",
    limit: 25,
    offset: 25,
  });
  assert.equal(page.pagination.total, 26);
  const query = new URL(paths[0]!).searchParams;
  assert.deepEqual(Object.fromEntries(query), {
    from: "2026-11-01",
    to: "2026-11-13",
    tableId: "5",
    itemId: "9",
    status: "cancelled",
    paymentStatus: "paid",
    q: "noodles",
    limit: "25",
    offset: "25",
  });
  await listHistory({ limit: 25, offset: 0, q: "   " });
  assert.equal(new URL(paths[1]!).searchParams.has("q"), false);
  await getHistoricalOrder("abc-123");
  assert.equal(new URL(paths[2]!).pathname, "/admin/orders/abc-123");
  assert.equal(queryString({ q: undefined, limit: 25, from: "" }), "limit=25");
});

test("CSV export uses only its own date range and authenticated binary download with refresh", async () => {
  setSession({
    accessToken: "expired",
    user: { id: 1, name: "Manager", role: "manager" },
  });
  const calls: { path: string; authorization?: string }[] = [];
  globalThis.fetch = async (url, init) => {
    const path = new URL(String(url)).pathname + new URL(String(url)).search;
    const authorization = (init?.headers as Record<string, string> | undefined)
      ?.Authorization;
    calls.push({ path, authorization });
    if (path.startsWith("/admin/exports") && authorization === "Bearer expired")
      return json({ message: "Expired" }, 401);
    if (path === "/auth/refresh")
      return json({
        accessToken: "fresh",
        user: { id: 1, name: "Manager", role: "manager" },
      });
    return new Response("Order ID,Time (UTC)\r\n", {
      headers: { "content-type": "text/csv" },
    });
  };
  const blob = await exportOrders(rangeOf("2026-11-01", "2026-11-13"));
  assert.equal(await blob.text(), "Order ID,Time (UTC)\r\n");
  assert.deepEqual(calls, [
    {
      path: "/admin/exports/orders.csv?from=2026-11-01&to=2026-11-13",
      authorization: "Bearer expired",
    },
    { path: "/auth/refresh", authorization: undefined },
    {
      path: "/admin/exports/orders.csv?from=2026-11-01&to=2026-11-13",
      authorization: "Bearer fresh",
    },
  ]);
});
