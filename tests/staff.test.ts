import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { ApiError, clearSession, setSession } from "../src/lib/api.ts";
import { advanceOrder, cancelOrder, closeTable, listAllOrders, listTableOverview, markOrderPaid, rejectOrder } from "../src/api/staff.ts";
import { sseMessages, watchRealtime } from "../src/lib/realtime.ts";
import { peso, shopTime } from "../src/lib/shop-format.ts";

const originalFetch = globalThis.fetch;
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
afterEach(() => { globalThis.fetch = originalFetch; clearSession(); });

test("board loads all oldest-first pages, not just the first 100", async () => {
  setSession({ accessToken: "staff-token", user: { id: 1, name: "Staff", role: "staff" } });
  const pages: number[] = [];
  globalThis.fetch = async (url, init) => {
    const query = new URL(String(url)).searchParams;
    assert.equal((init?.headers as Record<string, string>).Authorization, "Bearer staff-token");
    assert.equal(query.get("status"), "received");
    assert.equal(query.get("limit"), "100");
    const offset = Number(query.get("offset")); pages.push(offset);
    return reply({ success: true, data: Array.from({ length: offset ? 1 : 100 }, (_, i) => ({ id: String(i + offset) })),
      pagination: { limit: 100, offset, total: 101, hasMore: offset === 0 } });
  };
  const orders = await listAllOrders("received");
  assert.deepEqual(pages, [0, 100]);
  assert.equal(orders.length, 101);
  assert.equal(orders.at(-1)?.id, "100");
});

test("staff mutations send the exact API method and body; conflicting close preserves warning code", async () => {
  setSession({ accessToken: "staff-token", user: { id: 1, name: "Staff", role: "staff" } });
  const calls: { path: string; method: string; body: unknown }[] = [];
  globalThis.fetch = async (url, init) => {
    const path = new URL(String(url)).pathname;
    const body = init?.body ? JSON.parse(String(init.body)) : null;
    calls.push({ path, method: init?.method || "GET", body });
    return path.endsWith("/close") && body.overrideUnpaid === false
      ? reply({ success: false, code: "UNPAID_ORDERS_REMAIN", message: "Manager override required" }, 409)
      : reply({ success: true, data: {} });
  };
  await advanceOrder("abc");
  await rejectOrder("abc");
  await cancelOrder("abc", "Unavailable item");
  await markOrderPaid("abc", "cash");
  await assert.rejects(closeTable(7), (error) => error instanceof ApiError && error.status === 409 && error.code === "UNPAID_ORDERS_REMAIN");
  await closeTable(7, true);
  assert.deepEqual(calls, [
    { path: "/staff/orders/abc/advance", method: "POST", body: null },
    { path: "/staff/orders/abc/reject", method: "POST", body: {} },
    { path: "/staff/orders/abc/cancel", method: "POST", body: { reason: "Unavailable item" } },
    { path: "/staff/orders/abc/paid", method: "POST", body: { method: "cash" } },
    { path: "/staff/tables/7/close", method: "POST", body: { overrideUnpaid: false } },
    { path: "/staff/tables/7/close", method: "POST", body: { overrideUnpaid: true } },
  ]);
});

test("table overview uses the staff endpoint and amounts/times use PHP and Manila", async () => {
  setSession({ accessToken: "staff-token", user: { id: 1, name: "Staff", role: "staff" } });
  globalThis.fetch = async (url) => { assert.equal(new URL(String(url)).pathname, "/staff/tables/overview"); return reply({ success: true, data: [] }); };
  assert.deepEqual((await listTableOverview()).data, []);
  assert.match(peso("260.00"), /260\.00/);
  assert.match(shopTime("2026-11-13T16:30:00.000Z"), /Nov 14, 2026/);
});

test("SSE parser handles split UTF-8 frames and heartbeat comments", async () => {
  const bytes = new TextEncoder().encode(': beat\n\nevent: change\ndata: {"table":"Café"}\n\n');
  const stream = new ReadableStream<Uint8Array>({ start(controller) {
    for (let i = 0; i < bytes.length; i += 2) controller.enqueue(bytes.slice(i, i + 2));
    controller.close();
  } });
  const events = [];
  for await (const event of sseMessages(stream)) events.push(event);
  assert.deepEqual(events, [{ event: "change", data: '{"table":"Café"}' }]);
});

test("staff realtime falls back from unavailable SSE to bearer-authenticated polling", async () => {
  const calls: string[] = [];
  globalThis.fetch = async (url, init) => {
    const uri = new URL(String(url));
    assert.equal((init?.headers as Record<string, string>).Authorization, "Bearer staff-token");
    assert.equal(uri.searchParams.has("token"), false);
    calls.push(uri.pathname);
    if (uri.pathname.endsWith("/events")) return reply({ message: "Stream unavailable" }, 503);
    return reply({ success: true, data: {
      revision: "a".repeat(64), resources: { orders: "one", tables: "two" }, scope: { kind: "staff" }, pollIntervalMs: 5000,
    } });
  };
  let changed: string[] = [];
  const watcher = watchRealtime({
    url: "http://localhost:3000/staff/realtime",
    headers: () => ({ Authorization: "Bearer staff-token" }),
    onChange: async (_state, resources, sync) => {
      assert.equal(sync, true);
      changed = resources;
      watcher.stop();
    },
  });
  await watcher.done;
  assert.deepEqual(calls, ["/staff/realtime/events", "/staff/realtime/changes"]);
  assert.deepEqual(changed, ["orders", "tables"]);
});
