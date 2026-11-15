"use client";
import { useEffect, useState } from "react";
import type { Customer, RiskResult } from "./types";
import type { Language } from "./i18n";
import type { explainRisk } from "./explain";
import { transferPayload, validateTransfer } from "./transfer-form";
import type { TransferFormValues } from "./transfer-form";

export type ScoreResponse = RiskResult & { explanation: ReturnType<typeof explainRisk> };
export async function fetchRisk(values: TransferFormValues, customer: Customer, lang: Language, signal?: AbortSignal): Promise<ScoreResponse> {
  const response = await fetch("/api/score", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(transferPayload(values, customer, lang)), signal });
  if (!response.ok) throw Error("Score request failed");
  const data = await response.json();
  if (!Number.isFinite(data.score) || data.score < 0 || data.score > 100 || !["low", "medium", "high"].includes(data.level) || !["allow", "confirm", "hold"].includes(data.action) || !Array.isArray(data.signals) || !Array.isArray(data.explanation?.reasons) || typeof data.explanation?.summary !== "string" || typeof data.explanation?.tip !== "string") throw Error("Invalid score response");
  return data;
}
export function useLiveRisk(values: TransferFormValues, customer: Customer, lang: Language) {
  const [retry, setRetry] = useState(0);
  const key = JSON.stringify([values, customer.id, lang, retry]);
  const valid = Object.keys(validateTransfer(values)).length === 0;
  const [state, setState] = useState<{ key: string; result?: ScoreResponse; error?: boolean }>({ key: "" });
  useEffect(() => {
    if (!valid) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchRisk(values, customer, lang, controller.signal).then((result) => {
        if (!controller.signal.aborted) setState({ key, result });
      }).catch(() => { if (!controller.signal.aborted) setState({ key, error: true }); });
    }, 400);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [key, valid, values, customer, lang]);
  return {
    result: valid && state.key === key ? state.result : undefined,
    status: !valid ? "empty" : state.key !== key ? "loading" : state.error ? "error" : "ready",
    retry: () => setRetry((n) => n + 1),
  };
}
