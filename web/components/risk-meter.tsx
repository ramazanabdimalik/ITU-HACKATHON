"use client";
import type { ScoreResponse } from "@/lib/use-live-risk";
import { useApp } from "./app-shell";
import { Icon } from "./icon";

export const riskStyles = {
  low: { text: "text-low", soft: "bg-low-soft", icon: "check" as const },
  medium: { text: "text-medium", soft: "bg-medium-soft", icon: "alert" as const },
  high: { text: "text-high", soft: "bg-high-soft", icon: "shield" as const },
};
export function RiskMeter({ result, status, retry }: { result?: ScoreResponse; status: string; retry: () => void }) {
  const { copy } = useApp();
  const style = result ? riskStyles[result.level] : undefined;
  return <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start" aria-label={copy.protection}>
    <section className="panel overflow-hidden" aria-busy={status === "loading"}>
      <div className="flex items-center gap-3 border-b border-line px-6 py-5"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent"><Icon /></span><div><p className="text-[9px] font-semibold tracking-[.1em] text-accent">{copy.realtime}</p><h2 className="mt-1 text-sm font-semibold">{copy.protection}</h2></div></div>
      <div className="p-6">
        {status === "loading" ? <div role="status" className="space-y-5 py-5 text-center"><div className="mx-auto h-32 w-48 animate-pulse rounded-t-full bg-canvas" /><p className="text-sm text-muted">{copy.riskLoading}</p><div className="h-10 animate-pulse rounded-xl bg-canvas" /></div>
          : status === "error" ? <div role="alert" className="py-6 text-center"><span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-medium-soft text-medium"><Icon name="alert" /></span><p className="text-sm leading-6 text-muted">{copy.riskError}</p><button className="secondary-button mt-5" type="button" onClick={retry}>{copy.retry}</button></div>
          : result && style ? <>
            <div className={style.text}>
              <svg viewBox="0 0 240 148" className="mx-auto w-full max-w-64" role="img" aria-label={`${copy.riskScore}: ${result.score} ${copy.outOf}. ${copy[result.level]}`}>
                <path d="M25 120 A95 95 0 0 1 215 120" fill="none" stroke="#edf1f3" strokeWidth="13" strokeLinecap="round" />
                <path d="M25 120 A95 95 0 0 1 215 120" fill="none" stroke="currentColor" strokeWidth="13" strokeLinecap="round" pathLength="100" strokeDasharray="100" strokeDashoffset={100 - result.score} className="transition-[stroke-dashoffset,stroke] duration-200" />
                <text x="120" y="104" textAnchor="middle" fill="currentColor" className="text-[45px] font-semibold tracking-tight">{result.score}</text>
                <text x="120" y="130" textAnchor="middle" fill="#526174" className="text-[11px]">{copy.outOf}</text>
              </svg>
              <p className={`mx-auto flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${style.soft}`} role="status"><Icon name={style.icon} className="h-4 w-4" />{copy[result.level]}</p>
            </div>
            <div className="mt-6 border-t border-line pt-5"><h3 className="mb-3 text-xs font-semibold">{copy.signals}</h3>{result.explanation.reasons.length ? <ul className="space-y-2">{result.explanation.reasons.map((reason, i) => <li key={result.signals[i]?.id ?? i} className={`flex items-start gap-2 rounded-xl p-3 text-xs leading-5 ${style.soft} ${style.text}`}><Icon name={style.icon} className="mt-0.5 h-4 w-4 shrink-0" /><span>{reason}</span></li>)}</ul> : <p className="flex gap-2 text-sm leading-6 text-muted"><Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-low" />{copy.noSignals}</p>}</div>
          </> : <div className="py-8 text-center"><span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-canvas text-accent"><Icon className="h-8 w-8" /></span><h3 className="text-base font-semibold">{copy.riskIntro}</h3><p className="mt-3 text-sm leading-6 text-muted">{copy.riskEmpty}</p></div>}
      </div>
    </section>
    <div className="flex gap-3 rounded-2xl border border-accent/15 bg-accent/5 p-5"><Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" /><div><h3 className="text-xs font-semibold">{copy.protected}</h3><p className="mt-2 text-xs leading-5 text-muted">{copy.protectedText}</p></div></div>
  </aside>;
}
