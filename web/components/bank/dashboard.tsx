"use client";
import { HeroBand } from "../hero-band";
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
  return <><HeroBand eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle}><span className="rounded-lg border border-white/25 bg-white/10 px-3 py-1.5 text-[10px] leading-5 text-white">{copy.allCustomers} · {copy.dataset}</span></HeroBand>{data.status === "error" && <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-medium-soft p-4 text-sm text-medium"><p>{copy.loadError}</p><button type="button" onClick={data.retry} className="secondary-button">{copy.retry}</button></div>}<KpiCards transactions={data.transactions} loading={data.status === "loading"} /><LiveFeed transactions={data.transactions} newIds={data.newIds} onSelect={setSelectedId} /><DashboardCharts transactions={data.transactions} loading={data.status === "loading"} /><TransactionList pinned={data.newIds} transactions={data.transactions} loading={data.status === "loading"} onSelect={setSelectedId} />{selected && <TransactionDrawer key={selected.id} transaction={selected} message={toast?.transactionId === selected.id ? toast : null} dismissMessage={() => setToast(null)} customer={customers.find((c) => c.id === selected.customerId)} onClose={() => setSelectedId(null)} onDecision={(id, action) => { const saved = data.decide(id, action); setToast({ transactionId: id, action, saved }); }} />}{toast && !selected && <DecisionToast message={toast} onDismiss={() => setToast(null)} floating />}<p className="mt-6 text-xs leading-6 text-muted">{copy.demoOnly}</p></>;
}
