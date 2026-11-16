"use client";
import { useApp } from "./app-shell";
import { Icon } from "./icon";

export function AccountCard({ demoTimestamp, onNow }: { demoTimestamp?: string; onNow?: () => void }) {
  const { copy, customer, lang } = useApp();
  const index = Number(customer.id.split("-").at(-1)) || 1;
  const balance = new Intl.NumberFormat(lang === "kk" ? "kk-KZ" : "ru-KZ").format(2500000 + index * 175000);
  return <section aria-label={copy.account} className={`panel mb-2 flex flex-wrap items-center justify-between gap-3 px-4 py-2 lg:grid ${demoTimestamp ? "lg:grid-cols-[minmax(0,1fr)_auto_auto]" : "lg:grid-cols-[minmax(0,1fr)_auto]"}`}>
    <div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-white lg:hidden 2xl:flex"><Icon name="card" /></span><div><p className="text-xs leading-4 text-muted">{copy.account} · <span className="font-semibold text-ink">{customer.name}</span></p><p className="mt-1 text-xs tracking-widest text-muted" aria-label={copy.card}>•••• {String(4000 + index)}</p></div></div>
    {demoTimestamp && <div className="order-last flex w-full items-center justify-between gap-2 border-t border-line pt-2 text-xs leading-4 text-primary sm:order-none sm:w-auto sm:border-t-0 sm:pt-0"><div><p className="font-medium">{copy.scenarioActive}</p><p className="tabular-nums">{new Intl.DateTimeFormat(lang === "kk" ? "kk-KZ" : "ru-KZ", { dateStyle: "short", timeStyle: "short", hourCycle: "h23", timeZone: "Asia/Almaty" }).format(new Date(demoTimestamp))}</p></div><button className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-canvas hover:bg-line" aria-label={copy.closeScenario} title={copy.closeScenario} type="button" onClick={onNow}><Icon name="clock" className="h-4 w-4" /></button></div>}
    <div className="sm:border-l sm:border-line sm:pl-4"><p className="text-xs leading-4 text-muted">{copy.balance}</p><p className="text-lg font-semibold leading-6 tracking-tight tabular-nums">{balance} <span className="text-sm font-normal text-muted">{copy.currency}</span></p></div>
  </section>;
}
