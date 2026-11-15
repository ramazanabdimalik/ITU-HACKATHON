import { expect, it } from "vitest";
import { mockData } from "./mock-data";
import { scoreTransaction } from "./risk-engine";
import type { Transaction } from "./types";

it("keeps the generated fixture complete, chronological and consistent with engine results", () => {
  const { customers, recipients, transactions } = mockData;
  expect(customers).toHaveLength(8);
  expect(recipients).toHaveLength(20);
  expect(recipients.filter((r) => r.flagged)).toHaveLength(3);
  expect(transactions).toHaveLength(300);
  expect(new Set(transactions.map((tx) => tx.id)).size).toBe(300);
  for (const c of customers) {
    expect(c.typicalHours).toHaveLength(2);
    expect(c.typicalHours.every((h) => Number.isInteger(h) && h >= 0 && h < 24)).toBe(true);
  }
  const now = Date.parse("2026-11-15T12:00:00.000Z");
  const history: Transaction[] = [];
  for (const tx of transactions) {
    const time = Date.parse(tx.timestamp);
    expect(time).toBeGreaterThanOrEqual(now - 30 * 86400000);
    expect(time).toBeLessThanOrEqual(now);
    if (history.length) expect(time).toBeGreaterThanOrEqual(Date.parse(history.at(-1)!.timestamp));
    const customer = customers.find((c) => c.id === tx.customerId)!;
    expect(customer).toBeDefined();
    expect(recipients.some((r) => r.id === tx.recipientId)).toBe(true);
    const result = scoreTransaction(tx, customer, history, recipients);
    expect({ score: tx.riskScore, level: tx.riskLevel, signals: tx.signals }).toEqual({ score: result.score, level: result.level, signals: result.signals });
    expect(tx.status).toBe(result.action === "hold" ? "held" : result.action === "confirm" ? "pending_review" : "completed");
    history.push(tx);
  }
});
