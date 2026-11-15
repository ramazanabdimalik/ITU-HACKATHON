"use client";
import { useState } from "react";
import type { Recipient } from "@/lib/types";
import { emptyForm } from "@/lib/transfer-form";
import { useLiveRisk } from "@/lib/use-live-risk";
import { TransferForm } from "./transfer-form";
import { AccountCard } from "./account-card";
import { RiskMeter } from "./risk-meter";
import { useApp } from "./app-shell";

function TransferWorkspace({ recipients }: { recipients: Recipient[] }) {
  const { customer, lang } = useApp();
  const [values, setValues] = useState(emptyForm);
  const risk = useLiveRisk(values, customer, lang);
  return <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"><div><AccountCard /><TransferForm values={values} recipients={recipients} onChange={(patch) => setValues({ ...values, ...patch })} onSubmit={() => {}} /></div><RiskMeter {...risk} /></div>;
}
export function TransferScreen({ recipients }: { recipients: Recipient[] }) {
  const { copy, customer } = useApp();
  return <><div className="mb-8"><p className="mb-3 text-xs font-semibold tracking-[.16em] text-accent">{copy.eyebrow}</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{copy.title}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted">{copy.subtitle}</p></div><TransferWorkspace key={customer.id} recipients={recipients} /></>;
}
