"use client";
import { useApp } from "./app-shell";
import { Icon } from "./icon";

export function AccountCard() {
  const { copy, customer, lang } = useApp();
  const index = Number(customer.id.split("-").at(-1)) || 1;
  const balance = new Intl.NumberFormat(lang === "kk" ? "kk-KZ" : "ru-KZ").format(2500000 + index * 175000);
  return <section aria-label={copy.account} className="panel mb-6 flex flex-col justify-between gap-6 p-5 sm:flex-row sm:items-center sm:p-6">
    <div className="flex items-center gap-4"><span className="flex h-14 w-16 shrink-0 items-center justify-center rounded-xl bg-primary text-white"><Icon name="card" className="h-7 w-7" /></span><div><p className="mb-1 text-xs text-muted">{copy.account}</p><h2 className="text-sm font-semibold">{customer.name}</h2><p className="mt-1 text-xs tracking-widest text-muted" aria-label={copy.card}>DEMO · •••• {String(4000 + index)}</p></div></div>
    <div className="border-t border-line pt-4 sm:border-t-0 sm:border-l sm:pl-8 sm:pt-0"><p className="mb-1 text-xs text-muted">{copy.balance}</p><p className="text-2xl font-semibold tracking-tight tabular-nums">{balance} <span className="text-lg font-normal text-muted">{copy.currency}</span></p></div>
  </section>;
}
