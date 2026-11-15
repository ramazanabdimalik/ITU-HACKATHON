"use client";
import { useApp } from "./app-shell";
import { Icon } from "./icon";

export function AccountCard() {
  const { copy, customer, lang } = useApp();
  const index = Number(customer.id.split("-").at(-1)) || 1;
  const balance = new Intl.NumberFormat(lang === "kk" ? "kk-KZ" : "ru-KZ").format(2500000 + index * 175000);
  return <section aria-label={copy.account} className="panel mb-2 flex flex-wrap items-center justify-between gap-3 px-4 py-3">
    <div className="flex items-center gap-3"><span className="flex h-10 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white"><Icon name="card" className="h-5 w-5" /></span><div><p className="mb-1 text-xs text-muted">{copy.account}</p><h2 className="text-xs font-semibold">{customer.name}</h2><p className="mt-1 text-[10px] tracking-widest text-muted" aria-label={copy.card}>DEMO · •••• {String(4000 + index)}</p></div></div>
    <div className="sm:border-l sm:border-line sm:pl-5"><p className="mb-1 text-xs text-muted">{copy.balance}</p><p className="text-xl font-semibold tracking-tight tabular-nums">{balance} <span className="text-lg font-normal text-muted">{copy.currency}</span></p></div>
  </section>;
}
