"use client";
import { bankDictionaries } from "@/lib/i18n";
import { dashboardCharts } from "@/lib/dashboard-data";
import type { Transaction } from "@/lib/types";
import { useApp } from "../app-shell";
import { Icon } from "../icon";

export function DashboardCharts({ transactions, loading }: { transactions: Transaction[]; loading: boolean }) {
  const { lang } = useApp();
  const copy = bankDictionaries[lang];
  const { daily, distribution, signals } = dashboardCharts(transactions);
  const total = transactions.length;
  const dailyTotal = daily.reduce((sum, d) => sum + d.count, 0);
  const maxDaily = Math.max(1, ...daily.map((d) => d.count));
  const maxSignal = Math.max(1, ...signals.map((s) => s.count));
  const date = (day: string) => new Intl.DateTimeFormat(lang === "kk" ? "kk-KZ" : "ru-KZ", { day: "2-digit", month: "2-digit", timeZone: "Asia/Almaty" }).format(new Date(day + "T00:00:00Z"));
  const levels = [{ level: "low", color: "var(--low)" }, { level: "medium", color: "var(--medium)" }, { level: "high", color: "var(--high)" }] as const;
  let offset = 0;
  const empty = <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-center text-xs leading-6 text-muted"><span className="rounded-xl bg-canvas p-3 text-accent"><Icon name="clock" /></span><p>{loading ? copy.loading : copy.chartsEmpty}</p></div>;
  return <section className="mb-6 grid gap-4 xl:grid-cols-[1.5fr_1fr_1fr]" aria-label={copy.dataset} aria-busy={loading}>
    <figure className="panel p-5"><figcaption id="daily-title" className="text-sm font-semibold">{copy.dailyTitle}</figcaption><p className="mt-2 text-xs leading-5 text-muted">{copy.dailyHint}</p>{dailyTotal ? <><svg viewBox="0 0 600 180" className="mt-5 w-full" role="img" aria-labelledby="daily-title daily-summary"><desc id="daily-summary">{copy.dailyTotal}: {dailyTotal}. {daily.length} {copy.days}.</desc>{[25, 80, 135].map((y) => <line key={y} x1="10" x2="590" y1={y} y2={y} stroke="var(--line)" strokeDasharray="3 5" />)}{daily.map((d, i) => <rect key={d.day} x={12 + i * 19.3} y={145 - (d.count / maxDaily) * 120} width="12" height={Math.max(d.count ? 3 : 1, (d.count / maxDaily) * 120)} rx="3" fill={d.count ? "var(--primary)" : "var(--line)"}><title>{date(d.day)}: {d.count}</title></rect>)}</svg><p className="mt-1 flex justify-between text-xs text-muted"><span>{date(daily[0].day)}</span><span>{date(daily.at(-1)!.day)}</span></p><div className="sr-only"><table><caption>{copy.dailyTitle}</caption><thead><tr><th scope="col">{copy.time}</th><th scope="col">{copy.flagged}</th></tr></thead><tbody>{daily.map((d) => <tr key={d.day}><th scope="row">{d.day}</th><td>{d.count}</td></tr>)}</tbody></table></div></> : empty}</figure>
    <figure className="panel p-5"><figcaption id="distribution-title" className="text-sm font-semibold">{copy.distributionTitle}</figcaption>{total ? <><svg viewBox="0 0 160 135" className="mx-auto mt-3 h-36 w-44" role="img" aria-labelledby="distribution-title distribution-summary"><desc id="distribution-summary">{levels.map(({ level }) => `${copy[level]}: ${distribution[level]}`).join(". ")}</desc>{levels.map(({ level, color }) => { const fraction = distribution[level] / total * 100; const start = offset; offset += fraction; return <circle key={level} cx="80" cy="67" r="45" fill="none" stroke={color} strokeWidth="14" pathLength="100" strokeDasharray={`${fraction} ${100 - fraction}`} strokeDashoffset={-start} transform="rotate(-90 80 67)" />; })}<text x="80" y="70" textAnchor="middle" fill="var(--ink)" className="text-[22px] font-semibold">{total}</text></svg><ul className="space-y-2">{levels.map(({ level, color }) => <li key={level} className="flex justify-between gap-3 text-xs"><span className="flex items-center gap-2 text-muted"><span style={{ color }}><Icon name={level === "low" ? "check" : "alert"} className="h-3.5 w-3.5" /></span>{copy[level]}</span><span className="font-semibold tabular-nums">{distribution[level]}</span></li>)}</ul></> : empty}</figure>
    <figure className="panel p-5"><figcaption id="frequency-title" className="text-sm font-semibold">{copy.signalsTitle}</figcaption>{signals.length ? <ul className="mt-5 space-y-3" aria-labelledby="frequency-title">{signals.map((signal) => <li key={signal.id}><div className="mb-1.5 flex justify-between gap-2 text-xs"><span className="text-muted">{copy[signal.id]}</span><span className="font-semibold tabular-nums" aria-label={`${signal.count} ${copy.occurrences}`}>{signal.count}</span></div><div className="h-1.5 rounded-full bg-canvas" aria-hidden="true"><div className="h-full rounded-full" style={{ width: `${signal.count / maxSignal * 100}%`, background: signal.id === "flagged_recipient" ? "var(--high)" : "var(--primary)" }} /></div></li>)}</ul> : empty}</figure>
  </section>;
}
