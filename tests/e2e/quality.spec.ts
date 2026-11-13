import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

type Role = "staff" | "manager" | "owner";
const created = "2026-11-13T04:00:00.000Z";
const account = { id: 2, name: "Ana", email: "ana@example.com", role: "staff", active: true, invitePending: true, inviteExpiresAt: created, createdAt: created, updatedAt: created };

async function mockApi(page: Page, role: Role) {
  const user = { id: 1, name: "Test User", email: "test@example.com", role, active: true };
  const cors = { "access-control-allow-origin": process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3102", "access-control-allow-credentials": "true", "access-control-allow-headers": "authorization, content-type", "access-control-allow-methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS" };
  await page.route(`${process.env.PLAYWRIGHT_API_URL ?? "http://localhost:4000"}/**`, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    if (request.method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
    if (path === "/auth/refresh") return route.fulfill({ json: { accessToken: "mock-token", user }, headers: cors });
    if (path === "/auth/me") return route.fulfill({ json: { success: true, data: user }, headers: cors });
    if (path === "/staff/realtime/events") return route.fulfill({ status: 503, json: { message: "Realtime unavailable" }, headers: cors });
    if (path === "/staff/realtime/changes") return route.fulfill({ status: 204, headers: cors });
    if (path === "/admin/accounts" && request.method() === "POST") return route.fulfill({ status: 201, json: { success: true, message: "Account created, but the invite email could not be sent. Use resend invite to try again.", data: account, inviteEmailSent: false }, headers: cors });
    if (path === "/admin/accounts") return route.fulfill({ json: { success: true, data: [account, { ...account, id: 1, name: "Test User", role, email: user.email, invitePending: false, inviteExpiresAt: null }], pagination: { limit: 25, offset: 0, total: 2, hasMore: false } }, headers: cors });
    if (path === "/admin/dashboard") return route.fulfill({ json: { success: true, currency: "PHP", data: { range: { from: "2026-11-13", to: "2026-11-13", timezone: "Asia/Manila" }, totalOrders: 0, revenue: "0.00", paidOrders: 0, unpaidOrders: 0, statusBreakdown: [], bestSellers: [], peakHours: Array.from({ length: 24 }, (_, hour) => ({ hour, orders: 0 })) } }, headers: cors });
    if (path === "/admin/orders") return route.fulfill({ json: { success: true, currency: "PHP", data: [], pagination: { limit: 25, offset: 0, total: 0, hasMore: false } }, headers: cors });
    if (path === "/admin/exports/orders.csv") return route.fulfill({ body: '"Order ID","Time (UTC)"\r\n', headers: { ...cors, "content-type": "text/csv" } });
    if (path === "/admin/menu-items" || path === "/admin/tables") return route.fulfill({ json: { success: true, data: [], pagination: { limit: 100, offset: 0, total: 0, hasMore: false } }, headers: cors });
    if (path === "/staff/orders" || path === "/staff/tables") return route.fulfill({ json: { success: true, data: [], pagination: { limit: 100, offset: 0, total: 0, hasMore: false } }, headers: cors });
    return route.fulfill({ status: 404, json: { message: `Unmocked: ${path}` }, headers: cors });
  });
}

test("public sign-in has no automatically detected accessibility violations", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("private routes redirect signed-out visitors to sign-in", async ({ page }) => {
  await page.goto("/accounts");
  await expect(page).toHaveURL(/\/login\?next=%2Faccounts/);
});

test("Staff navigation hides management and direct Owner page shows access restriction", async ({ page }) => {
  await mockApi(page, "staff");
  await page.goto("/board");
  await expect(page.getByRole("heading", { name: /live orders/i })).toBeVisible();
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await expect(nav.getByRole("link", { name: /accounts/i })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: /reports/i })).toHaveCount(0);
  await page.goto("/accounts");
  await expect(page.getByText("Only an Owner can manage accounts.")).toBeVisible();
});

test("Manager sees reports but not accounts", async ({ page }) => {
  await mockApi(page, "manager");
  await page.goto("/reports");
  await expect(page.getByRole("heading", { name: "Reports." })).toBeVisible();
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await expect(nav.getByRole("link", { name: "Reports" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Accounts" })).toHaveCount(0);
  await expect(page.getByText("No orders in this range.")).toBeVisible();
});

test("Owner account invite shows email failure and mobile navigation works by keyboard", async ({ page }) => {
  await mockApi(page, "owner");
  await page.setViewportSize({ width: 390, height: 720 });
  await page.goto("/accounts");
  await expect(page.getByRole("heading", { name: "Accounts." })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.setViewportSize({ width: 320, height: 640 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const menu = page.getByRole("button", { name: "Menu" });
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Accounts" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(menu).toBeFocused();
  await page.getByRole("button", { name: "Invite team member" }).click();
  await page.getByRole("textbox", { name: "Name" }).fill("New staff");
  await page.getByRole("textbox", { name: "Email" }).fill("new@example.com");
  await page.getByRole("button", { name: "Create and email invite" }).click();
  await expect(page.getByRole("status").filter({ hasText: "invite email could not be sent" })).toBeVisible();
});

test("report custom dates reject incomplete ranges; CSV uses a separate range", async ({ page }) => {
  await mockApi(page, "owner");
  await page.goto("/reports");
  await page.getByRole("combobox", { name: "Period" }).selectOption("custom");
  await page.getByRole("button", { name: "Show dashboard" }).click();
  await expect(page.getByText("Select both dates.")).toBeVisible();
  const exportSection = page.getByRole("heading", { name: /Export orders/i }).locator("..");
  await expect(exportSection).toBeVisible();
  await page.getByRole("combobox", { name: "Status" }).selectOption("cancelled");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await exportSection.getByLabel("From (Manila date)").fill("2026-11-01");
  await exportSection.getByLabel("To (Manila date)").fill("2026-11-13");
  const request = page.waitForRequest((req) => req.url().includes("/admin/exports/orders.csv"));
  const download = page.waitForEvent("download");
  await exportSection.getByRole("button", { name: "Download CSV" }).click();
  expect(new URL((await request).url()).search).toBe("?from=2026-11-01&to=2026-11-13");
  expect((await download).suggestedFilename()).toBe("enjoyer-orders-2026-11-01-to-2026-11-13.csv");
  await expect(page.getByText("CSV download started.")).toBeHidden({ timeout: 10_000 });
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
