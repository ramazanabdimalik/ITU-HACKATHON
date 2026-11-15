import { describe, expect, it } from "vitest";
import { uiDictionaries } from "./i18n";
import { emptyForm, formatAmountInput, parseAmount, transferPayload, validateTransfer } from "./transfer-form";
import { scenarioValues } from "./demo-scenarios";
import { mockData } from "./mock-data";
import { scoreTransaction } from "./risk-engine";

it("keeps non-empty matching Russian and Kazakh UI dictionaries", () => {
  expect(Object.keys(uiDictionaries.ru).sort()).toEqual(Object.keys(uiDictionaries.kk).sort());
  for (const dictionary of Object.values(uiDictionaries)) expect(Object.values(dictionary).every((value) => value.trim().length > 0)).toBe(true);
});
it("parses localized amounts without accepting exponent, excess decimals or negative numbers", () => {
  expect(parseAmount("20 000,50")).toBe(20000.5);
  expect(parseAmount("20\u202f000.50")).toBe(20000.5);
  for (const amount of ["-1", "1e4", "20,001", "abc", ""]) expect(parseAmount(amount)).toBeNaN();
});
it("validates required fields, safe amount range and DEMO-only new accounts", () => {
  expect(validateTransfer(emptyForm)).toMatchObject({ amount: "amountError", recipientId: "recipientError" });
  const values = scenarioValues("night", mockData.customers[0], "Demo person");
  expect(validateTransfer(values)).toEqual({});
  expect(validateTransfer({ ...values, recipientAccount: "KZ123456789" })).toMatchObject({ recipientAccount: "accountError" });
  expect(validateTransfer({ ...values, amount: "10000001", recipientName: "x" })).toMatchObject({ amount: "amountError", recipientName: "nameError" });
});
it("sends device, timezone-aware time and new recipient details to the API without scoring locally", () => {
  const c = mockData.customers[0];
  const values = scenarioValues("night", c, "Demo person");
  expect(transferPayload(values, c, "kk")).toMatchObject({ customerId: c.id, deviceId: c.knownDeviceIds[0], timestamp: "2026-11-13T18:00:00.000Z", lang: "kk", newRecipient: { name: "Demo person", account: "DEMO-2026" } });
  expect(transferPayload({ ...values, device: "new" }, c, "ru").deviceId).not.toBe(c.knownDeviceIds[0]);
});
describe("one-click seeded scenarios use the real risk engine", () => {
  it.each([
    ["normal", 0, "low", "allow"], ["night", 60, "high", "hold"],
    ["flagged", 85, "high", "hold"], ["velocity", 35, "medium", "confirm"],
  ] as const)("%s produces %i/%s/%s", (id, score, level, action) => {
    const customer = mockData.customers[0];
    const values = scenarioValues(id, customer, "Demo person");
    const payload = transferPayload(values, customer, "ru");
    const result = scoreTransaction({ ...payload, city: customer.homeCity }, customer, mockData.transactions, mockData.recipients);
    expect(result).toMatchObject({ score, level, action });
    expect(validateTransfer(values)).toEqual({});
  });
});

it("keeps formatted KZT input valid on blur in both languages", () => {
  for (const amount of [1, 20000, 20000.5, 240000, 9999999.99]) expect(parseAmount(formatAmountInput(amount))).toBe(amount);
});
