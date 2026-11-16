"use client";
import { useId, useState } from "react";
import { useApp } from "../app-shell";
import { redesignDictionaries } from "@/lib/i18n";
import { Icon } from "../icon";
export function FlaggedChart({ daily }: { daily: { day: string; count: number }[] }) {
  const { lang } = useApp();
  const copy = redesignDictionaries[lang], gradient = useId();
  const [selected, setSelected] = useState<number | null>(null);
  const max = Math.max(1, ...daily.map((d) => d.count));
  const active = selected ?? Math.max(0, daily.findIndex((d) => d.count === Math.max(...daily.map((v) => v.count))));
  const points = daily.map((d, i) => ({ ...d, x: 32 + i * 86, y: 130 - d.count / max * 95 }));
  const point = points[active];
  const line = points.map((d, i) => `${i ? "L" : "M"}${d.x} ${d.y}`).join(" ");
  const area = points.length ? `${line} L${points.at(-1)!.x} 145 L32 145 Z` : "";
  const date = (day: string) => new Intl.DateTimeFormat(lang === "kk" ? "kk-KZ" : "ru-KZ", { day: "2-digit", month: "2-digit", timeZone: "Asia/Almaty" }).format(new Date(day + "T00:00:00Z"));
  return <section className="panel min-w-0 p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><span className="icon-chip h-8 w-8"><Icon name="sparkle" className="h-4 w-4" /></span><h2 className="text-sm font-semibold">{copy.chartTitle}</h2></div><span className="text-[10px] text-muted">{copy.chartPeriod}</span></div>{points.length ? <><div className="relative mt-6"><svg viewBox="0 0 580 175" className="w-full overflow-visible" role="group" aria-label={copy.chartTitle}><defs><linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity=".22" /><stop offset="100%" stopColor="var(--primary)" stopOpacity="0" /></linearGradient></defs>{[40,85,130].map((y) => <line key={y} x1="24" x2="560" y1={y} y2={y} stroke="var(--line)" strokeDasharray="3 5" />)}<path d={area} fill={`url(#${gradient})`} /><path d={line} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />{points.map((d, i) => <g key={d.day} role="button" tabIndex={0} aria-label={`${date(d.day)}: ${d.count} · ${copy.dailyFlagged}`} onMouseEnter={() => setSelected(i)} onFocus={() => setSelected(i)} onClick={() => setSelected(i)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(i); } }} className="cursor-pointer"><rect x={d.x - 22} y={d.y - 22} width="44" height="44" fill="transparent" /><circle cx={d.x} cy={d.y} r={active === i ? 6 : 4} fill="white" stroke="var(--primary)" strokeWidth="2.5" /><text x={d.x} y="169" textAnchor="middle" fill="var(--muted)" fontSize="11">{date(d.day)}</text></g>)}</svg>{point && <div role="status" className="pointer-events-none absolute -top-3 rounded-xl border border-line bg-white px-3 py-2 text-[10px] shadow-card" style={{ left: `${Math.min(75, Math.max(10, point.x / 580 * 100))}%`, transform: "translateX(-50%)" }}><p className="text-muted">{date(point.day)}</p><p className="mt-1 font-semibold">{point.count} · {copy.dailyFlagged}</p></div>}</div><p className="mt-4 text-[10px] text-muted">{daily[0].day} — {daily.at(-1)!.day}</p></> : <p className="flex min-h-48 items-center justify-center text-sm text-muted">{copy.chartEmpty}</p>}</section>;
}
