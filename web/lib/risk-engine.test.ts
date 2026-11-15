import { describe, expect, it } from "vitest";
import { RISK_CONFIG, scoreTransaction } from "./risk-engine";
import type { Customer, Recipient, Transaction, TransactionInput } from "./types";

const customer: Customer = {
  id: "c1", name: "Fake customer", avgTransferAmount: 10000,
  typicalHours: [8, 21], knownDeviceIds: ["d1"], knownRecipientIds: ["r1", "mule"], homeCity: "Алматы",
};
const recipients: Recipient[] = [
  { id: "r1", name: "Fake recipient", maskedAccount: "DEMO **** 1000", flagged: false },
  { id: "mule", name: "Fake flagged recipient", maskedAccount: "DEMO **** 1001", flagged: true },
];
const input: TransactionInput = {
  id: "current", customerId: "c1", recipientId: "r1", amount: 10000,
  timestamp: "2026-11-15T07:00:00Z", deviceId: "d1", city: "Алматы",
};
function tx(id: string, minutesAgo: number, overrides: Partial<Transaction> = {}): Transaction {
  return {
    ...input, id, timestamp: new Date(Date.parse(input.timestamp) - minutesAgo * 60000).toISOString(),
    status: "completed", riskScore: 0, riskLevel: "low", signals: [], ...overrides,
  };
}
function score(patch: Partial<TransactionInput> = {}, history: Transaction[] = [], c = customer) {
  return scoreTransaction({ ...input, ...patch }, c, history, recipients);
}
function signal(patch: Partial<TransactionInput>, id: string) {
  return score(patch).signals.find((s) => s.id === id);
}

describe("scoreTransaction", () => {
  it("allows normal behavior and does not mutate its inputs", () => {
    const history = [tx("past", 20)];
    const before = JSON.stringify({ input, customer, history, recipients });
    Object.freeze(input); Object.freeze(customer); Object.freeze(recipients); Object.freeze(history);
    expect(scoreTransaction(input, customer, history, recipients)).toEqual({ score: 0, level: "low", action: "allow", signals: [] });
    expect(JSON.stringify({ input, customer, history, recipients })).toBe(before);
  });

  it("adds 20 for a new recipient with machine-readable params", () => {
    expect(signal({ recipientId: "new" }, "new_recipient")).toEqual({ id: "new_recipient", weight: 20, params: { recipientId: "new" } });
  });

  it("uses strict 3x/8x boundaries and never stacks amount tiers", () => {
    for (const [amount, weight] of [[30000, 0], [30001, 15], [80000, 15], [80001, 30]]) {
      const s = signal({ amount }, "large_amount");
      expect(s?.weight ?? 0).toBe(weight);
      if (s) expect(s.params).toMatchObject({ amount, average: 10000, ratio: amount / 10000 });
      expect(score({ amount }).signals.filter((s) => s.id === "large_amount")).toHaveLength(weight ? 1 : 0);
    }
  });

  it("uses Almaty local hours with inclusive start and exclusive end", () => {
    expect(signal({ timestamp: "2026-11-15T03:00:00Z" }, "unusual_hour")).toBeUndefined(); // 08:00
    expect(signal({ timestamp: "2026-11-15T16:00:00Z" }, "unusual_hour")).toMatchObject({ weight: 10, params: { hour: 21, start: 8, end: 21, timeZone: "Asia/Almaty" } });
  });

  it("supports overnight typical hours and equal endpoints as all-day", () => {
    const overnight: Customer = { ...customer, typicalHours: [22, 6] };
    expect(score({ timestamp: "2026-11-15T18:00:00Z" }, [], overnight).score).toBe(0); // 23:00
    expect(score({ timestamp: "2026-11-15T01:00:00Z" }, [], overnight).score).toBe(10); // 06:00
    expect(score({}, [], { ...customer, typicalHours: [0, 0] }).score).toBe(0);
  });

  it("adds 15 for a new device", () => {
    expect(signal({ deviceId: "new-device" }, "new_device")).toEqual({ id: "new_device", weight: 15, params: { deviceId: "new-device" } });
  });

  it("detects 3 transfers including current, with a 10-minute inclusive window", () => {
    expect(score({}, [tx("a", 1)]).score).toBe(0);
    const result = score({}, [tx("a", 1), tx("b", 10)]);
    expect(result.signals).toEqual([{ id: "velocity", weight: 20, params: { count: 3, windowMinutes: 10 } }]);
    expect(score({}, [tx("a", 10.01), tx("b", -1), tx("c", 1, { customerId: "other" }), tx("current", 0)]).score).toBe(0);
  });

  it("adds flagged weight 40 and enforces floor 85 even for a known recipient", () => {
    const result = score({ recipientId: "mule" });
    expect(result.signals).toEqual([{ id: "flagged_recipient", weight: 40, params: { recipientId: "mule", scoreFloor: 85 } }]);
    expect(result).toMatchObject({ score: 85, level: "high", action: "hold" });
  });

  it("detects structuring only in [475000, 500000) KZT", () => {
    for (const [amount, expected] of [[474999, false], [475000, true], [499999, true], [500000, false]] as const) {
      const s = signal({ amount }, "structuring");
      expect(Boolean(s)).toBe(expected);
      if (s) expect(s).toMatchObject({ weight: 10, params: { amount, threshold: 500000, lowerBound: 475000 } });
    }
  });

  it("caps the combined score at 100 without removing individual signals", () => {
    const result = score({ recipientId: "mule", deviceId: "new", amount: 480000, timestamp: "2026-11-15T18:00:00Z" }, [tx("a", 0, { timestamp: "2026-11-15T17:59:00Z" }), tx("b", 0, { timestamp: "2026-11-15T17:58:00Z" })], { ...customer, knownRecipientIds: ["r1"] });
    expect(result.score).toBe(100);
    expect(result.signals).toHaveLength(7);
    expect(result.signals.reduce((sum, s) => sum + s.weight, 0)).toBeGreaterThan(100);
  });

  it("maps scores below 30, 30–59 and 60+ to the specified levels/actions", () => {
    const cases: [Partial<TransactionInput>, number, string, string][] = [
      [{}, 0, "low", "allow"],
      [{ deviceId: "new", timestamp: "2026-11-15T18:00:00Z" }, 25, "low", "allow"],
      [{ amount: 90000 }, 30, "medium", "confirm"],
      [{ amount: 90000, deviceId: "new", timestamp: "2026-11-15T18:00:00Z" }, 55, "medium", "confirm"],
      [{ amount: 90000, recipientId: "new", timestamp: "2026-11-15T18:00:00Z" }, 60, "high", "hold"],
    ];
    for (const [patch, value, level, action] of cases) expect(score(patch)).toMatchObject({ score: value, level, action });
    expect(RISK_CONFIG.levels).toEqual({ medium: 30, high: 60 });
  });

  it("rejects invalid scoring primitives or a mismatched customer", () => {
    for (const patch of [{ amount: NaN }, { amount: 0 }, { amount: -1 }, { timestamp: "invalid" }, { customerId: "other" }]) {
      expect(() => score(patch)).toThrow(RangeError);
    }
  });
});
