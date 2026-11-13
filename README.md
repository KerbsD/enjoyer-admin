# Enjoyer staff/admin frontend

Phase 1 of the frontend roadmap. This is a separate Next.js application from `../api`. Product behavior follows `../specs.md`; architecture draws on `E:/Programming/smt/smt-fe`, not its studio features or visual palette.

## Run locally

Requires Node.js 22+ and the Enjoyer API running at `http://localhost:3000`.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3001`. Add `http://localhost:3001` to the API's `CORS_ORIGINS` and set API `CLIENT_URL=http://localhost:3001` for emailed invite and reset links. The refresh cookie must be allowed for this frontend origin. In local development use the same hostname (`localhost`) for API and frontend.

The API sends invite links to `/accept-invite#token=…` and reset links to `/reset-password#token=…`. The token stays in the URL fragment (never the query string); accepting an invite does not automatically log the user in. There is no public registration.

Phase 1 includes login, logout, refresh-cookie bootstrap, `/auth/me` identity check, forgot/reset password, invite acceptance, guarded shell, role-aware navigation and Enjoyer design tokens. Frontend navigation is cosmetic: backend permissions are the security boundary.

## Phase 2: staff operations

- `/board` shows Pending confirmation, Received, Preparing, Ready and Served orders oldest first. The board retrieves all pages for each status; cancelled/rejected orders are excluded from the live board, not the API's history. Served unpaid orders remain flagged.
- Staff may confirm/reject a first order, move an order forward one step, cancel at any active status with a required reason (max 500 characters), and mark a Served order paid with cash or other. Only Manager/Owner sees the one-step-back action. The API checks all permissions and current states again when each action is submitted.
- `/tables` shows current-session status, order use/remaining and unpaid PHP total. Opening a tile displays current-session orders, totals and close controls. Staff cannot close an unpaid table; Manager/Owner can explicitly confirm the override. A newly discovered unpaid conflict refreshes totals before another attempt.
- The board and table overview use the API's bearer-header `src/client/realtime.ts` SSE helper (copied to `src/lib/realtime.ts`), including polling fallback. Incoming new-order IDs compared with the previous board result trigger an in-page visual alert. Sound requires an explicit **Enable sound** gesture because browsers restrict autoplay. Initial sync and reconnect establish baselines, not false new-order alerts.
- API instants are formatted for `Asia/Manila`; money is displayed as Philippine pesos. No refund flow or online payment control is added.

The staff API currently includes all Served orders in the live list, even after their tables close. The board pages through all of them so it never silently hides later entries; monitor this query volume as order history grows and define an archival policy before changing which orders are shown.

## Phase 3: menu operations

- `/availability` is available to Staff, Manager and Owner. It reads the public `/menu` list (which excludes hidden items) and sets explicit availability through `PATCH /staff/menu-items/:id/availability`. Sold-out items stay visible to customers; hidden items are a separate Manager control.
- `/menu` is limited to Manager/Owner. Categories and items can be created/edited and reordered with their numeric positions. Item editing supports PHP prices, descriptions, spicy markers, availability and hiding. There is no API delete action, so none is offered.
- Option groups and choices can be created/edited; selection minimum/maximum, choice surcharges, availability and positions are supported. A newly created group starts with one choice; add more choices before increasing its minimum above one. Group changes are shared by all attached items.
- An item's **Add-ons** editor loads its current group assignments before enabling Save. Saving uses the API's full-replacement `PUT` with every checked group ID; an empty selection removes all assignments. Item, category and option queries refresh after writes and on the realtime `menu` invalidation. All menu list pages are retrieved, including hidden items in Manager view.

All prices remain exact decimal strings (no rounding) until displayed as Philippine pesos. Actual API permissions and validation remain authoritative; the frontend's controls are not a security boundary.

## Phase 4: table management and QR codes

- `/table-management` is Manager/Owner-only. It retrieves all physical tables, including inactive ones; provides active/inactive filtering; creates tables; edits names and per-session order limits; and offers explicit confirmation for deactivation/reactivation. Staff continue using `/tables` for live service and cannot access this management page. There is no table deletion or QR-token rotation endpoint.
- Active tables provide **Download PNG** and **Download SVG**. The **Download printable QR sheet** action saves the API-generated HTML for all active tables; open the saved file in a browser and Print. Inactive QR downloads are disabled in the UI and rejected by the API. Downloads use bearer headers and the in-memory token refresh path, never credentials in query strings. The QR token itself is not displayed; the UI shows only the customer destination origin/path for review.
- **Before printing for service:** configure the API's `CUSTOMER_URL` to the customer frontend origin and verify its `/order` page. If unset, the API falls back to `CLIENT_URL` (the admin frontend). The customer frontend is not yet built, so generated codes must not be distributed for real ordering yet.
- Physical table updates invalidate the staff table overview; realtime table changes refresh management data. Deactivating a table does not close an already open session; close it through the live `/tables` screen when appropriate.

## Phase 5: settings, weekly hours and holiday overrides

- `/settings` is Manager/Owner-only. **Session timing** reads/writes idle timeout (1–1440 minutes) and first-order confirmation expiry (1–120 minutes). The shop timezone is read-only (`Asia/Manila`).
- **Weekly hours** shows all seven weekdays (Sunday=0) and their configured state. A day is open with shop-local `HH:mm` opening/closing times, or closed all day. Close must be later than open; overnight hours are not supported. Before the first weekday is saved, ordering is unrestricted on unconfigured days; once any weekday is saved, all remaining unconfigured weekdays become closed. The UI calls this out and requires acknowledgement for that first save.
- **Holiday overrides** lists every date across paginated API results, with optional local from/to filtering. Create/edit overrides for real `YYYY-MM-DD` dates; remove an override to restore weekly behavior. A date edit requires removing the old override and creating a new one. Holiday hours take precedence over the weekday schedule.
- Current status comes from public `GET /store/status`; `closesAt`/`nextOpen` UTC instants are formatted in Manila time. Realtime `store` invalidations refresh settings, hours, holidays, and status. No temporary ordering-pause control was introduced: its product rules are still undecided in `../specs.md`.

## Phase 6: dashboard, history and CSV export

- `/reports` is Manager/Owner-only. The dashboard offers today, rolling seven or 30 shop dates, or a custom paired `YYYY-MM-DD` range. It displays PHP paid revenue, order counts, status breakdown, best sellers, and Manila-hour demand. Revenue includes paid cancelled orders; best sellers and peak hours exclude cancelled and rejected orders. Empty results are labelled.
- Order history supports optional paired Manila-date range, table, item, status, payment, and text search (order number, table name, or snapshotted item name). Apply/clear filters resets pagination; results load 25 at a time, with full snapshotted order details on demand. All statuses are included by default.
- CSV download has its **own required date range**; history filters never affect it. It includes all orders in the selected inclusive shop-date range. The API CSV's `Time (UTC)` column is UTC, while timestamps shown on the page are formatted in Manila time. Downloads use bearer-authenticated attachment requests and never put credentials in the URL.
- Order changes invalidate report data through the existing staff realtime connection. Browser verification with a running API and Manager/Owner credentials remains to be done.

## Phase 7: Owner account management

- `/accounts` is Owner-only. The list is server-paginated (25 per page) with name/email search, role and active filters, and created-date/name sorting. The backend checks fresh Owner permissions on every request.
- Owners can create Staff, Manager or Owner accounts with emailed, 72-hour password-setting invites; edit names/roles; deactivate and reactivate; and resend invites only for active accounts that have not set a password. The UI displays the API's invite delivery result, including when the account was created but email delivery failed. A resend rotates the old link and is subject to an API cooldown; mail failures may still rotate it.
- Accounts are never deleted. An Owner cannot demote or deactivate themselves. Role changes revoke the affected person's sessions; deactivation also revokes their sessions and outstanding links. Reactivating a pending account does **not** email a new invite: resend it separately. API state and rules remain authoritative.

## Phase 8: quality pass

- Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, then `npx playwright install chromium` (once per machine) and `npm run test:e2e`. The Playwright suite starts the production build on port 3102; `PLAYWRIGHT_BASE_URL` can point it at an already running frontend. Its network fixtures expect the frontend's API URL to be `http://localhost:4000` (as configured in this checkout's `.env`); set `PLAYWRIGHT_API_URL` if that URL changes. These fixtures **mock the API**; they do not validate real authentication, database rules, SSE, or email delivery.
- Browser coverage checks signed-out redirection; Staff/Manager/Owner navigation and direct-route restrictions; Owner invitation feedback; a 390px/320px layout and keyboard-closeable mobile navigation; dashboard date validation; independently ranged authenticated CSV download; and automated axe checks on sign-in, accounts, and reports. The shell has a keyboard skip link and the auth pages have main landmarks. Automated axe checks do not replace screen-reader, zoom, or manual WCAG review.
- **Still required before release, with a running API and disposable accounts:** sign in separately as Staff, Manager, and Owner; verify direct routes also return correct API 403s; exercise order progression/payment/table close, Manager menu/hours/reports/export, Owner invite/role change/deactivate/reactivate, and fresh-login behavior after session revocation. Verify both SSE and polling, QR printing with the actual customer origin, email links, the network/console, narrow screens and keyboard/screen-reader operation. Do not distribute QR codes until the customer `/order` app exists.
- Dependency audit currently reports one high-severity production advisory for Zod 3 (`GHSA-mrhx-c7xc-m3w5`); `npm audit fix` requires the breaking Zod 4 migration. Do not claim this check is clean or apply `--force` without adapting and testing the schemas.

## Frontend roadmap

1. **Foundation and authentication** — implemented.
2. **Staff operations** — implemented.
3. **Menu operations** — implemented.
4. **Table management** — implemented.
5. **Shop settings** — implemented.
6. **Reports** — implemented.
7. **Owner accounts** — implemented.
8. **Quality pass** — automated responsive/a11y and mocked role checks implemented; real-API, device and screen-reader sign-off pending.

No pause-ordering, activity-log, or unspecified notification controls until their product rules are decided in `../specs.md`.

Scripts: `npm run typecheck`, `npm run lint`, `npm run build`, `npm test`.
