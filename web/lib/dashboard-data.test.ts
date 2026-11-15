import { describe, expect, it } from "vitest";
import { bankDictionaries } from "./i18n";
import { dashboardCharts, dashboardStats, filterDashboardTransactions, mergeDashboardTransactions } from "./dashboard-data";
import { mockData } from "./mock-data";
import type { Transaction } from "./types";
import type { DemoTransaction } from "./store";

const base = mockData.transactions[0];
function tx(id: string, overrides: Partial<Transaction> = {}): Transaction { return { ...base, id, ...overrides }; }
const fixtures = [
  tx("low", { riskScore: 0, riskLevel: "low", status: "completed", timestamp: "2026-11-15T07:00:00Z" }),
  tx("medium", { riskScore: 35, riskLevel: "medium", status: "pending_review", timestamp: "2026-11-14T07:00:00Z" }),
  tx("high", { riskScore: 85, riskLevel: "high", status: "held", timestamp: "2026-11-13T07:00:00Z" }),
];
const rows = mergeDashboardTransactions(fixtures, [], [], mockData.customers, mockData.recipients);
it("merges by ID, prefers local data and applies decisions only to status without mutating sources", () => {
  const local: DemoTransaction = { ...fixtures[2], amount: 12345, status: "pending_review", recipientName: "Demo person", maskedAccount: "DEMO **** 1234", createdAt: "2026-11-15T12:00:00Z", clientDecision: "review_requested" };
  const decision = { transactionId: "high", action: "block" as const, decidedAt: "2026-11-15T12:01:00Z" };
  const before = JSON.stringify({ fixtures, local, decision });
  const merged = mergeDashboardTransactions(fixtures, [local], [decision], mockData.customers, mockData.recipients);
  expect(merged).toHaveLength(3);
  expect(merged.find((t) => t.id === "high")).toMatchObject({ amount: 12345, recipientName: mockData.recipients.find((r) => r.id === local.recipientId)!.name, source: "local", status: "blocked", riskScore: 85, riskLevel: "high", analystDecision: decision });
  expect(JSON.stringify({ fixtures, local, decision })).toBe(before);
});
it("allows without changing risk and ignores decisions for absent IDs", () => {
  const merged = mergeDashboardTransactions(fixtures, [], [{ transactionId: "high", action: "allow", decidedAt: "2026-11-15T12:01:00Z" }, { transactionId: "absent", action: "block", decidedAt: "2026-11-15T12:01:00Z" }], [], []);
  expect(merged).toHaveLength(3);
  expect(merged[2]).toMatchObject({ status: "completed", riskScore: 85, riskLevel: "high", customerName: fixtures[2].customerId, recipientName: fixtures[2].recipientId });
});
it("computes all-data KPIs and excludes pending_review/completed from prevented amount", () => {
  expect(dashboardStats([
    tx("1", { amount: 100, status: "held", riskScore: 10, riskLevel: "low" }),
    tx("2", { amount: 200, status: "blocked", riskScore: 30, riskLevel: "medium" }),
    tx("3", { amount: 300, status: "pending_review", riskScore: 90, riskLevel: "high" }),
    tx("4", { amount: 400, status: "completed", riskScore: 0, riskLevel: "low" }),
  ])).toEqual({ total: 4, flagged: 2, prevented: 300, average: 32.5 });
  expect(dashboardStats([])).toEqual({ total: 0, flagged: 0, prevented: 0, average: 0 });
});
it("filters independently by risk and status and sorts by risk or timestamp", () => {
  expect(filterDashboardTransactions(rows, "flagged", "all", "risk").map((tx) => tx.id)).toEqual(["high", "medium"]);
  expect(filterDashboardTransactions(rows, "all", "pending_review", "risk").map((tx) => tx.id)).toEqual(["medium"]);
  expect(filterDashboardTransactions(rows, "low", "held", "time")).toEqual([]);
  expect(filterDashboardTransactions(rows, "all", "all", "time").map((tx) => tx.id)).toEqual(["low", "medium", "high"]);
});
it("pins matching arrivals above other rows while honoring active filters", () => {
  expect(filterDashboardTransactions(rows, "all", "all", "risk", ["medium", "low"]).map((tx) => tx.id)).toEqual(["medium", "low", "high"]);
  expect(filterDashboardTransactions(rows, "flagged", "all", "risk", ["low"]).map((tx) => tx.id)).toEqual(["high", "medium"]);
});
describe("chart summaries", () => {
  it("uses 30 Almaty calendar days ending at newest data and counts flagged dates at boundaries", () => {
    const summary = dashboardCharts([
      tx("a", { timestamp: "2026-11-15T07:00:00Z", riskLevel: "low", signals: [] }),
      tx("b", { timestamp: "2026-11-14T20:00:00Z", riskLevel: "medium", signals: [] }),
      tx("c", { timestamp: "2026-10-16T20:00:00Z", riskLevel: "high", signals: [] }),
      tx("d", { timestamp: "2026-10-16T18:00:00Z", riskLevel: "high", signals: [] }),
    ]);
    expect(summary.daily).toHaveLength(30);
    expect(summary.daily[0]).toEqual({ day: "2026-10-17", count: 1 });
    expect(summary.daily.at(-1)).toEqual({ day: "2026-11-15", count: 1 });
    expect(summary.daily.reduce((sum, d) => sum + d.count, 0)).toBe(2);
    expect(summary.distribution).toEqual({ low: 1, medium: 1, high: 2 });
  });
  it("counts all signal occurrences and has a sensible empty summary", () => {
    const signal = { id: "new_device" as const, weight: 15, params: { deviceId: "fake" } };
    expect(dashboardCharts([tx("a", { signals: [signal] }), tx("b", { signals: [signal] })]).signals).toEqual([{ id: "new_device", count: 2 }]);
    expect(dashboardCharts([])).toEqual({ daily: [], distribution: { low: 0, medium: 0, high: 0 }, signals: [] });
  });
});
it("keeps matching non-empty RU/KK bank dictionaries", () => {
  expect(Object.keys(bankDictionaries.ru).sort()).toEqual(Object.keys(bankDictionaries.kk).sort());
  for (const dictionary of Object.values(bankDictionaries)) expect(Object.values(dictionary).every((s) => s.trim().length)).toBe(true);
});
