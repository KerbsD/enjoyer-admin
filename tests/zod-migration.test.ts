import assert from "node:assert/strict";
import { test } from "node:test";
import { accountSchema } from "../src/modules/Accounts/schema.ts";
import { loginSchema, passwordSchema } from "../src/modules/Auth/schemas.ts";
import {
  categorySchema,
  groupSchema,
  itemSchema,
  money,
  position,
} from "../src/modules/Menu/schemas.ts";
import {
  calendarDate,
  daySchema,
  timingsSchema,
} from "../src/modules/Settings/schemas.ts";
import { tableSchema } from "../src/modules/Tables/schema.ts";

const message = (
  schema: {
    safeParse: (input: unknown) => {
      success: boolean;
      error?: { issues: { message: string }[] };
    };
  },
  input: unknown,
) => {
  const result = schema.safeParse(input);
  assert.equal(result.success, false);
  return result.error?.issues[0]?.message;
};

test("Zod 4 preserves number-field feedback for blank and invalid form inputs", () => {
  assert.equal(message(position, Number.NaN), "Enter a whole-number position.");
  assert.equal(
    message(tableSchema, { name: "Table 1", orderLimit: Number.NaN }),
    "Enter a whole-number limit.",
  );
  assert.equal(
    message(timingsSchema, {
      idleTimeoutMinutes: Number.NaN,
      confirmationExpiryMinutes: 10,
    }),
    "Enter an idle timeout.",
  );
  assert.equal(
    message(timingsSchema, {
      idleTimeoutMinutes: 180,
      confirmationExpiryMinutes: Number.NaN,
    }),
    "Enter a confirmation expiry.",
  );
  assert.equal(
    message(tableSchema, { name: "Table 1", orderLimit: 1.5 }),
    "Use a whole number.",
  );
});

test("Zod 4 preserves PHP normalization, trimming, and cross-field validation", () => {
  assert.deepEqual(categorySchema.parse({ name: "  Drinks  ", sortOrder: 0 }), {
    name: "Drinks",
    sortOrder: 0,
  });
  assert.equal(money.parse("35.5"), "35.50");
  assert.equal(
    itemSchema.parse({
      categoryId: 1,
      name: " Tea ",
      description: "",
      price: "35.5",
      isSpicy: false,
      isAvailable: true,
      isHidden: false,
      sortOrder: 0,
    }).price,
    "35.50",
  );
  assert.equal(
    accountSchema.parse({
      name: " Ana ",
      email: " ana@example.com ",
      role: "staff",
    }).email,
    "ana@example.com",
  );
  assert.equal(
    groupSchema.safeParse({
      name: "Milk",
      minSelections: 2,
      maxSelections: 1,
      sortOrder: 0,
    }).success,
    false,
  );
  assert.equal(
    daySchema.safeParse({
      closed: false,
      openTime: "18:00",
      closeTime: "08:00",
    }).success,
    false,
  );
  assert.equal(daySchema.safeParse({ closed: true }).success, true);
  assert.equal(calendarDate.safeParse("2025-02-29").success, false);
  assert.equal(calendarDate.safeParse("2024-02-29").success, true);
});

test("Zod 4 continues to reject invalid credentials and overlong UTF-8 passwords", () => {
  assert.equal(
    loginSchema.safeParse({ email: "bad", pwd: "abc" }).success,
    false,
  );
  assert.equal(
    passwordSchema.safeParse({ newPwd: "€".repeat(25) }).success,
    false,
  );
  assert.equal(
    passwordSchema.safeParse({ newPwd: "valid-password-123" }).success,
    true,
  );
});
