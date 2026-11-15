"use client";
import { useEffect, useRef, useState } from "react";
import type { DashboardTransaction, AnalystDecision } from "@/lib/dashboard-data";
import type { Customer } from "@/lib/types";
import { bankDictionaries, displayCity } from "@/lib/i18n";
import { explainRisk } from "@/lib/explain";
import { useApp } from "../app-shell";
import { Icon } from "../icon";
import { RiskGauge } from "../risk-meter";
import { DecisionToast } from "./decision-toast";
import type { DecisionMessage } from "./decision-toast";
import { BankRiskBadge, StatusBadge } from "./transaction-list";

export function TransactionDrawer({ transaction: tx, customer, onClose, onDecision, message, dismissMessage }: { message: DecisionMessage | null; dismissMessage: () => void; transaction: DashboardTransaction; customer?: Customer; onClose: () => void; onDecision: (id: string, action: AnalystDecision["action"]) => void }) {
  const { lang } = useApp();
  const copy = bankDictionaries[lang];
  const dialog = useRef<HTMLDialogElement>(null);
  const blockButton = useRef<HTMLButtonElement>(null);
  const [confirmation, setConfirmation] = useState<AnalystDecision["action"] | null>(null);
  const explanation = explainRisk({ score: tx.riskScore, level: tx.riskLevel, action: tx.riskLevel === "high" ? "hold" : tx.riskLevel === "medium" ? "confirm" : "allow", signals: tx.signals }, lang);
  const format = (amount: number) => new Intl.NumberFormat(lang === "kk" ? "kk-KZ" : "ru-KZ", { maximumFractionDigits: 2 }).format(amount);
  const date = (time: string) => new Intl.DateTimeFormat(lang === "kk" ? "kk-KZ" : "ru-KZ", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Almaty" }).format(new Date(time));
  useEffect(() => {
    const element = dialog.current;
    const prior = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element?.showModal();
    return () => { element?.close(); document.body.style.overflow = overflow; if (prior?.isConnected) prior.focus(); else document.getElementById("queue-title")?.focus(); };
  }, []);
  return <dialog ref={dialog} aria-labelledby="bank-detail-title" aria-describedby="bank-detail-reference" aria-modal="true" onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) { const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose(); } }} onKeyDown={(event) => {
    if (event.key !== "Tab") return;
    const focusable = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],select:not(:disabled),input:not(:disabled),[tabindex="0"]')].filter((element) => element.getClientRects().length);
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }} className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-full max-w-xl border-0 bg-white p-0 text-ink shadow-2xl backdrop:bg-primary/40 backdrop:backdrop-blur-sm">
    <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-white p-5 sm:p-6"><div><h2 id="bank-detail-title" className="text-xl font-semibold">{copy.detail}</h2><p id="bank-detail-reference" className="mt-1 break-all text-[10px] text-muted">{tx.id}</p></div><button type="button" autoFocus aria-label={copy.close} onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas text-primary hover:bg-line"><Icon name="close" /></button></div>
    <div className="p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><BankRiskBadge level={tx.riskLevel} /><StatusBadge status={tx.status} /></div><RiskGauge score={tx.riskScore} level={tx.riskLevel} /><dl className="mb-6 grid grid-cols-2 gap-4 rounded-xl bg-canvas p-4 text-xs"><div className="min-w-0"><dt className="text-muted">{copy.customer}</dt><dd className="mt-2 break-words font-medium">{tx.customerName}</dd></div><div className="min-w-0"><dt className="text-muted">{copy.recipient}</dt><dd className="mt-2 break-words font-medium">{tx.recipientName}<span className="mt-1 block text-[10px] text-muted">{tx.maskedAccount}</span></dd></div><div><dt className="text-muted">{copy.amount}</dt><dd className="mt-2 text-lg font-semibold">{format(tx.amount)} {copy.currency}</dd></div><div><dt className="text-muted">{copy.time}</dt><dd className="mt-2 leading-5">{date(tx.timestamp)}</dd></div></dl>
      <section aria-labelledby="bank-signals-title"><h3 id="bank-signals-title" className="text-sm font-semibold">{copy.signals}</h3><p className="mt-2 text-xs leading-6 text-muted">{explanation.summary}</p><ul className="my-4 space-y-4">{tx.signals.length ? tx.signals.map((signal, i) => <li key={signal.id}><div className="mb-2 flex items-start justify-between gap-4 text-xs leading-5"><p className="text-muted">{explanation.reasons[i]}</p><span className="shrink-0 font-semibold text-primary">+{signal.weight} {copy.points}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-canvas" aria-hidden="true"><div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, Math.max(0, signal.weight))}%` }} /></div></li>) : <li className="text-xs text-muted">{copy.noSignals}</li>}</ul><p className="text-[10px] leading-5 text-muted">{copy.scoreNote}</p></section>
      <div className="my-6 rounded-xl border border-accent/15 bg-accent/5 p-4"><h3 className="text-xs font-semibold">{copy.tip}</h3><p className="mt-2 text-xs leading-6 text-muted">{explanation.tip}</p></div>
      <section className="mb-6" aria-label={copy.typical}>{customer ? <div className="overflow-hidden rounded-xl border border-line"><table className="w-full table-fixed text-left text-[10px]"><caption className="sr-only">{copy.typical} · {copy.current}</caption><thead className="bg-canvas"><tr><th scope="col" className="p-3 font-medium">{copy.detail}</th><th scope="col" className="p-3 font-medium">{copy.typical}</th><th scope="col" className="p-3 font-medium">{copy.current}</th></tr></thead><tbody>{[[copy.averageAmount, `${format(customer.avgTransferAmount)} ${copy.currency}`, `${format(tx.amount)} ${copy.currency}`], [copy.hours, `${customer.typicalHours[0]}:00–${customer.typicalHours[1]}:00`, new Intl.DateTimeFormat(lang === "kk" ? "kk-KZ" : "ru-KZ", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Almaty" }).format(new Date(tx.timestamp))], [copy.device, copy.knownDevice, customer.knownDeviceIds.includes(tx.deviceId) ? copy.knownDevice : copy.newDevice], [copy.recipient, copy.knownRecipient, customer.knownRecipientIds.includes(tx.recipientId) ? copy.knownRecipient : copy.newRecipient], [copy.city, displayCity(customer.homeCity, lang), displayCity(tx.city, lang)]].map(([label, typical, actual]) => <tr key={label} className="border-t border-line"><th scope="row" className="break-words p-3 font-normal leading-5 text-muted">{label}</th><td className="break-words p-3 leading-5">{typical}</td><td className="break-words p-3 font-medium leading-5">{actual}</td></tr>)}</tbody></table></div> : <p className="text-xs text-muted">{copy.noCustomer}</p>}</section>
      {tx.analystDecision && <p className="mb-5 text-xs leading-6 text-muted">{copy.decisionAt}: {date(tx.analystDecision.decidedAt)} · {tx.analystDecision.action === "block" ? copy.block : copy.allow}</p>}
      {confirmation ? <section className="rounded-xl border border-line bg-canvas p-4" aria-labelledby="bank-confirm-title"><h3 id="bank-confirm-title" className="text-sm font-semibold" role="alert">{confirmation === "block" ? copy.blockTitle : copy.allowTitle}</h3><p className="my-3 text-xs leading-6 text-muted">{confirmation === "block" ? copy.blockHint : copy.allowHint}</p><div className="flex flex-wrap gap-3"><button type="button" autoFocus className="primary-button" onClick={() => { onDecision(tx.id, confirmation); setConfirmation(null); requestAnimationFrame(() => blockButton.current?.focus()); }}>{confirmation === "block" ? copy.confirmBlock : copy.confirmAllow}</button><button type="button" className="secondary-button" onClick={() => { setConfirmation(null); requestAnimationFrame(() => blockButton.current?.focus()); }}>{copy.cancel}</button></div></section> : <div className="flex gap-3"><button ref={blockButton} type="button" className="primary-button flex-1" onClick={() => setConfirmation("block")}><Icon name="close" />{copy.block}</button><button type="button" className="secondary-button flex-1" onClick={() => setConfirmation("allow")}><Icon name="check" />{copy.allow}</button></div>}
      {message && <DecisionToast message={message} onDismiss={dismissMessage} />}
    </div>
  </dialog>;
}
