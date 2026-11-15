import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { DemoTransaction } from "./store";

let store: typeof import("./store");
let items: Map<string, string>;
const held: DemoTransaction = {
  id: "DEMO-1", customerId: "customer-1", recipientId: "recipient-18", recipientName: "Demo",
  maskedAccount: "DEMO **** 1017", amount: 20000, timestamp: "2026-11-15T07:00:00Z", createdAt: "2026-11-15T07:00:00Z", deviceId: "device-1", city: "Алматы", status: "held", riskScore: 85, riskLevel: "high", signals: [], clientDecision: "held",
};
beforeEach(async () => {
  vi.resetModules(); items = new Map();
  vi.stubGlobal("window", {});
  vi.stubGlobal("localStorage", { getItem: vi.fn((key: string) => items.get(key) ?? null), setItem: vi.fn((key: string, value: string) => items.set(key, value)) });
  store = await import("./store");
});
afterEach(() => vi.unstubAllGlobals());
it("returns empty for fresh, malformed or unsupported stored data", () => {
  expect(store.getTransactions()).toEqual([]);
  for (const value of ["{", "null", "[]", '{"version":99,"transactions":[]}', '{"version":1,"transactions":[{"id":"bad"}]}']) {
    items.set(store.TRANSACTION_STORAGE_KEY, value);
    expect(store.getTransactions()).toEqual([]);
  }
});
it("upserts a held transfer to pending_review without duplicate IDs", () => {
  expect(store.saveTransaction(held)).toBe(true);
  expect(store.saveTransaction({ ...held, status: "pending_review", clientDecision: "review_requested" })).toBe(true);
  expect(store.getTransactions()).toEqual([{ ...held, status: "pending_review", clientDecision: "review_requested" }]);
});
it("survives denied/quota-limited storage and retains session data", () => {
  vi.stubGlobal("localStorage", { getItem: () => { throw Error("Denied"); }, setItem: () => { throw Error("Quota"); } });
  expect(store.getTransactions()).toEqual([]);
  expect(store.saveTransaction(held)).toBe(false);
  expect(store.getTransactions()).toEqual([held]);
});
it("is safe during SSR and rejects malformed records before writing", () => {
  expect(store.saveTransaction({ ...held, riskScore: NaN })).toBe(false);
  vi.stubGlobal("window", undefined);
  expect(store.getTransactions()).toEqual([]);
  expect(store.saveTransaction(held)).toBe(false);
});
