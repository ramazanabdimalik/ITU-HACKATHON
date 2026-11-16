import { emptyForm, formatAmountInput, parseAmount } from "./transfer-form";
import type { Customer, Recipient } from "./types";
/** URL values only prefill existing form fields; scoring still happens via /api/score. */
export function transferPrefill(params: Pick<URLSearchParams, "get">, customer: Customer, recipients: Recipient[]) {
  const amount = parseAmount(params.get("amount") ?? "");
  const recipientId = params.get("recipientId") ?? "";
  return { ...emptyForm,
    recipientId: recipients.some((r) => r.id === recipientId) && customer.knownRecipientIds.includes(recipientId) ? recipientId : "",
    amount: Number.isFinite(amount) && amount >= 1 && amount <= 10000000 ? formatAmountInput(amount) : "",
  };
}
