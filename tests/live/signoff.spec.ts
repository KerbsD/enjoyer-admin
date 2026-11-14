import { expect, test, type Page } from "@playwright/test";

const apiUrl = process.env.LIVE_API_URL ?? "http://localhost:4000";
type Role = "staff" | "manager" | "owner";

test("real API readiness, public resources, CORS, and unauthenticated protection", async ({
  page,
  request,
}) => {
  const ready = await request.get(`${apiUrl}/health/ready`);
  expect(ready.status()).toBe(200);
  expect((await ready.json()).ok).toBe(true);
  for (const path of ["/menu", "/store/status"]) {
    const response = await request.get(`${apiUrl}${path}`);
    expect(response.status(), path).toBe(200);
    expect((await response.json()).success, path).toBe(true);
  }
  const preflight = await request.fetch(`${apiUrl}/auth/me`, {
    method: "OPTIONS",
    headers: {
      Origin: process.env.LIVE_ADMIN_URL ?? "http://localhost:3001",
      "Access-Control-Request-Method": "GET",
      "Access-Control-Request-Headers": "authorization",
    },
  });
  expect(preflight.status()).toBe(200);
  expect(preflight.headers()["access-control-allow-origin"]).toBe(
    process.env.LIVE_ADMIN_URL ?? "http://localhost:3001",
  );
  expect((await request.get(`${apiUrl}/admin/accounts`)).status()).toBe(401);
  await page.goto("/accounts");
  await expect(page).toHaveURL(/\/login\?next=%2Faccounts/);
  await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
});

async function signIn(page: Page, role: Role, email: string, password: string) {
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email address" }).fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url() === `${apiUrl}/auth/login` &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: /sign in/i }).click();
  const response = await responsePromise;
  expect(response.status(), `${role} login HTTP status`).toBe(200);
  const payload = await response.json();
  expect(payload.user?.role, `${role} account role`).toBe(role);
  await expect(page).toHaveURL(/\/board$/);
  return payload.accessToken as string;
}

for (const role of ["staff", "manager", "owner"] as const) {
  test(`real ${role} login, navigation, and read-only API permissions`, async ({
    page,
    request,
  }) => {
    const upper = role.toUpperCase();
    const email = process.env[`LIVE_API_${upper}_EMAIL`];
    const password = process.env[`LIVE_API_${upper}_PASSWORD`];
    test.skip(
      !email || !password,
      `Set LIVE_API_${upper}_EMAIL and LIVE_API_${upper}_PASSWORD for a disposable ${role} account.`,
    );
    const token = await signIn(page, role, email!, password!);
    const headers = { Authorization: `Bearer ${token}` };
    const getStatus = async (path: string) =>
      (await request.get(`${apiUrl}${path}`, { headers })).status();
    expect(await getStatus("/staff/orders?status=received&limit=1")).toBe(200);
    expect(await getStatus("/admin/dashboard?period=today")).toBe(
      role === "staff" ? 403 : 200,
    );
    expect(await getStatus("/admin/accounts?limit=1")).toBe(
      role === "owner" ? 200 : 403,
    );
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    await expect(nav.getByRole("link", { name: "Reports" })).toHaveCount(
      role === "staff" ? 0 : 1,
    );
    await expect(nav.getByRole("link", { name: "Accounts" })).toHaveCount(
      role === "owner" ? 1 : 0,
    );
    await page.goto("/accounts");
    if (role !== "owner")
      await expect(
        page.getByText("Only an Owner can manage accounts."),
      ).toBeVisible();
    else
      await expect(
        page.getByRole("heading", { name: "Accounts." }),
      ).toBeVisible();
  });
}
