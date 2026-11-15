"use client";
import { useState } from "react";
import { DashboardCharts } from "./dashboard-charts";
import { TransactionDrawer } from "./transaction-drawer";
import type { AnalystDecision } from "@/lib/dashboard-data";
import { Icon } from "../icon";
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
  const [toast, setToast] = useState<{ action: AnalystDecision["action"]; saved: boolean } | null>(null);
  const selected = data.transactions.find((tx) => tx.id === selectedId);
  return <><div className="mb-7 flex flex-wrap items-start justify-between gap-4"><div><p className="mb-3 text-xs font-semibold tracking-[.16em] text-accent">{copy.eyebrow}</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{copy.title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{copy.subtitle}</p></div><span className="rounded-lg border border-line bg-white px-3 py-2 text-[10px] text-muted">{copy.dataset}</span></div>{data.status === "error" && <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-medium-soft p-4 text-sm text-medium"><p>{copy.loadError}</p><button type="button" onClick={data.retry} className="secondary-button">{copy.retry}</button></div>}<KpiCards transactions={data.transactions} loading={data.status === "loading"} /><DashboardCharts transactions={data.transactions} loading={data.status === "loading"} /><TransactionList transactions={data.transactions} loading={data.status === "loading"} onSelect={setSelectedId} />{selected && <TransactionDrawer key={selected.id} transaction={selected} customer={customers.find((c) => c.id === selected.customerId)} onClose={() => setSelectedId(null)} onDecision={(id, action) => { const saved = data.decide(id, action); setToast({ action, saved }); }} />}{toast && <div className="fixed right-4 bottom-4 left-4 z-50 mx-auto flex max-w-lg items-start justify-between gap-4 rounded-xl border border-line bg-white p-4 shadow-card"><div role="status" aria-live="polite" className="text-sm leading-6"><p>{toast.action === "block" ? copy.blockedToast : copy.allowedToast}</p>{!toast.saved && <p className="mt-2 text-xs text-medium">{copy.storageWarning}</p>}</div><button type="button" className="rounded-lg p-2" aria-label={copy.dismissToast} onClick={() => setToast(null)}><Icon name="close" /></button></div>}<p className="mt-6 text-xs leading-6 text-muted">{copy.demoOnly}</p></>;
}
