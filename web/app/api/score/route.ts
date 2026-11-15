import { mockData } from "@/lib/mock-data";
import { scoreTransaction } from "@/lib/risk-engine";
import { explainRisk } from "@/lib/explain";
import { DEFAULT_LANGUAGE } from "@/lib/i18n";

function badRequest(error: string) {
  return Response.json({ error }, { status: 400 });
}

// Require ISO timestamps with an explicit timezone and a real calendar date.
function validTimestamp(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.exec(value);
  if (!match || !Number.isFinite(Date.parse(value))) return false;
  const [, year, month, day] = match;
  const daysInMonth = new Date(Date.UTC(Number(year), Number(month), 0)).getUTCDate();
  return Number(month) >= 1 && Number(month) <= 12 && Number(day) >= 1 && Number(day) <= daysInMonth;
}

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return badRequest("Body must be valid JSON."); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return badRequest("Body must be a JSON object.");
  const input = body as Record<string, unknown>;
  for (const key of ["customerId", "recipientId", "deviceId"] as const) {
    if (typeof input[key] !== "string" || !input[key].trim() || input[key].length > 200) {
      return badRequest(`${key} must be a non-empty string of at most 200 characters.`);
    }
  }
  if (typeof input.amount !== "number" || !Number.isFinite(input.amount) || input.amount <= 0 || input.amount > Number.MAX_SAFE_INTEGER) {
    return badRequest("amount must be a positive finite number in KZT, no larger than Number.MAX_SAFE_INTEGER.");
  }
  const timestamp = input.timestamp === undefined ? new Date().toISOString() : input.timestamp;
  if (!validTimestamp(timestamp)) return badRequest("timestamp must be a valid ISO date-time with timezone, e.g. 2026-11-15T07:00:00Z.");
  const lang = input.lang === undefined ? new URL(request.url).searchParams.get("lang") ?? DEFAULT_LANGUAGE : input.lang;
  if (lang !== "ru" && lang !== "kk") return badRequest("lang must be ru or kk.");
  const customer = mockData.customers.find((c) => c.id === input.customerId);
  if (!customer) return badRequest("Unknown customerId.");
  const recipient = mockData.recipients.find((r) => r.id === input.recipientId);
  if (!recipient) return badRequest("Unknown recipientId.");
  const result = scoreTransaction({
    customerId: customer.id, recipientId: recipient.id, amount: input.amount,
    timestamp, deviceId: input.deviceId as string, city: customer.homeCity,
  }, customer, mockData.transactions, mockData.recipients);
  return Response.json({ ...result, explanation: explainRisk(result, lang) });
}
