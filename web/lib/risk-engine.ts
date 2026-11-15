import type { Customer, Recipient, RiskResult, RiskSignal, Transaction, TransactionInput } from "./types.ts";

export const RISK_CONFIG = {
  weights: {
    newRecipient: 20,
    amountAbove3x: 15,
    amountAbove8x: 30,
    unusualHour: 10,
    newDevice: 15,
    velocity: 20,
    flaggedRecipient: 40,
    structuring: 10,
  },
  amountRatios: { elevated: 3, high: 8 },
  velocity: { count: 3, windowMinutes: 10 },
  structuring: { threshold: 500000, margin: 0.05 },
  flaggedFloor: 85,
  cap: 100,
  levels: { medium: 30, high: 60 },
  timeZone: "Asia/Almaty",
} as const;

/** Pure scoring: history is read-only; the caller supplies the evaluation timestamp.
 * Velocity includes this transfer and all prior attempts, regardless of status.
 */
export function scoreTransaction(
  input: TransactionInput,
  customer: Customer,
  history: readonly Transaction[],
  recipients: readonly Recipient[],
): RiskResult {
  const time = Date.parse(input.timestamp);
  if (!Number.isFinite(time) || !Number.isFinite(input.amount) || input.amount <= 0 || customer.avgTransferAmount <= 0) {
    throw new RangeError("Scoring requires a valid timestamp and positive amounts.");
  }
  if (customer.id !== input.customerId) throw new RangeError("Customer does not match the transfer.");
  const signals: RiskSignal[] = [];
  const { weights } = RISK_CONFIG;
  function add(id: RiskSignal["id"], weight: number, params: RiskSignal["params"]) {
    signals.push({ id, weight, params });
  }
  if (!customer.knownRecipientIds.includes(input.recipientId)) {
    add("new_recipient", weights.newRecipient, { recipientId: input.recipientId });
  }
  const ratio = input.amount / customer.avgTransferAmount;
  const amountWeight = ratio > RISK_CONFIG.amountRatios.high ? weights.amountAbove8x
    : ratio > RISK_CONFIG.amountRatios.elevated ? weights.amountAbove3x : 0;
  if (amountWeight) {
    add("large_amount", amountWeight, { amount: input.amount, average: customer.avgTransferAmount, ratio });
  }
  const hour = Number(new Intl.DateTimeFormat("en-GB", {
    timeZone: RISK_CONFIG.timeZone, hour: "2-digit", hourCycle: "h23",
  }).format(new Date(time)));
  const [start, end] = customer.typicalHours;
  const typical = start === end || (start < end ? hour >= start && hour < end : hour >= start || hour < end);
  if (!typical) add("unusual_hour", weights.unusualHour, { hour, start, end, timeZone: RISK_CONFIG.timeZone });
  if (!customer.knownDeviceIds.includes(input.deviceId)) {
    add("new_device", weights.newDevice, { deviceId: input.deviceId });
  }
  const windowMs = RISK_CONFIG.velocity.windowMinutes * 60000;
  const count = 1 + history.filter((tx) => {
    const delta = time - Date.parse(tx.timestamp);
    return tx.customerId === customer.id && (input.id === undefined || tx.id !== input.id)
      && delta >= 0 && delta <= windowMs;
  }).length;
  if (count >= RISK_CONFIG.velocity.count) {
    add("velocity", weights.velocity, { count, windowMinutes: RISK_CONFIG.velocity.windowMinutes });
  }
  const flagged = recipients.find((r) => r.id === input.recipientId)?.flagged === true;
  if (flagged) add("flagged_recipient", weights.flaggedRecipient, { recipientId: input.recipientId, scoreFloor: RISK_CONFIG.flaggedFloor });
  const { threshold, margin } = RISK_CONFIG.structuring;
  const lowerBound = threshold * (1 - margin);
  if (input.amount >= lowerBound && input.amount < threshold) {
    add("structuring", weights.structuring, { amount: input.amount, threshold, lowerBound });
  }
  const sum = signals.reduce((total, signal) => total + signal.weight, 0);
  const score = Math.min(RISK_CONFIG.cap, Math.max(sum, flagged ? RISK_CONFIG.flaggedFloor : 0));
  const level = score >= RISK_CONFIG.levels.high ? "high" : score >= RISK_CONFIG.levels.medium ? "medium" : "low";
  const action = level === "high" ? "hold" : level === "medium" ? "confirm" : "allow";
  return { score, level, action, signals };
}
