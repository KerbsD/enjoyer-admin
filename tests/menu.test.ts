import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { clearSession, setSession } from "../src/lib/api.ts";
import { assignGroups, categories, createGroup, items, publicMenu, setAvailability, updateItem } from "../src/api/menu.ts";
import { groupSchema, itemSchema, money, optionSchema } from "../src/modules/Menu/schemas.ts";

const realFetch = globalThis.fetch;
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
afterEach(() => { clearSession(); globalThis.fetch = realFetch; });

test("price validation rejects rounding and canonicalizes exact PHP amounts", () => {
  assert.equal(money.parse("60"), "60.00");
  assert.equal(money.parse("60.5"), "60.50");
  for (const input of ["-1", "1.234", "01", "100000000", "NaN"]) assert.equal(money.safeParse(input).success, false);
  assert.equal(itemSchema.safeParse({ categoryId: 1, name: " Sandwich ", description: "", price: "350.00", isSpicy: false, isAvailable: true, isHidden: false, sortOrder: 0 }).success, true);
  assert.equal(groupSchema.safeParse({ name: "Milk", minSelections: 2, maxSelections: 1, sortOrder: 0 }).success, false);
  assert.equal(optionSchema.safeParse({ name: "Oat milk", priceDelta: "30.00", isAvailable: true, sortOrder: 0 }).success, true);
});

test("menu management fetches all pages with manager auth while staff reads public visible menu", async () => {
  setSession({ accessToken: "manager", user: { id: 2, name: "Manager", role: "manager" } });
  const calls: string[] = [];
  globalThis.fetch = async (url, init) => {
    const path = new URL(String(url)).pathname;
    const offset = Number(new URL(String(url)).searchParams.get("offset"));
    calls.push(path + `:${offset}`);
    if (path === "/menu") { assert.equal((init?.headers as Record<string, string>).Authorization, undefined); return reply({ success: true, data: [{ id: 1, name: "Sandwiches", items: [] }] }); }
    assert.equal((init?.headers as Record<string, string>).Authorization, "Bearer manager");
    return reply({ success: true, data: offset ? [{ id: 101 }] : Array.from({ length: 100 }, (_, i) => ({ id: i + 1 })),
      pagination: { total: 101, limit: 100, offset, hasMore: offset === 0 } });
  };
  assert.equal((await items()).length, 101);
  assert.equal((await categories()).length, 101);
  assert.equal((await publicMenu()).data[0].name, "Sandwiches");
  assert.deepEqual(calls, ["/admin/menu-items:0", "/admin/menu-items:100", "/admin/categories:0", "/admin/categories:100", "/menu:0"]);
});

test("sold-out uses staff availability endpoint and hide uses manager edit; assignment PUT replaces groups", async () => {
  setSession({ accessToken: "manager", user: { id: 2, name: "Manager", role: "manager" } });
  const calls: { path: string; method: string; body: unknown }[] = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ path: new URL(String(url)).pathname, method: init?.method || "GET", body: JSON.parse(String(init?.body)) });
    return reply({ success: true, data: {} });
  };
  await setAvailability(7, false);
  await updateItem(7, { isHidden: true });
  await assignGroups(7, [2, 3]);
  await assignGroups(7, []);
  await createGroup({ name: "Extras", minSelections: 0, maxSelections: 1, sortOrder: 1,
    options: [{ name: "Side fries", priceDelta: "60.00", isAvailable: true, sortOrder: 1 }] });
  assert.deepEqual(calls, [
    { path: "/staff/menu-items/7/availability", method: "PATCH", body: { isAvailable: false } },
    { path: "/admin/menu-items/7", method: "PATCH", body: { isHidden: true } },
    { path: "/admin/menu-items/7/option-groups", method: "PUT", body: { groupIds: [2, 3] } },
    { path: "/admin/menu-items/7/option-groups", method: "PUT", body: { groupIds: [] } },
    { path: "/admin/option-groups", method: "POST", body: { name: "Extras", minSelections: 0, maxSelections: 1, sortOrder: 1, options: [{ name: "Side fries", priceDelta: "60.00", isAvailable: true, sortOrder: 1 }] } },
  ]);
});
