"use client";
import type { ScoreResponse } from "@/lib/use-live-risk";
import { useApp } from "./app-shell";
import { riskStyles } from "./risk-meter";
import { Icon } from "./icon";
export function MobileTransferBar({ result, status, busy }: { result?: ScoreResponse; status: string; busy: boolean }) {
  const { copy } = useApp();
  const style = result ? riskStyles[result.level] : undefined;
  return <div data-mobile-transfer-bar className="mobile-transfer-bar fixed inset-x-0 bottom-0 z-30 flex min-h-20 items-center justify-between gap-3 border-t border-line bg-white/95 px-4 py-3 shadow-[0_-6px_24px_-12px_#5B4CE633] backdrop-blur-md lg:hidden">
    <div role="status" aria-live="polite" className={`flex min-w-0 items-center gap-2 text-[11px] font-semibold leading-5 ${style?.text ?? "text-muted"}`}><Icon name={style?.icon ?? (status === "loading" ? "clock" : "shield")} className="h-5 w-5 shrink-0" /><span>{result ? <><span className="mr-1 tabular-nums">{result.score}</span>· {copy[result.level]}</> : status === "loading" ? copy.mobileChecking : status === "error" ? copy.mobileCheckError : copy.mobileIdle}</span></div>
    <button type="submit" form="transfer-form" disabled={busy} aria-busy={busy} className="primary-button max-w-[55%] shrink-0 px-4">{busy ? copy.mobileChecking : copy.submit}<Icon name="arrow" className="h-4 w-4" /></button>
  </div>;
}
