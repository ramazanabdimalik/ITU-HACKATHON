"use client";
import type { CSSProperties } from "react";
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
  return <aside className="lg:sticky lg:top-4 lg:self-start" aria-label={copy.protection}>
    <section data-risk-panel data-level={result?.level ?? status} className="risk-panel panel overflow-hidden transition-[border-color,box-shadow] duration-200" aria-busy={status === "loading"}>
      <div className="flex items-center gap-3 risk-panel-header border-b border-line px-4 py-3"><span key={result?.level ?? "idle"} className={`flex h-9 w-9 items-center justify-center rounded-xl ${style ? `${style.soft} ${style.text}` : "bg-accent/10 text-accent"} ${result?.level === "high" ? "risk-alert-once" : ""}`}><Icon name={style?.icon ?? "shield"} /></span><div><p className="text-[9px] font-semibold tracking-[.1em] text-accent">{copy.realtime}</p><h2 className="mt-1 text-sm font-semibold">{copy.protection}</h2></div></div>
      <div className="p-4">
        {status === "loading" ? <div role="status" className="space-y-4 py-3 text-center"><div className="mx-auto h-28 w-44 animate-pulse rounded-t-full bg-canvas" /><p className="text-sm text-muted">{copy.riskLoading}</p><div className="h-10 animate-pulse rounded-xl bg-canvas" /></div>
          : status === "error" ? <div role="alert" className="py-6 text-center"><span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-medium-soft text-medium"><Icon name="alert" /></span><p className="text-sm leading-6 text-muted">{copy.riskError}</p><button className="secondary-button mt-5" type="button" onClick={retry}>{copy.retry}</button></div>
          : result && style ? <>
            <div className={style.text}>
              <RiskGauge score={result.score} level={result.level} />
              <p className={`mx-auto flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${style.soft}`} role="status"><Icon name={style.icon} className="h-4 w-4" />{copy[result.level]}</p>
            </div>
            <div className="mt-4 border-t border-line pt-4"><h3 className="mb-2 text-xs font-semibold">{copy.signals}</h3>{result.explanation.reasons.length ? <ul className="space-y-2">{result.explanation.reasons.map((reason, i) => <li key={result.signals[i]?.id ?? i} className={`flex items-start gap-2 rounded-xl p-2.5 text-xs leading-5 ${style.soft} ${style.text}`}><Icon name={style.icon} className="mt-0.5 h-4 w-4 shrink-0" /><span>{reason}</span></li>)}</ul> : <p className="flex gap-2 text-sm leading-6 text-muted"><Icon name="check" className="mt-1 h-4 w-4 shrink-0 text-low" />{copy.noSignals}</p>}</div>
          </> : <div className="py-5 text-center"><ProtectionIllustration /><h3 className="mt-3 text-sm font-semibold">{copy.riskIntro}</h3><p className="mx-auto mt-2 max-w-52 text-sm leading-6 text-muted">{copy.riskEmpty}</p></div>}
      </div>
    </section>

  </aside>;
}

export function RiskGauge({ score, level }: { score: number; level: "low" | "medium" | "high" }) {
  const { copy } = useApp();
  return <div className={riskStyles[level].text}><svg viewBox="0 0 240 148" className="mx-auto w-full max-w-52" role="img" aria-label={`${copy.riskScore}: ${score} ${copy.outOf}. ${copy[level]}`}>
                <path d="M25 120 A95 95 0 0 1 215 120" fill="none" stroke="#edf1f3" strokeWidth="13" strokeLinecap="round" />
                <path d="M25 120 A95 95 0 0 1 215 120" fill="none" stroke="currentColor" strokeWidth="13" strokeLinecap="round" pathLength="100" strokeDasharray="100" strokeDashoffset={100 - score} style={{ "--gauge-offset": 100 - score } as CSSProperties} className="risk-gauge transition-[stroke-dashoffset,stroke] duration-200" />
                <text x="120" y="104" textAnchor="middle" fill="currentColor" className="text-[45px] font-semibold tracking-tight tabular-nums">{score}</text>
                <text x="120" y="130" textAnchor="middle" fill="#526174" className="text-[11px]">{copy.outOf}</text>
              </svg></div>;
}

function ProtectionIllustration() {
  return <svg className="mx-auto h-32 w-40" viewBox="0 0 160 128" fill="none" aria-hidden="true"><circle cx="80" cy="64" r="51" fill="var(--canvas)" /><circle cx="80" cy="64" r="43" stroke="var(--accent)" strokeOpacity=".25" strokeDasharray="3 6" /><path d="m80 29-26 11v23c0 20 26 36 26 36s26-16 26-36V40L80 29Z" fill="white" stroke="var(--accent)" strokeWidth="2" /><path d="m67 62 10 10 18-21" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /><circle cx="31" cy="42" r="5" fill="var(--accent)" fillOpacity=".15" /><circle cx="128" cy="83" r="7" fill="var(--primary)" fillOpacity=".1" /><path d="M122 28v10m-5-5h10M35 89v8m-4-4h8" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}
