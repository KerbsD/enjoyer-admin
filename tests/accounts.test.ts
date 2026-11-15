import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { clearSession, setSession } from "../src/lib/api.ts";
import {
  accountQuery,
  listAccounts,
  createAccount,
  updateAccount,
  deactivateAccount,
  reactivateAccount,
  resendInvite,
} from "../src/api/accounts.ts";
import {
  accountSchema,
  accountEditSchema,
  accountSearchSchema,
} from "../src/schemas/accounts.ts";
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

test("account inputs follow API name, email, role and search limits; only Owner sees management", () => {
  assert.deepEqual(
    accountSchema.parse({
      name: "  Ana  ",
      email: "  ana@example.com  ",
      role: "owner",
    }),
    { name: "Ana", email: "ana@example.com", role: "owner" },
  );
  for (const input of [
    { name: " ", email: "ana@example.com", role: "staff" },
    { name: "a".repeat(101), email: "ana@example.com", role: "staff" },
    { name: "Ana", email: "invalid", role: "staff" },
    { name: "Ana", email: "ana@example.com", role: "admin" },
  ])
    assert.equal(accountSchema.safeParse(input).success, false);
  assert.equal(accountSearchSchema.safeParse("a".repeat(101)).success, false);
  assert.deepEqual(
    accountEditSchema.parse({
      name: "  New name ",
      role: "manager",
      email: "not editable",
    }),
    { name: "New name", role: "manager" },
  );
  assert.equal(can("staff", "accounts"), false);
  assert.equal(can("manager", "accounts"), false);
  assert.equal(can("owner", "accounts"), true);
});

test("account list query carries server-side filters, sorting and pagination", async () => {
  setSession({
    accessToken: "owner",
    user: { id: 1, name: "Owner", role: "owner" },
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
      data: [],
      pagination: { limit: 25, offset: 25, total: 26, hasMore: false },
    });
  };
  const filters = {
    role: "staff" as const,
    active: false,
    search: "  Ana  ",
    sort: "name" as const,
    order: "asc" as const,
  };
  const page = await listAccounts(filters, 25);
  assert.equal(page.pagination.total, 26);
  assert.deepEqual(Object.fromEntries(new URL(paths[0]!).searchParams), {
    limit: "25",
    offset: "25",
    sort: "name",
    order: "asc",
    role: "staff",
    active: "false",
    search: "Ana",
  });
  assert.equal(
    accountQuery({ sort: "createdAt", order: "desc" }, 0),
    "limit=25&offset=0&sort=createdAt&order=desc",
  );
});

test("create, edit, activation and resend use exact Owner endpoints and surface invite delivery results", async () => {
  setSession({
    accessToken: "owner",
    user: { id: 1, name: "Owner", role: "owner" },
  });
  const calls: { path: string; method: string; body?: unknown }[] = [];
  globalThis.fetch = async (url, init) => {
    assert.equal(
      (init?.headers as Record<string, string>).Authorization,
      "Bearer owner",
    );
    const path = new URL(String(url)).pathname;
    calls.push({
      path,
      method: init?.method ?? "GET",
      ...(init?.body ? { body: JSON.parse(String(init.body)) } : {}),
    });
    return json(
      {
        success: true,
        data: { id: 7, invitePending: true },
        message: "Account created, but the invite email could not be sent.",
        inviteEmailSent: false,
      },
      path === "/admin/accounts" ? 201 : 200,
    );
  };
  const created = await createAccount({
    name: "Ana",
    email: "ana@example.com",
    role: "staff",
  });
  assert.equal(created.inviteEmailSent, false);
  assert.match(created.message ?? "", /could not be sent/);
  await updateAccount(7, { name: "Anita", role: "manager" });
  await deactivateAccount(7);
  await reactivateAccount(7);
  await resendInvite(7);
  assert.deepEqual(calls, [
    {
      path: "/admin/accounts",
      method: "POST",
      body: { name: "Ana", email: "ana@example.com", role: "staff" },
    },
    {
      path: "/admin/accounts/7",
      method: "PATCH",
      body: { name: "Anita", role: "manager" },
    },
    { path: "/admin/accounts/7/deactivate", method: "POST" },
    { path: "/admin/accounts/7/reactivate", method: "POST" },
    { path: "/admin/accounts/7/resend-invite", method: "POST" },
  ]);
});
