import { writeFileSync } from "node:fs";
import type { Customer, MockData, Recipient, Transaction } from "../lib/types.ts";

// Fixed anchor and seed: no clock or external data is used.
export const FIXED_NOW = "2026-11-15T12:00:00.000Z";
const DAY = 86_400_000;
let seed = 20261115;
function random() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
}

const cities = ["Алматы", "Астана", "Шымкент", "Караганда"];
const customers: Customer[] = Array.from({ length: 8 }, (_, i) => ({
  id: `customer-${i + 1}`,
  name: `Тестовый клиент ${i + 1}`,
  avgTransferAmount: 20000 + i * 5000,
  typicalHours: [8, 21],
  knownDeviceIds: [`device-${i + 1}`],
  knownRecipientIds: Array.from({ length: 13 }, (_, j) => `recipient-${j + 1}`),
  homeCity: cities[i % cities.length],
}));
const recipients: Recipient[] = Array.from({ length: 20 }, (_, i) => ({
  id: `recipient-${i + 1}`,
  name: `Вымышленный получатель ${i + 1}`,
  maskedAccount: `DEMO **** ${String(1000 + i)}`,
  flagged: i >= 17,
}));
const transactions: Transaction[] = [];
// Hours are expressed in Asia/Almaty (UTC+5); dates stay within 30 days.
function at(daysAgo: number, hour: number, minute = 0) {
  const midnight = Date.parse(FIXED_NOW.slice(0, 10) + "T00:00:00Z");
  return new Date(midnight - daysAgo * DAY + (hour - 5) * 3600000 + minute * 60000).toISOString();
}
function add(customer: Customer, timestamp: string, overrides: Partial<Transaction> = {}) {
  transactions.push({
    id: `tx-${String(transactions.length + 1).padStart(3, "0")}`,
    customerId: customer.id,
    recipientId: customer.knownRecipientIds[Math.floor(random() * 13)],
    amount: Math.round(customer.avgTransferAmount * (0.6 + random() * 0.8)),
    timestamp,
    deviceId: customer.knownDeviceIds[0],
    city: customer.homeCity,
    // Replaced with engine results when the scoring layer is integrated.
    status: "completed",
    riskScore: 0,
    riskLevel: "low",
    signals: [],
    ...overrides,
  });
}

for (let i = 0; i < 270; i++) {
  add(customers[i % 8], at(29 - Math.floor(i / 10), 9 + (i % 10)));
}
// 30 suspicious transfers (10%): six night/new-recipient spikes,
// eight velocity transfers, six new-device spikes, six flagged, four structured.
for (let i = 0; i < 6; i++) {
  const c = customers[i];
  add(c, at(2, 23, i), {
    recipientId: "recipient-14",
    amount: Math.round(c.avgTransferAmount * (9 + random() * 6)),
  });
}
for (let group = 0; group < 2; group++) {
  for (let i = 0; i < 4; i++) add(customers[group], at(1, 10 + group, i * 2));
}
for (let i = 0; i < 6; i++) {
  const c = customers[i];
  add(c, at(1, 14, i), { deviceId: `new-device-${i}`, amount: c.avgTransferAmount * 6 });
}
for (let i = 0; i < 6; i++) {
  add(customers[i], at(0, 9, i), { recipientId: `recipient-${18 + (i % 3)}` });
}
for (let i = 0; i < 4; i++) add(customers[6], at(1, 9 + i), { amount: 480000 + i * 1000 });
transactions.sort((a, b) => a.timestamp.localeCompare(b.timestamp) || a.id.localeCompare(b.id));

const data: MockData = { customers, recipients, transactions };
writeFileSync(new URL("../data/mock.json", import.meta.url), JSON.stringify(data, null, 2) + "\n");
console.log(`Generated ${customers.length} customers, ${recipients.length} recipients and ${transactions.length} transactions (30 pattern transfers).`);
