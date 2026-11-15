"use client";
import { useEffect, useMemo, useState } from "react";
import { getTransactions } from "./store";
import { getAnalystDecisions, mergeDashboardTransactions, saveAnalystDecision } from "./dashboard-data";
import type { AnalystDecision } from "./dashboard-data";
import type { Customer, Recipient, Transaction } from "./types";

export function useDashboard(customers: Customer[], recipients: Recipient[]) {
  const [api, setApi] = useState<Transaction[]>([]);
  const [local, setLocal] = useState<ReturnType<typeof getTransactions>>([]);
  const [decisions, setDecisions] = useState<AnalystDecision[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/transactions", { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw Error("Transactions unavailable");
      const data: unknown = await response.json();
      if (!Array.isArray(data) || !data.every((tx) => tx && typeof tx.id === "string" && typeof tx.riskScore === "number" && ["low", "medium", "high"].includes(tx.riskLevel) && Array.isArray(tx.signals))) throw Error("Invalid transactions");
      if (!controller.signal.aborted) { setApi(data); setStatus("ready"); setLocal(getTransactions()); setDecisions(getAnalystDecisions()); }
    }).catch(() => { if (!controller.signal.aborted) { setStatus("error"); setLocal(getTransactions()); setDecisions(getAnalystDecisions()); } });
    return () => controller.abort();
  }, [attempt]);
  const transactions = useMemo(() => mergeDashboardTransactions(api, local, decisions, customers, recipients), [api, local, decisions, customers, recipients]);
  function decide(transactionId: string, action: AnalystDecision["action"]) {
    const decision = { transactionId, action, decidedAt: new Date().toISOString() };
    const saved = saveAnalystDecision(decision);
    setDecisions((previous) => [...previous.filter((d) => d.transactionId !== transactionId), decision]);
    return saved;
  }
  return { transactions, status, decide, retry: () => { setStatus("loading"); setAttempt((n) => n + 1); } };
}
