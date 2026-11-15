"use client";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const seen = useRef<Set<string> | null>(null);
  const [newIds, setNewIds] = useState<string[]>([]);
  useEffect(() => {
    function syncLocal() {
      const next = getTransactions();
      const nextDecisions = getAnalystDecisions();
      setLocal((old) => JSON.stringify(old) === JSON.stringify(next) ? old : next);
      setDecisions((old) => JSON.stringify(old) === JSON.stringify(nextDecisions) ? old : nextDecisions);
      if (seen.current) {
        const arrivals = next.filter((tx) => !seen.current!.has(tx.id)).map((tx) => tx.id);
        if (arrivals.length) setNewIds((previous) => [...new Set([...arrivals, ...previous])].slice(0, 10));
      }
      seen.current = new Set([...(seen.current ?? []), ...next.map((tx) => tx.id)]);
    }
    const initial = setTimeout(syncLocal, 0);
    const interval = setInterval(syncLocal, 2000);
    window.addEventListener("storage", syncLocal);
    window.addEventListener("safetransfer-transactions", syncLocal);
    window.addEventListener("safetransfer-decisions", syncLocal);
    return () => { clearTimeout(initial); clearInterval(interval); window.removeEventListener("storage", syncLocal); window.removeEventListener("safetransfer-transactions", syncLocal); window.removeEventListener("safetransfer-decisions", syncLocal); };
  }, []);
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
  return { transactions, status, decide, newIds, retry: () => { setStatus("loading"); setAttempt((n) => n + 1); } };
}
