import type { Transaction } from "./types";

export const TRANSACTION_STORAGE_KEY = "safetransfer.transactions.v1";
export interface DemoTransaction extends Transaction {
  recipientName: string;
  maskedAccount: string;
  createdAt: string;
  clientDecision: "confirmed" | "held" | "review_requested" | "cancelled";
}
let fallback: DemoTransaction[] = [];
const signalIds = new Set(["new_recipient", "large_amount", "unusual_hour", "new_device", "velocity", "flagged_recipient", "structuring"]);
function validTransaction(value: unknown): value is DemoTransaction {
  if (!value || typeof value !== "object") return false;
  const tx = value as Record<string, unknown>;
  return ["id", "customerId", "recipientId", "deviceId", "city", "recipientName", "maskedAccount"].every((key) => typeof tx[key] === "string" && (tx[key] as string).length > 0)
    && typeof tx.amount === "number" && Number.isFinite(tx.amount) && tx.amount > 0
    && typeof tx.timestamp === "string" && Number.isFinite(Date.parse(tx.timestamp))
    && typeof tx.createdAt === "string" && Number.isFinite(Date.parse(tx.createdAt))
    && typeof tx.riskScore === "number" && Number.isFinite(tx.riskScore) && tx.riskScore >= 0 && tx.riskScore <= 100
    && ["low", "medium", "high"].includes(String(tx.riskLevel))
    && ["completed", "held", "blocked", "pending_review"].includes(String(tx.status))
    && ["confirmed", "held", "review_requested", "cancelled"].includes(String(tx.clientDecision))
    && Array.isArray(tx.signals) && tx.signals.every((s) => s && typeof s === "object" && signalIds.has(s.id) && typeof s.weight === "number" && Number.isFinite(s.weight) && s.params && typeof s.params === "object" && !Array.isArray(s.params) && Object.values(s.params).every((v) => typeof v === "string" || (typeof v === "number" && Number.isFinite(v))));
}
function merge(stored: DemoTransaction[], memory: DemoTransaction[]) {
  return [...new Map([...stored, ...memory].map((tx) => [tx.id, tx])).values()]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 1000);
}
/** Safe in SSR, an empty browser, blocked storage, and after malformed old data. */
export function getTransactions(): DemoTransaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TRANSACTION_STORAGE_KEY);
    if (!raw) return [...fallback];
    const data: unknown = JSON.parse(raw);
    const envelope = data as { version?: number; transactions?: unknown[] } | null;
    const stored = envelope?.version === 1 && Array.isArray(envelope.transactions) ? envelope.transactions.filter(validTransaction) : [];
    return merge(stored, fallback);
  } catch { return [...fallback]; }
}
/** Upsert by ID so a held transfer becomes pending_review without duplication. */
export function saveTransaction(transaction: DemoTransaction): boolean {
  if (typeof window === "undefined" || !validTransaction(transaction)) return false;
  const previous = getTransactions();
  const existing = previous.find((tx) => tx.id === transaction.id);
  const next = merge(previous, [{ ...transaction, createdAt: existing?.createdAt ?? transaction.createdAt }]);
  try {
    localStorage.setItem(TRANSACTION_STORAGE_KEY, JSON.stringify({ version: 1, transactions: next }));
    fallback = [];
    return true;
  } catch { fallback = next; return false; }
}
