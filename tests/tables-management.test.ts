import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { clearSession, setSession, ApiError } from "../src/lib/api.ts";
import {
  createTable,
  downloadQr,
  downloadQrSheet,
  listManagedTables,
  updateTable,
} from "../src/api/tables.ts";
import { can } from "../src/lib/permissions.ts";
import { tableSchema } from "../src/schemas/tables.ts";

const realFetch = globalThis.fetch;
const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
afterEach(() => {
  globalThis.fetch = realFetch;
  clearSession();
});

test("table form enforces API names and limits; only managers and owners see table management", () => {
  assert.deepEqual(tableSchema.parse({ name: "  Table A  ", orderLimit: 5 }), {
    name: "Table A",
    orderLimit: 5,
  });
  for (const values of [
    { name: "", orderLimit: 5 },
    { name: "Table A", orderLimit: 0 },
    { name: "Table A", orderLimit: 2.5 },
    { name: "Table A", orderLimit: 2_147_483_648 },
  ]) {
    assert.equal(tableSchema.safeParse(values).success, false);
  }
  assert.equal(can("staff", "tableManage"), false);
  assert.equal(can("staff", "tables"), true);
  assert.equal(can("manager", "tableManage"), true);
  assert.equal(can("owner", "tableManage"), true);
});

test("manager table list includes inactive tables and follows pagination; writes preserve explicit state", async () => {
  setSession({
    accessToken: "manager-token",
    user: { id: 1, name: "Manager", role: "manager" },
  });
  const calls: {
    path: string;
    authorization: string | undefined;
    method: string;
    body: unknown;
  }[] = [];
  globalThis.fetch = async (url, init) => {
    const parsed = new URL(String(url));
    const offset = Number(parsed.searchParams.get("offset"));
    const authorization = (init?.headers as Record<string, string>)
      .Authorization;
    calls.push({
      path: parsed.pathname + parsed.search,
      authorization,
      method: init?.method || "GET",
      body: init?.body ? JSON.parse(String(init.body)) : null,
    });
    if (init?.method === "GET")
      return response({
        success: true,
        data: offset
          ? [{ id: 101, active: false }]
          : Array.from({ length: 100 }, (_, i) => ({
              id: i + 1,
              active: true,
            })),
        pagination: { limit: 100, offset, total: 101, hasMore: offset === 0 },
      });
    return response({ success: true, data: {} });
  };
  const tables = await listManagedTables();
  assert.equal(tables.length, 101);
  assert.equal(tables.at(-1)?.active, false);
  await createTable({ name: "Table 10", orderLimit: 5, active: true });
  await updateTable(10, { orderLimit: 3 });
  await updateTable(10, { active: false });
  assert.deepEqual(
    calls.map((call) => [call.path, call.method, call.body]),
    [
      ["/admin/tables?limit=100&offset=0", "GET", null],
      ["/admin/tables?limit=100&offset=100", "GET", null],
      [
        "/admin/tables",
        "POST",
        { name: "Table 10", orderLimit: 5, active: true },
      ],
      ["/admin/tables/10", "PATCH", { orderLimit: 3 }],
      ["/admin/tables/10", "PATCH", { active: false }],
    ],
  );
  assert.ok(
    calls.every((call) => call.authorization === "Bearer manager-token"),
  );
});

test("QR PNG/SVG and printable sheet are authenticated binary downloads; inactive QR error is surfaced", async () => {
  setSession({
    accessToken: "manager-token",
    user: { id: 1, name: "Manager", role: "manager" },
  });
  const paths: string[] = [];
  globalThis.fetch = async (url, init) => {
    const parsed = new URL(String(url));
    assert.equal(
      (init?.headers as Record<string, string>).Authorization,
      "Bearer manager-token",
    );
    assert.equal(parsed.searchParams.has("token"), false);
    paths.push(parsed.pathname + parsed.search);
    if (
      parsed.pathname.endsWith("/qr") &&
      parsed.searchParams.get("format") === "svg"
    ) {
      return response(
        { message: "Reactivate this table before downloading its QR code." },
        409,
      );
    }
    return new Response(new Uint8Array([137, 80, 78, 71]), {
      status: 200,
      headers: { "content-type": "image/png" },
    });
  };
  assert.deepEqual(
    [...new Uint8Array(await (await downloadQr(7, "png")).arrayBuffer())],
    [137, 80, 78, 71],
  );
  await assert.rejects(
    downloadQr(7, "svg"),
    (error) =>
      error instanceof ApiError &&
      error.status === 409 &&
      /Reactivate/.test(error.message),
  );
  await downloadQrSheet();
  assert.deepEqual(paths, [
    "/admin/tables/7/qr?format=png",
    "/admin/tables/7/qr?format=svg",
    "/admin/tables/qr-sheet",
  ]);
});

test("QR attachment retries with a refreshed access token after 401", async () => {
  setSession({
    accessToken: "old",
    user: { id: 1, name: "Manager", role: "manager" },
  });
  const paths: string[] = [];
  globalThis.fetch = async (url, init) => {
    const pathname = new URL(String(url)).pathname;
    paths.push(pathname);
    if (pathname === "/auth/refresh") {
      assert.equal(init?.credentials, "include");
      return response({
        accessToken: "new",
        user: { id: 1, name: "Manager", role: "manager" },
      });
    }
    if (
      (init?.headers as Record<string, string>).Authorization === "Bearer old"
    )
      return response({ message: "Expired" }, 401);
    return new Response("<html>print me</html>", {
      status: 200,
      headers: { "content-type": "text/html" },
    });
  };
  assert.match(await (await downloadQrSheet()).text(), /print me/);
  assert.deepEqual(paths, [
    "/admin/tables/qr-sheet",
    "/auth/refresh",
    "/admin/tables/qr-sheet",
  ]);
});
