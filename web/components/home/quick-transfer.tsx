"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../app-shell";
import { redesignDictionaries } from "@/lib/i18n";
import { formatAmountInput, parseAmount } from "@/lib/transfer-form";
import { Icon } from "../icon";
export function QuickTransfer() {
  const { lang, customer, recipients } = useApp();
  const copy = redesignDictionaries[lang], router = useRouter();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState(false);
  return <section className="panel p-5 sm:p-6"><h2 className="text-lg font-semibold">{copy.quickTitle}</h2><p className="mt-2 text-xs leading-5 text-muted">{copy.quickHint}</p><form className="mt-5 space-y-4" noValidate onSubmit={(e) => { e.preventDefault(); const number = parseAmount(amount); if (!customer.knownRecipientIds.includes(recipient) || !Number.isFinite(number) || number < 1 || number > 10000000) { setError(true); return; } router.push(`/transfer?${new URLSearchParams({ customerId: customer.id, recipientId: recipient, amount: String(number) })}`); }}><div><label className="label" htmlFor="quick-recipient">{copy.recipient}</label><div className="relative"><Icon name="user" className="pointer-events-none absolute top-3 left-3 h-5 w-5 text-muted" /><select id="quick-recipient" className="field pl-10" value={recipient} onChange={(e) => setRecipient(e.target.value)} aria-invalid={error && !recipient} aria-describedby={error ? "quick-error" : undefined}><option value="">{copy.chooseRecipient}</option>{recipients.filter((r) => customer.knownRecipientIds.includes(r.id)).map((r) => <option key={r.id} value={r.id}>{r.name} · {r.maskedAccount}</option>)}</select></div></div><div><label className="label" htmlFor="quick-amount">{copy.amount}</label><div className="relative"><input id="quick-amount" className="field pr-14 text-base font-semibold" inputMode="decimal" value={amount} maxLength={24} onChange={(e) => setAmount(e.target.value)} onBlur={() => { const value = parseAmount(amount); if (Number.isFinite(value)) setAmount(formatAmountInput(value)); }} aria-describedby={error ? "quick-error" : undefined} /><span className="absolute top-3 right-4 text-sm font-semibold text-muted">₸</span></div></div>{error && <p id="quick-error" role="alert" className="text-xs leading-5 text-high">{copy.quickError}</p>}<button type="submit" className="primary-button w-full">{copy.continue}<Icon name="arrow" /></button></form></section>;
}
