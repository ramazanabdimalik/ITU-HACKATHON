"use client";
import { useEffect, useRef } from "react";
import type { ScoreResponse } from "@/lib/use-live-risk";
import type { TransferFormValues } from "@/lib/transfer-form";
import { parseAmount } from "@/lib/transfer-form";
import { explainRisk } from "@/lib/explain";
import { useApp } from "./app-shell";
import { Icon } from "./icon";
import { riskStyles } from "./risk-meter";

export type DecisionPhase = "success" | "confirm" | "hold" | "review" | "cancelled";
export interface TransferDecisionState { phase: DecisionPhase; result: ScoreResponse; values: TransferFormValues; id: string; recipientName: string; }
export function TransferDecision({ decision, onAction, storageFailed = false }: { decision: TransferDecisionState; onAction: (action: "confirm" | "cancel" | "review" | "reset") => void; storageFailed?: boolean }) {
  const { copy, lang } = useApp();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [decision.phase]);
  const { phase, result } = decision;
  const explanation = explainRisk(result, lang);
  const style = riskStyles[result.level];
  const title = phase === "success" ? copy.success : phase === "confirm" ? copy.confirmation : phase === "hold" ? copy.hold : phase === "review" ? copy.reviewTitle : copy.cancelled;
  const text = phase === "success" ? copy.successText : phase === "confirm" ? copy.confirmationText : phase === "hold" ? copy.holdText : phase === "review" ? copy.reviewText : copy.cancelledText;
  return <section className="panel mx-auto max-w-2xl overflow-hidden" aria-labelledby="decision-title">
    <div className={`flex items-center gap-3 px-6 py-4 text-xs font-semibold ${phase === "success" ? "bg-low-soft text-low" : phase === "review" ? "bg-canvas text-primary" : `${style.soft} ${style.text}`}`}><Icon name={phase === "success" ? "check" : phase === "review" ? "clock" : style.icon} />{phase === "success" ? copy.completedStatus : phase === "review" ? copy.reviewStatus : copy[result.level]}</div>
    <div className="p-6 sm:p-9"><h2 id="decision-title" tabIndex={-1} ref={heading} className="text-2xl font-semibold tracking-tight outline-offset-4">{title}</h2><p className="mt-3 text-sm leading-7 text-muted">{text}</p>
      <dl className="my-6 grid gap-4 rounded-xl bg-canvas p-5 text-sm sm:grid-cols-2"><div><dt className="text-xs text-muted">{copy.to}</dt><dd className="mt-2 break-words font-medium">{decision.recipientName}</dd></div><div><dt className="text-xs text-muted">{copy.printAmount}</dt><dd className="mt-2 text-xl font-semibold tabular-nums">{new Intl.NumberFormat(lang === "kk" ? "kk-KZ" : "ru-KZ").format(parseAmount(decision.values.amount))} {copy.currency}</dd></div></dl>
      {(phase === "confirm" || phase === "hold") && <><p className="text-sm leading-7 text-muted">{explanation.summary}</p><ul className="my-4 space-y-2">{explanation.reasons.map((reason, i) => <li key={i} className={`flex gap-2 rounded-xl p-3 text-sm leading-6 ${style.soft} ${style.text}`}><Icon name={style.icon} className="mt-1 h-4 w-4 shrink-0" /><span>{reason}</span></li>)}</ul><div className="my-6 rounded-xl border border-accent/20 bg-accent/5 p-4"><h3 className="flex items-center gap-2 text-sm font-semibold"><Icon />{copy.tip}</h3><p className="mt-2 text-sm leading-6 text-muted">{explanation.tip}</p></div></>}
      {(phase === "success" || phase === "review") && <p className="mb-6 break-all text-xs text-muted">{copy.reference}: {decision.id}</p>}
      {storageFailed && <p role="alert" className="mb-5 rounded-xl bg-medium-soft p-4 text-sm leading-6 text-medium">{copy.storageWarning}</p>}
      <div className="flex flex-col gap-3 sm:flex-row">
        {phase === "confirm" && <><button type="button" onClick={() => onAction("confirm")} className="primary-button sm:flex-1">{copy.confirm}<Icon name="arrow" /></button><button type="button" onClick={() => onAction("cancel")} className="secondary-button">{copy.cancel}</button></>}
        {phase === "hold" && <><button type="button" onClick={() => onAction("review")} className="primary-button sm:flex-1">{copy.review}</button><button type="button" onClick={() => onAction("cancel")} className="secondary-button">{copy.cancelTransfer}</button></>}
        {phase !== "confirm" && phase !== "hold" && <button type="button" onClick={() => onAction("reset")} className="primary-button">{copy.another}<Icon name="arrow" /></button>}
      </div>
    </div>
  </section>;
}
