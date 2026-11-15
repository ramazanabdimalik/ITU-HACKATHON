import { emptyForm, formatAmountInput } from "./transfer-form.ts";
import type { Customer } from "./types.ts";
import type { TransferFormValues } from "./transfer-form.ts";
export type ScenarioId = "normal" | "night" | "flagged" | "velocity";
/** Fills inputs only. Expected levels are verified against the real engine in tests. */
export function scenarioValues(id: ScenarioId, customer: Customer, fakeName: string): TransferFormValues {
  const normal: TransferFormValues = { ...emptyForm, recipientId: customer.knownRecipientIds[0], amount: formatAmountInput(customer.avgTransferAmount), demoTimestamp: "2026-11-15T07:00:00.000Z" };
  if (id === "normal") return normal;
  if (id === "night") return { ...normal, recipientId: "new", recipientName: fakeName, recipientAccount: "DEMO-2026", amount: formatAmountInput(customer.avgTransferAmount * 12), time: "night", demoTimestamp: "2026-11-13T18:00:00.000Z" };
  if (id === "flagged") return { ...normal, recipientId: "recipient-18" };
  return { ...normal, device: "new", demoTimestamp: "2026-11-14T05:06:00.000Z" };
}
