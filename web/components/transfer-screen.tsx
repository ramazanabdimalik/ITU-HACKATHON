"use client";
import { DemoScenarios } from "./demo-scenarios";
import { scenarioValues } from "@/lib/demo-scenarios";
import type { ScenarioId } from "@/lib/demo-scenarios";
import type { TransferFormValues } from "@/lib/transfer-form";
import { useState } from "react";
import type { Recipient } from "@/lib/types";
import { saveTransaction } from "@/lib/store";
import { transferPayload } from "@/lib/transfer-form";
import { emptyForm } from "@/lib/transfer-form";
import { TransferDecision } from "./transfer-decision";
import type { TransferDecisionState } from "./transfer-decision";
import { fetchRisk, useLiveRisk } from "@/lib/use-live-risk";
import { TransferForm } from "./transfer-form";
import { AccountCard } from "./account-card";
import { RiskMeter } from "./risk-meter";
import { useApp } from "./app-shell";

function TransferWorkspace({ recipients, initialValues }: { recipients: Recipient[]; initialValues: TransferFormValues }) {
  const { customer, lang, copy } = useApp();
  const [values, setValues] = useState(initialValues);
  const risk = useLiveRisk(values, customer, lang);
  const [decision, setDecision] = useState<TransferDecisionState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [storageFailed, setStorageFailed] = useState(false);
  function persist(next: TransferDecisionState) {
    const payload = transferPayload(next.values, customer, lang);
    const status = next.phase === "success" ? "completed" : next.phase === "review" ? "pending_review" : next.phase === "cancelled" ? "blocked" : "held";
    const saved = saveTransaction({
      id: next.id, customerId: customer.id, recipientId: payload.recipientId,
      amount: payload.amount, timestamp: payload.timestamp, deviceId: payload.deviceId, city: customer.homeCity,
      status, riskScore: next.result.score, riskLevel: next.result.level, signals: next.result.signals,
      recipientName: next.recipientName,
      maskedAccount: next.values.recipientId === "new" ? `DEMO **** ${next.values.recipientAccount.slice(-4)}` : recipients.find((r) => r.id === next.values.recipientId)?.maskedAccount ?? "DEMO ****",
      createdAt: new Date().toISOString(),
      clientDecision: next.phase === "success" ? "confirmed" : next.phase === "review" ? "review_requested" : next.phase === "cancelled" ? "cancelled" : "held",
    });
    setStorageFailed(!saved);
  }
  async function submit() {
    setSubmitting(true); setSubmitError(false);
    try {
      const snapshot = { ...values, demoTimestamp: transferPayload(values, customer, lang).timestamp };
      const result = await fetchRisk(snapshot, customer, lang);
      const phase = result.action === "allow" ? "success" : result.action === "confirm" ? "confirm" : "hold";
      const next: TransferDecisionState = { phase, result, values: snapshot, id: `DEMO-${crypto.randomUUID()}`, recipientName: values.recipientId === "new" ? values.recipientName.trim() : recipients.find((r) => r.id === values.recipientId)?.name ?? copy.newRecipient };
      setDecision(next);
      if (phase === "success" || phase === "hold") persist(next);
    } catch { setSubmitError(true); }
    finally { setSubmitting(false); }
  }
  if (decision) return <TransferDecision decision={decision} storageFailed={storageFailed} onAction={(action) => {
    if (action === "reset") { setDecision(null); setValues(emptyForm); setStorageFailed(false); return; }
    // No action can move a high-risk hold directly to success.
    if (action === "confirm" && decision.phase === "confirm") { const next = { ...decision, phase: "success" as const }; setDecision(next); persist(next); }
    if (action === "cancel") { const next = { ...decision, phase: "cancelled" as const }; setDecision(next); if (decision.phase === "hold") persist(next); }
    if (action === "review" && decision.phase === "hold") { const next = { ...decision, phase: "review" as const }; setDecision(next); persist(next); }
  }} />;
  return <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"><div><AccountCard /><div>{submitError && <p role="alert" className="mb-4 rounded-xl bg-high-soft p-4 text-sm text-high">{copy.decisionError}</p>}<>{values.demoTimestamp && <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-accent/20 bg-accent/5 p-3 text-xs text-accent"><span>{copy.scenarioActive} · {new Intl.DateTimeFormat(lang === "kk" ? "kk-KZ" : "ru-KZ", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Almaty" }).format(new Date(values.demoTimestamp))}</span><button className="underline underline-offset-4" type="button" onClick={() => setValues({ ...values, demoTimestamp: undefined, time: "now" })}>{copy.closeScenario}</button></div>}<TransferForm busy={submitting} values={values} recipients={recipients} onChange={(patch) => setValues({ ...values, ...patch, ...(patch.time ? { demoTimestamp: undefined } : {}) })} onSubmit={submit} /></></div></div><RiskMeter {...risk} /></div>;
}
export function TransferScreen({ recipients }: { recipients: Recipient[] }) {
  const { copy, customer, customers, setCustomerId } = useApp();
  const [scenario, setScenario] = useState<{ id: ScenarioId; nonce: number } | null>(null);
  return <><div className="mb-8"><p className="mb-3 text-xs font-semibold tracking-[.16em] text-accent">{copy.eyebrow}</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{copy.title}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted">{copy.subtitle}</p></div><DemoScenarios active={customer.id === customers[0].id ? scenario?.id : undefined} onSelect={(id) => { setCustomerId(customers[0].id); setScenario({ id, nonce: Date.now() }); }} /><TransferWorkspace key={`${customer.id}-${scenario?.nonce ?? 0}`} recipients={recipients} initialValues={scenario && customer.id === customers[0].id ? scenarioValues(scenario.id, customers[0], copy.demoPerson) : emptyForm} /></>;
}
