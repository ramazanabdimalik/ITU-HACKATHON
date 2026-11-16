"use client";
import type { DashboardTransaction } from "@/lib/dashboard-data";
import { bankDictionaries } from "@/lib/i18n";
import { useApp } from "../app-shell";
import { Icon } from "../icon";
import { StatusBadge } from "./transaction-list";
export function LiveFeed({ transactions, newIds, onSelect }: { transactions: DashboardTransaction[]; newIds: string[]; onSelect: (id: string) => void }) {
  const { lang } = useApp();
  const copy = bankDictionaries[lang];
  const arrivals = newIds.map((id) => transactions.find((tx) => tx.id === id)).filter((tx): tx is DashboardTransaction => Boolean(tx)).slice(0, 3);
  return <section className="mb-6 rounded-2xl border border-line bg-[#F0ECFF] p-4 sm:p-5" aria-label={copy.live}><div className="flex items-center gap-2"><Icon name="clock" className="h-4 w-4 text-accent" /><h2 className="text-xs font-semibold">{copy.live}</h2>{arrivals.length > 0 && <span role="status" aria-live="polite" className="text-xs text-accent">{copy.newTransfer}: {newIds.length}</span>}</div>{arrivals.length ? <><ul className="mt-4 grid gap-3 lg:grid-cols-3">{arrivals.map((tx) => <li key={tx.id}><button type="button" onClick={() => onSelect(tx.id)} className="bank-arrival w-full rounded-xl border border-accent/15 bg-white p-3 text-left hover:border-accent" aria-label={`${copy.view} ${tx.id}`}><span className="flex items-start justify-between gap-2"><span className="text-xs font-semibold">{tx.customerName}</span><StatusBadge status={tx.status} /></span><span className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs"><span className="max-w-44 truncate text-muted">{tx.recipientName}</span><span className="font-semibold tabular-nums">{new Intl.NumberFormat(lang === "kk" ? "kk-KZ" : "ru-KZ").format(tx.amount)} {copy.currency}</span></span><span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent">{copy.view}<Icon name="arrow" className="h-3 w-3" /></span></button></li>)}</ul><p className="mt-3 text-xs leading-5 text-muted">{copy.pinnedHint}</p></> : <p className="mt-2 text-xs leading-6 text-muted">{copy.liveHint}</p>}</section>;
}
