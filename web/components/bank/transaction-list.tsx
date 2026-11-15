"use client";
import { useState } from "react";
import { bankDictionaries } from "@/lib/i18n";
import { filterDashboardTransactions } from "@/lib/dashboard-data";
import type { DashboardTransaction, LevelFilter, StatusFilter } from "@/lib/dashboard-data";
import { useApp } from "../app-shell";
import { Icon } from "../icon";
import { riskStyles } from "../risk-meter";

export function BankRiskBadge({ level }: { level: DashboardTransaction["riskLevel"] }) {
  const { copy } = useApp();
  const style = riskStyles[level];
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-semibold ${style.text} ${style.soft}`}><Icon name={style.icon} className="h-3.5 w-3.5" />{copy[level]}</span>;
}
export function StatusBadge({ status }: { status: DashboardTransaction["status"] }) {
  const { lang } = useApp();
  const copy = bankDictionaries[lang];
  const style = status === "blocked" ? "text-high bg-high-soft" : status === "completed" ? "text-low bg-low-soft" : status === "pending_review" ? "text-accent bg-accent/5" : "text-medium bg-medium-soft";
  return <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-medium ${style}`}><Icon name={status === "completed" ? "check" : status === "blocked" ? "close" : "clock"} className="h-3 w-3" />{copy[status]}</span>;
}
export function TransactionList({ transactions, loading, onSelect, pinned = [] }: { transactions: DashboardTransaction[]; loading: boolean; onSelect: (id: string) => void; pinned?: string[] }) {
  const { lang } = useApp();
  const copy = bankDictionaries[lang];
  const [level, setLevel] = useState<LevelFilter>("flagged");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<"risk" | "time">("risk");
  const [limit, setLimit] = useState(30);
  const filtered = filterDashboardTransactions(transactions, level, status, sort, pinned);
  const rows = filtered.slice(0, limit);
  const format = (amount: number) => new Intl.NumberFormat(lang === "kk" ? "kk-KZ" : "ru-KZ", { maximumFractionDigits: 2 }).format(amount);
  const date = (timestamp: string) => new Intl.DateTimeFormat(lang === "kk" ? "kk-KZ" : "ru-KZ", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Almaty" }).format(new Date(timestamp));
  return <section className="panel mb-6 overflow-hidden" aria-labelledby="queue-title" aria-busy={loading}>
    <div className="border-b border-line p-5 sm:p-6"><h2 id="queue-title" tabIndex={-1} className="text-lg font-semibold">{copy.queue}</h2><p className="mt-2 text-xs leading-6 text-muted">{copy.queueHint}</p><div className="mt-5 grid gap-3 sm:grid-cols-3"><div><label htmlFor="bank-level" className="label">{copy.levelFilter}</label><select id="bank-level" className="field text-xs" value={level} onChange={(e) => { setLevel(e.target.value as LevelFilter); setLimit(30); }}>{(["flagged", "all", "low", "medium", "high"] as const).map((v) => <option key={v} value={v}>{v === "flagged" ? copy.flaggedLevels : v === "all" ? copy.allLevels : copy[v]}</option>)}</select></div><div><label htmlFor="bank-status" className="label">{copy.statusFilter}</label><select id="bank-status" className="field text-xs" value={status} onChange={(e) => { setStatus(e.target.value as StatusFilter); setLimit(30); }}>{(["all", "completed", "held", "blocked", "pending_review"] as const).map((v) => <option key={v} value={v}>{v === "all" ? copy.allStatuses : copy[v]}</option>)}</select></div><div><label htmlFor="bank-sort" className="label">{copy.sort}</label><select id="bank-sort" className="field text-xs" value={sort} onChange={(e) => setSort(e.target.value as "risk" | "time")}><option value="risk">{copy.riskSort}</option><option value="time">{copy.timeSort}</option></select></div></div></div>
    {loading ? <div role="status" className="p-6"><p className="mb-4 text-sm text-muted">{copy.loading}</p><div className="h-40 animate-pulse rounded-xl bg-canvas" /></div> : !filtered.length ? <div className="p-10 text-center"><Icon name="check" className="mx-auto mb-4 h-8 w-8 text-accent" /><h3 className="font-semibold">{copy.empty}</h3><p className="my-3 text-sm text-muted">{copy.emptyHint}</p><button className="secondary-button" type="button" onClick={() => { setLevel("all"); setStatus("all"); }}>{copy.resetFilters}</button></div> : <>
      <div className="hidden lg:block"><table className="w-full text-left text-xs"><caption className="sr-only">{copy.queue}</caption><thead className="bg-canvas/70 text-[10px] text-muted"><tr>{[copy.customer, copy.recipient, copy.amount, copy.time, copy.risk, copy.status].map((label) => <th scope="col" className="px-5 py-4 font-medium" key={label}>{label}</th>)}</tr></thead><tbody className="divide-y divide-line">{rows.map((tx) => <tr key={tx.id} data-transaction-id={tx.id} className={`cursor-pointer hover:bg-canvas/80 ${pinned.includes(tx.id) ? "bank-arrival bg-accent/5" : ""}`} onClick={() => onSelect(tx.id)} onKeyDown={(e) => { if (e.target === e.currentTarget && e.key === "Enter") onSelect(tx.id); }}><td className="px-5 py-4"><button type="button" className="text-left font-semibold text-primary hover:text-accent" aria-label={`${copy.open} ${tx.id}`} onClick={(e) => { e.stopPropagation(); onSelect(tx.id); }}>{tx.customerName}</button><span className="mt-1 block text-[9px] text-muted">{tx.id}{pinned.includes(tx.id) ? ` · ${copy.newLabel}` : ""}</span></td><td className="px-5 py-4"><span className="block max-w-40 truncate font-medium">{tx.recipientName}</span><span className="mt-1 block text-[9px] text-muted">{tx.maskedAccount}</span></td><td className="whitespace-nowrap px-5 py-4 font-semibold tabular-nums">{format(tx.amount)} {copy.currency}</td><td className="px-5 py-4 text-muted"><time dateTime={tx.timestamp}>{date(tx.timestamp)}</time></td><td className="px-5 py-4"><span className="mb-1.5 block font-semibold tabular-nums">{tx.riskScore}<span className="ml-1 text-[9px] font-normal text-muted">/100</span></span><BankRiskBadge level={tx.riskLevel} /></td><td className="px-5 py-4"><StatusBadge status={tx.status} /></td></tr>)}</tbody></table></div>
      <ul className="grid gap-3 p-4 sm:grid-cols-2 lg:hidden">{rows.map((tx) => <li key={tx.id}><button type="button" data-transaction-id={tx.id} onClick={() => onSelect(tx.id)} aria-label={`${copy.open} ${tx.id}`} className={`w-full rounded-xl border border-line p-4 text-left hover:border-accent ${pinned.includes(tx.id) ? "bank-arrival bg-accent/5" : "bg-white"}`}><span className="flex items-start justify-between gap-3"><span className="min-w-0"><span className="block truncate text-xs font-semibold">{tx.customerName}</span><span className="mt-1 block text-[9px] text-muted">{tx.id}</span></span><StatusBadge status={tx.status} /></span><span className="my-4 block truncate text-xs text-muted">{copy.recipient}: {tx.recipientName}</span><span className="flex items-end justify-between gap-3"><span><span className="block text-lg font-semibold tabular-nums">{format(tx.amount)} {copy.currency}</span><time dateTime={tx.timestamp} className="mt-1 block text-[10px] text-muted">{date(tx.timestamp)}</time></span><span className="text-right"><span className="mb-1 block text-sm font-semibold">{tx.riskScore}/100</span><BankRiskBadge level={tx.riskLevel} /></span></span>{pinned.includes(tx.id) && <span className="mt-3 block text-xs font-medium text-accent">{copy.newLabel}</span>}</button></li>)}</ul>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-5"><p className="text-xs text-muted">{copy.showing}: {format(filtered.length)}</p>{limit < filtered.length && <button type="button" className="secondary-button" onClick={() => setLimit((n) => n + 30)}>{copy.loadMore}</button>}</div>
    </>}
  </section>;
}
