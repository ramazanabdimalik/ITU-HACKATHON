import { afterEach, beforeEach, expect, it, vi } from "vitest";
let store: typeof import("./dashboard-data");
let items: Map<string, string>;
const decision = { transactionId: "tx-1", action: "block" as const, decidedAt: "2026-11-15T12:00:00Z" };
beforeEach(async () => {
  vi.resetModules(); items = new Map();
  vi.stubGlobal("window", new EventTarget());
  vi.stubGlobal("localStorage", { getItem: (key: string) => items.get(key) ?? null, setItem: (key: string, value: string) => items.set(key, value) });
  store = await import("./dashboard-data");
});
afterEach(() => vi.unstubAllGlobals());
it("safely handles empty, malformed, unsupported and invalid stored decisions", () => {
  expect(store.getAnalystDecisions()).toEqual([]);
  for (const value of ["{", "null", "[]", '{"version":99,"decisions":[]}', '{"version":1,"decisions":[{"transactionId":"bad"}]}']) {
    items.set(store.DECISION_STORAGE_KEY, value);
    expect(store.getAnalystDecisions()).toEqual([]);
  }
});
it("upserts block to allow for the same ID and notifies listeners", () => {
  const listener = vi.fn(); window.addEventListener("safetransfer-decisions", listener);
  expect(store.saveAnalystDecision(decision)).toBe(true);
  const allowed = { ...decision, action: "allow" as const };
  expect(store.saveAnalystDecision(allowed)).toBe(true);
  expect(store.getAnalystDecisions()).toEqual([allowed]);
  expect(listener).toHaveBeenCalledTimes(2);
});
it("retains decisions for this session when storage is denied", () => {
  vi.stubGlobal("localStorage", { getItem: () => { throw Error("Denied"); }, setItem: () => { throw Error("Quota"); } });
  expect(store.saveAnalystDecision(decision)).toBe(false);
  expect(store.getAnalystDecisions()).toEqual([decision]);
});
it("rejects invalid inputs and is safe during SSR", () => {
  expect(store.saveAnalystDecision({ ...decision, transactionId: "" })).toBe(false);
  vi.stubGlobal("window", undefined);
  expect(store.getAnalystDecisions()).toEqual([]);
  expect(store.saveAnalystDecision(decision)).toBe(false);
});
