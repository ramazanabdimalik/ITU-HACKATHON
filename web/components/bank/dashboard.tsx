"use client";
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
  return <><div className="mb-7 flex flex-wrap items-start justify-between gap-4"><div><p className="mb-3 text-xs font-semibold tracking-[.16em] text-accent">{copy.eyebrow}</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{copy.title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{copy.subtitle}</p></div><span className="rounded-lg border border-line bg-white px-3 py-2 text-[10px] text-muted">{copy.dataset}</span></div>{data.status === "error" && <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-medium-soft p-4 text-sm text-medium"><p>{copy.loadError}</p><button type="button" onClick={data.retry} className="secondary-button">{copy.retry}</button></div>}<KpiCards transactions={data.transactions} loading={data.status === "loading"} /><TransactionList transactions={data.transactions} loading={data.status === "loading"} onSelect={() => {}} /><p className="mt-6 text-xs leading-6 text-muted">{copy.demoOnly}</p></>;
}
