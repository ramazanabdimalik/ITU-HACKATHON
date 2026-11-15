"use client";
import { useState } from "react";
import type { Recipient } from "@/lib/types";
import { emptyForm } from "@/lib/transfer-form";
import { TransferDecision } from "./transfer-decision";
import type { TransferDecisionState } from "./transfer-decision";
import { fetchRisk, useLiveRisk } from "@/lib/use-live-risk";
import { TransferForm } from "./transfer-form";
import { AccountCard } from "./account-card";
import { RiskMeter } from "./risk-meter";
import { useApp } from "./app-shell";

function TransferWorkspace({ recipients }: { recipients: Recipient[] }) {
  const { customer, lang, copy } = useApp();
  const [values, setValues] = useState(emptyForm);
  const risk = useLiveRisk(values, customer, lang);
  const [decision, setDecision] = useState<TransferDecisionState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  async function submit() {
    setSubmitting(true); setSubmitError(false);
    try {
      const result = await fetchRisk(values, customer, lang);
      const phase = result.action === "allow" ? "success" : result.action === "confirm" ? "confirm" : "hold";
      setDecision({ phase, result, values: { ...values }, id: `DEMO-${crypto.randomUUID()}`, recipientName: values.recipientId === "new" ? values.recipientName.trim() : recipients.find((r) => r.id === values.recipientId)?.name ?? copy.newRecipient });
    } catch { setSubmitError(true); }
    finally { setSubmitting(false); }
  }
  if (decision) return <TransferDecision decision={decision} onAction={(action) => {
    if (action === "reset") { setDecision(null); setValues(emptyForm); return; }
    // No action can move a high-risk hold directly to success.
    if (action === "confirm" && decision.phase === "confirm") setDecision({ ...decision, phase: "success" });
    if (action === "cancel") setDecision({ ...decision, phase: "cancelled" });
    if (action === "review" && decision.phase === "hold") setDecision({ ...decision, phase: "review" });
  }} />;
  return <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"><div><AccountCard /><div>{submitError && <p role="alert" className="mb-4 rounded-xl bg-high-soft p-4 text-sm text-high">{copy.decisionError}</p>}<TransferForm busy={submitting} values={values} recipients={recipients} onChange={(patch) => setValues({ ...values, ...patch })} onSubmit={submit} /></div></div><RiskMeter {...risk} /></div>;
}
export function TransferScreen({ recipients }: { recipients: Recipient[] }) {
  const { copy, customer } = useApp();
  return <><div className="mb-8"><p className="mb-3 text-xs font-semibold tracking-[.16em] text-accent">{copy.eyebrow}</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{copy.title}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted">{copy.subtitle}</p></div><TransferWorkspace key={customer.id} recipients={recipients} /></>;
}
