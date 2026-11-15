import type { Customer, Recipient, Transaction } from "./types";
import type { DemoTransaction } from "./store";

export interface AnalystDecision { transactionId: string; action: "block" | "allow"; decidedAt: string; }
export interface DashboardTransaction extends Transaction {
  customerName: string;
  recipientName: string;
  maskedAccount: string;
  source: "mock" | "local";
  receivedAt: string;
  analystDecision?: AnalystDecision;
}
export const DECISION_STORAGE_KEY = "safetransfer.analyst-decisions.v1";
let fallback: AnalystDecision[] = [];
function isDecision(value: unknown): value is AnalystDecision {
  if (!value || typeof value !== "object") return false;
  const d = value as Record<string, unknown>;
  return typeof d.transactionId === "string" && d.transactionId.length > 0 && (d.action === "block" || d.action === "allow") && typeof d.decidedAt === "string" && Number.isFinite(Date.parse(d.decidedAt));
}
export function getAnalystDecisions(): AnalystDecision[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(localStorage.getItem(DECISION_STORAGE_KEY) ?? "null");
    const envelope = value as { version?: number; decisions?: unknown[] } | null;
    const saved = envelope?.version === 1 && Array.isArray(envelope.decisions) ? envelope.decisions.filter(isDecision) : [];
    return [...new Map([...saved, ...fallback].map((d) => [d.transactionId, d])).values()];
  } catch { return [...fallback]; }
}
export function saveAnalystDecision(decision: AnalystDecision): boolean {
  if (typeof window === "undefined" || !isDecision(decision)) return false;
  const next = [...new Map([...getAnalystDecisions(), decision].map((d) => [d.transactionId, d])).values()].slice(-1000);
  let saved = true;
  try { localStorage.setItem(DECISION_STORAGE_KEY, JSON.stringify({ version: 1, decisions: next })); fallback = []; }
  catch { fallback = next; saved = false; }
  window.dispatchEvent(new Event("safetransfer-decisions"));
  return saved;
}
/** Local records override matching API IDs; decisions override status only. */
export function mergeDashboardTransactions(api: readonly Transaction[], local: readonly DemoTransaction[], decisions: readonly AnalystDecision[], customers: readonly Customer[], recipients: readonly Recipient[]): DashboardTransaction[] {
  const customerMap = new Map(customers.map((c) => [c.id, c]));
  const recipientMap = new Map(recipients.map((r) => [r.id, r]));
  const decisionMap = new Map(decisions.map((d) => [d.transactionId, d]));
  const rows = new Map<string, DashboardTransaction>();
  for (const tx of api) rows.set(tx.id, { ...tx, customerName: customerMap.get(tx.customerId)?.name ?? tx.customerId, recipientName: recipientMap.get(tx.recipientId)?.name ?? tx.recipientId, maskedAccount: recipientMap.get(tx.recipientId)?.maskedAccount ?? "DEMO ****", source: "mock", receivedAt: tx.timestamp });
  for (const tx of local) rows.set(tx.id, { ...tx, customerName: customerMap.get(tx.customerId)?.name ?? tx.customerId, source: "local", receivedAt: tx.createdAt });
  return [...rows.values()].map((tx) => {
    const decision = decisionMap.get(tx.id);
    return decision ? { ...tx, status: decision.action === "block" ? "blocked" : "completed", analystDecision: decision } : tx;
  });
}
