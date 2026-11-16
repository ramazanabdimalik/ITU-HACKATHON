"use client";
import { useEffect, useRef, useState } from "react";
import { dashboardStats } from "@/lib/dashboard-data";
import type { Transaction } from "@/lib/types";
import { bankDictionaries } from "@/lib/i18n";
import { useApp } from "../app-shell";
import { Icon } from "../icon";

function CountUp({ value, format }: { value: number; format: (value: number) => string }) {
  const previous = useRef(0);
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const from = previous.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    function tick(now: number) {
      const progress = reduceMotion ? 1 : Math.min(1, (now - start) / 200);
      const next = from + (value - from) * (1 - (1 - progress) ** 3);
      previous.current = next; setDisplay(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <><span aria-hidden="true">{format(display)}</span><span className="sr-only">{format(value)}</span></>;
}
export function KpiCards({ transactions, loading }: { transactions: Transaction[]; loading: boolean }) {
  const { lang } = useApp();
  const copy = bankDictionaries[lang];
  const stats = dashboardStats(transactions);
  const number = (value: number) => new Intl.NumberFormat(lang === "kk" ? "kk-KZ" : "ru-KZ", { maximumFractionDigits: 0 }).format(value);
  const metrics = [
    { key: "total", title: copy.total, hint: copy.totalHint, value: stats.total, icon: "arrow" },
    { key: "flagged", title: copy.flagged, hint: copy.flaggedHint, value: stats.flagged, icon: "alert" },
    { key: "prevented", title: copy.prevented, hint: copy.preventedHint, value: stats.prevented, icon: "shield" },
    { key: "average", title: copy.average, hint: copy.averageHint, value: stats.average, icon: "clock" },
  ] as const;
  return <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label={copy.allCustomers} aria-busy={loading}>{metrics.map((m) => <div key={m.key} className="panel flex min-h-36 flex-col p-5"><div className="flex items-start justify-between gap-3"><h2 className="max-w-48 text-xs font-medium leading-5 text-muted">{m.title}</h2><span className="icon-chip h-9 w-9"><Icon name={m.icon} className="h-4 w-4" /></span></div>{loading ? <div className="my-4 h-8 w-24 animate-pulse rounded-md bg-canvas" /> : <p className="my-3 text-2xl font-semibold tracking-tight tabular-nums" data-kpi={m.key}><CountUp value={m.value} format={m.key === "average" ? (v) => new Intl.NumberFormat(lang === "kk" ? "kk-KZ" : "ru-KZ", { maximumFractionDigits: 1 }).format(v) : m.key === "prevented" ? (v) => new Intl.NumberFormat(lang === "kk" ? "kk-KZ" : "ru-KZ", { maximumFractionDigits: 2 }).format(v) : number} />{m.key === "prevented" && <span className="ml-1 text-base font-normal text-muted">{copy.currency}</span>}</p>}<div className="mt-auto"><p className="mb-2 text-xs leading-5 text-muted">{m.hint}</p><span className="inline-flex items-center gap-1.5 rounded-md bg-canvas px-2 py-1 text-xs font-medium text-muted"><span aria-hidden="true">—</span>{m.key === "total" ? copy.snapshotAll : m.key === "flagged" ? copy.snapshotFlagged : m.key === "prevented" ? copy.snapshotProtected : copy.snapshotScale}</span></div></div>)}</section>;
}
