"use client";
import { useState } from "react";
import { LiveFeed } from "./live-feed";
import { DashboardCharts } from "./dashboard-charts";
import { TransactionDrawer } from "./transaction-drawer";
import { DecisionToast } from "./decision-toast";
import type { DecisionMessage } from "./decision-toast";
import { TransactionList } from "./transaction-list";
import type { Customer, Recipient } from "@/lib/types";
import { useDashboard } from "@/lib/use-dashboard";
import { bankDictionaries } from "@/lib/i18n";
import { useApp } from "../app-shell";
import { KpiCards } from "./kpi-cards";
export function BankDashboard({ customers, recipients }: { customers: Customer[]; recipients: Recipient[] }) {
  const { lang } = useApp();
  const copy = bankDictionaries[lang];
  const data = useDashboard(customers, recipients);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState<DecisionMessage | null>(null);
  const selected = data.transactions.find((tx) => tx.id === selectedId);
  return <><div className="mb-7 flex flex-wrap items-start justify-between gap-4"><div><p className="mb-3 text-xs font-semibold tracking-[.16em] text-accent">{copy.eyebrow}</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{copy.title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{copy.subtitle}</p></div><span className="rounded-lg border border-line bg-white px-3 py-2 text-[10px] text-muted">{copy.allCustomers} · {copy.dataset}</span></div>{data.status === "error" && <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-medium-soft p-4 text-sm text-medium"><p>{copy.loadError}</p><button type="button" onClick={data.retry} className="secondary-button">{copy.retry}</button></div>}<KpiCards transactions={data.transactions} loading={data.status === "loading"} /><LiveFeed transactions={data.transactions} newIds={data.newIds} onSelect={setSelectedId} /><DashboardCharts transactions={data.transactions} loading={data.status === "loading"} /><TransactionList pinned={data.newIds} transactions={data.transactions} loading={data.status === "loading"} onSelect={setSelectedId} />{selected && <TransactionDrawer key={selected.id} transaction={selected} message={toast?.transactionId === selected.id ? toast : null} dismissMessage={() => setToast(null)} customer={customers.find((c) => c.id === selected.customerId)} onClose={() => setSelectedId(null)} onDecision={(id, action) => { const saved = data.decide(id, action); setToast({ transactionId: id, action, saved }); }} />}{toast && !selected && <DecisionToast message={toast} onDismiss={() => setToast(null)} floating />}<p className="mt-6 text-xs leading-6 text-muted">{copy.demoOnly}</p></>;
}
