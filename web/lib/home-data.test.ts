import { expect, it } from "vitest";
import { homeData, homeInsights, demoBalance } from "./home-data";
import { mergeDashboardTransactions } from "./dashboard-data";
import { transferPrefill } from "./transfer-prefill";
import { mockData } from "./mock-data";
import { pageCopy } from "./page-metadata";
import { redesignDictionaries } from "./i18n";
import type { Transaction } from "./types";
const base = mockData.transactions[0];
function row(id: string, patch: Partial<Transaction>): Transaction { return { ...base, id, customerId: "customer-1", timestamp: "2026-11-15T07:00:00Z", ...patch }; }
it("calculates selected-customer counts and high-risk stopped share from statuses", () => {
  const rows = mergeDashboardTransactions([
    row("a", { riskLevel: "low", status: "completed" }), row("b", { riskLevel: "medium", status: "held" }),
    row("c", { riskLevel: "high", status: "blocked" }), row("d", { riskLevel: "high", status: "completed" }),
    row("other", { customerId: "customer-2", riskLevel: "high", status: "held" }),
  ], [], [], mockData.customers, mockData.recipients);
  expect(homeData(rows, "customer-1")).toMatchObject({ total: 4, stopped: 2, highShare: 50 });
});
it("has no invented percentage when no high-risk records exist", () => { expect(homeData([], "customer-1")).toMatchObject({ total: 0, stopped: 0, highShare: null, recent: [], daily: [] }); });
it("limits recent records to four and charts to seven Almaty data days", () => {
  const rows = mergeDashboardTransactions(mockData.transactions, [], [], mockData.customers, mockData.recipients);
  const result = homeData(rows, "customer-1");
  expect(result.total).toBe(41); expect(result.stopped).toBe(2); expect(result.highShare).toBe(100);
  expect(result.recent).toHaveLength(4); expect(result.daily).toHaveLength(7);
  expect(result.recent.every((tx) => tx.customerId === "customer-1")).toBe(true);
});
it("builds three real insight rows in both languages and handles no flagged data", () => {
  const rows = mergeDashboardTransactions(mockData.transactions, [], [], mockData.customers, mockData.recipients);
  const tx = homeData(rows, "customer-1").latestFlagged;
  for (const lang of ["ru", "kk"] as const) { const items = homeInsights(tx, lang); expect(items).toHaveLength(3); expect(items.every((item) => item.title && item.text)).toBe(true); }
  expect(homeInsights(undefined, "ru")).toEqual([]);
});
it("uses the existing demo balance formula for account presentation", () => { expect(demoBalance("customer-1")).toBe(2675000); expect(demoBalance("customer-8")).toBe(3900000); });
it("prefills safe quick-transfer values without changing scoring inputs", () => {
  const customer = mockData.customers[0];
  expect(transferPrefill(new URLSearchParams({ recipientId: "recipient-1", amount: "1234.5" }), customer, mockData.recipients)).toMatchObject({ recipientId: "recipient-1", amount: "1\u00a0234,5", device: "known", time: "now" });
});
it("ignores unknown recipients and invalid amounts in route parameters", () => {
  expect(transferPrefill(new URLSearchParams({ recipientId: "unknown", amount: "-1" }), mockData.customers[0], mockData.recipients)).toMatchObject({ recipientId: "", amount: "" });
});
it("keeps new route metadata and reference copy fully bilingual", () => {
  expect(Object.keys(redesignDictionaries.ru).sort()).toEqual(Object.keys(redesignDictionaries.kk).sort());
  expect(pageCopy("ru", "home").title).not.toBe(pageCopy("ru", "transfer").title);
  expect(pageCopy("kk", "home").title).toContain("Басты бет");
});
