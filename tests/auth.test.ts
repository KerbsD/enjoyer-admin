import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  clearSession,
  login,
  logout,
  request,
  restoreSession,
  setSession,
  ApiError,
} from "../src/lib/api.ts";
import { useAuthStore } from "../src/lib/auth-state.ts";
import { safeNext } from "../src/lib/safe-next.ts";
import { can } from "../src/lib/permissions.ts";
import { QueryClient } from "@tanstack/react-query";
import { bindAuthQueryCache } from "../src/lib/auth-query-cache.ts";
import { locallySignedOut } from "../src/lib/session-restore.ts";

const realFetch = globalThis.fetch;
const user = { id: 3, name: "Enjoyer Manager", role: "manager" as const };
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
afterEach(() => {
  globalThis.fetch = realFetch;
  clearSession();
});

test("login sends Enjoyer credentials and holds access token in memory", async () => {
  globalThis.fetch = async (_url, init) => {
    assert.equal(init?.method, "POST");
    assert.equal(init?.credentials, "include");
    assert.deepEqual(JSON.parse(String(init?.body)), {
      email: "staff@enjoyer.test",
      pwd: "password",
    });
    return json({ accessToken: "access", user });
  };
  await login("staff@enjoyer.test", "password");
  assert.equal(useAuthStore.getState().accessToken, "access");
  assert.deepEqual(useAuthStore.getState().user, user);
});

test("concurrent 401 requests share one rotating-cookie refresh", async () => {
  let refreshes = 0;
  globalThis.fetch = async (url, init) => {
    if (String(url).endsWith("/auth/refresh")) {
      refreshes++;
      await Promise.resolve();
      return json({ accessToken: "new", user });
    }
    if (
      (init?.headers as Record<string, string>).Authorization === "Bearer new"
    )
      return json({ success: true });
    return json({ message: "Expired" }, 401);
  };
  const results = await Promise.all([request("/auth/me"), request("/auth/me")]);
  assert.deepEqual(results, [{ success: true }, { success: true }]);
  assert.equal(refreshes, 1);
  assert.equal(useAuthStore.getState().accessToken, "new");
});

test("failed refresh clears session; stale in-flight refresh cannot restore after logout", async () => {
  let release!: (value: Response) => void;
  globalThis.fetch = async () =>
    new Promise<Response>((resolve) => {
      release = resolve;
    });
  const restoring = restoreSession();
  clearSession();
  release(json({ accessToken: "stale", user }));
  assert.equal(await restoring, null);
  assert.equal(useAuthStore.getState().accessToken, null);
  globalThis.fetch = async () => json({ message: "Unauthorized" }, 401);
  await assert.rejects(
    request("/auth/me"),
    (error) => error instanceof ApiError && error.status === 401,
  );
});

test("navigation follows backend role hierarchy; redirect target stays on-app", () => {
  assert.equal(can("staff", "reports"), false);
  assert.equal(can("manager", "accounts"), false);
  assert.equal(can("owner", "accounts"), true);
  assert.equal(safeNext("/reports"), "/reports");
  for (const unsafe of [
    "//evil.test",
    "https://evil.test",
    "/\\evil.test",
    "/login",
    "\n/board",
  ]) {
    assert.equal(safeNext(unsafe), "/board");
  }
});

test("auth cache is cleared on logout and identity changes, but not token rotation", () => {
  const client = new QueryClient();
  const unbind = bindAuthQueryCache(client);
  try {
    const manager = { id: 3, name: "Manager", role: "manager" as const };
    setSession({ accessToken: "one", user: manager });
    client.setQueryData(["accounts"], ["private"]);
    setSession({ accessToken: "two", user: manager });
    assert.deepEqual(client.getQueryData(["accounts"]), ["private"]);
    clearSession();
    assert.equal(client.getQueryData(["accounts"]), undefined);
    client.setQueryData(["accounts"], ["old user"]);
    setSession({
      accessToken: "three",
      user: { id: 4, name: "Other owner", role: "owner" },
    });
    assert.equal(client.getQueryData(["accounts"]), undefined);
  } finally {
    unbind();
    client.clear();
  }
});

test("failed server logout still clears the local session", async () => {
  setSession({ accessToken: "access", user });
  globalThis.fetch = async () => {
    throw new Error("offline");
  };
  await assert.rejects(logout(), /offline/);
  assert.equal(useAuthStore.getState().accessToken, null);
  assert.equal(locallySignedOut(), true);
  assert.equal(await restoreSession(), null);
  globalThis.fetch = async () => json({ accessToken: "new", user });
  await login("staff@enjoyer.test", "password");
  assert.equal(locallySignedOut(), false);
});
