"use client";
import { useState } from "react";
import type { FormEvent } from "react";
import type { Recipient } from "@/lib/types";
import { parseAmount, validateTransfer } from "@/lib/transfer-form";
import type { TransferFormValues } from "@/lib/transfer-form";
import { useApp } from "./app-shell";
import { Icon } from "./icon";

export function TransferForm({ values, recipients, onChange, onSubmit, busy = false }: {
  values: TransferFormValues; recipients: Recipient[]; onChange: (patch: Partial<TransferFormValues>) => void; onSubmit: () => void; busy?: boolean;
}) {
  const { copy, lang, customer } = useApp();
  const [attempted, setAttempted] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const errors = validateTransfer(values);
  function error(key: keyof typeof errors) { const code = errors[key]; return code && (attempted || touched[key]) ? copy[code] : undefined; }
  function submit(event: FormEvent) {
    event.preventDefault(); setAttempted(true);
    if (Object.keys(errors).length) { document.getElementById(`transfer-${Object.keys(errors)[0]}`)?.focus(); return; }
    onSubmit();
  }
  const knownRecipients = recipients.filter((r) => customer.knownRecipientIds.includes(r.id) || r.id === values.recipientId);
  return <form id="transfer-form" onSubmit={submit} noValidate className="panel p-4 sm:p-5" aria-labelledby="form-title">
    <div className="mb-3 flex items-center justify-between gap-3"><h2 id="form-title" className="text-base font-semibold tracking-tight">{copy.formTitle}</h2><span className="rounded-lg bg-accent/5 p-2 text-accent"><Icon name="arrow" className="h-4 w-4" /></span></div>
    <fieldset disabled={busy} className="grid gap-3 sm:grid-cols-2">
      <div><label className="label" htmlFor="transfer-recipientId">{copy.recipient}</label><select id="transfer-recipientId" className="field" value={values.recipientId} onChange={(e) => onChange({ recipientId: e.target.value })} onBlur={() => setTouched({ ...touched, recipientId: true })} aria-invalid={Boolean(error("recipientId"))} aria-describedby={error("recipientId") ? "recipient-error" : undefined}><option value="">{copy.chooseRecipient}</option>{knownRecipients.map((r) => <option key={r.id} value={r.id}>{r.name} · {r.maskedAccount}</option>)}<option value="new">+ {copy.newRecipient}</option></select>{error("recipientId") && <p id="recipient-error" className="mt-1 text-xs text-high">{error("recipientId")}</p>}</div>
      <div><label className="label" htmlFor="transfer-amount">{copy.amount}</label><div className="relative"><input id="transfer-amount" className="field pr-10 text-lg font-semibold tabular-nums" inputMode="decimal" autoComplete="off" value={values.amount} maxLength={24} onChange={(e) => onChange({ amount: e.target.value })} onBlur={() => { setTouched({ ...touched, amount: true }); const amount = parseAmount(values.amount); if (Number.isFinite(amount)) onChange({ amount: new Intl.NumberFormat(lang === "kk" ? "kk-KZ" : "ru-KZ", { maximumFractionDigits: 2 }).format(amount) }); }} aria-invalid={Boolean(error("amount"))} aria-describedby={error("amount") ? "amount-error" : "amount-hint"} /><span className="pointer-events-none absolute right-3 top-2.5 text-lg text-muted">{copy.currency}</span></div><p id="amount-hint" className="mt-1 text-[10px] text-muted">{copy.amountHint}</p>{error("amount") && <p id="amount-error" className="mt-1 text-xs text-high">{error("amount")}</p>}</div>
      {values.recipientId === "new" && <div className="grid gap-3 rounded-xl bg-canvas p-3 sm:col-span-2 sm:grid-cols-2"><div><label htmlFor="transfer-recipientName" className="label">{copy.recipientName}</label><input id="transfer-recipientName" className="field" value={values.recipientName} maxLength={80} autoComplete="off" onChange={(e) => onChange({ recipientName: e.target.value })} onBlur={() => setTouched({ ...touched, recipientName: true })} aria-invalid={Boolean(error("recipientName"))} aria-describedby={error("recipientName") ? "name-error" : undefined} />{error("recipientName") && <p id="name-error" className="mt-1 text-xs text-high">{error("recipientName")}</p>}</div><div><label htmlFor="transfer-recipientAccount" className="label">{copy.recipientAccount}</label><input id="transfer-recipientAccount" className="field" value={values.recipientAccount} maxLength={40} autoComplete="off" spellCheck={false} onChange={(e) => onChange({ recipientAccount: e.target.value })} onBlur={() => setTouched({ ...touched, recipientAccount: true })} aria-invalid={Boolean(error("recipientAccount"))} aria-describedby={`account-hint${error("recipientAccount") ? " account-error" : ""}`} /><p id="account-hint" className="mt-1 text-[10px] leading-4 text-muted">{copy.accountHint}</p>{error("recipientAccount") && <p id="account-error" className="mt-1 text-xs text-high">{error("recipientAccount")}</p>}</div></div>}
      <details className="rounded-xl border border-line bg-canvas/60 p-3 sm:col-span-2"><summary className="cursor-pointer text-xs font-medium text-muted">{copy.simulation}</summary><div className="mt-3 grid gap-3 sm:grid-cols-2"><div><label className="label" htmlFor="transfer-device">{copy.device}</label><select id="transfer-device" className="field" value={values.device} onChange={(e) => onChange({ device: e.target.value as TransferFormValues["device"] })}><option value="known">{copy.thisDevice}</option><option value="new">{copy.newDevice}</option></select></div><div><label className="label" htmlFor="transfer-time">{copy.time}</label><select id="transfer-time" className="field" value={values.time} onChange={(e) => onChange({ time: e.target.value as TransferFormValues["time"] })}><option value="now">{copy.now}</option><option value="night">{copy.night}</option></select></div></div></details>
      <button type="submit" className="primary-button w-full sm:col-span-2">{busy ? copy.sending : copy.submit}<Icon name="arrow" /></button>
    </fieldset>
    <p className="mt-2 text-center text-[10px] leading-4 text-muted">{copy.fakeOnly}</p>
  </form>;
}
