import type { Customer } from "./types";

export interface TransferFormValues {
  recipientId: string;
  recipientName: string;
  recipientAccount: string;
  amount: string;
  device: "known" | "new";
  time: "now" | "night";
  demoTimestamp?: string;
}
export const emptyForm: TransferFormValues = { recipientId: "", recipientName: "", recipientAccount: "", amount: "", device: "known", time: "now" };
export function parseAmount(value: string) {
  const normalized = value.replace(/[\s\u00a0\u202f]/g, "").replace(",", ".");
  return /^\d+(?:\.\d{1,2})?$/.test(normalized) ? Number(normalized) : NaN;
}
export function validateTransfer(values: TransferFormValues) {
  const errors: Partial<Record<"recipientId" | "recipientName" | "recipientAccount" | "amount", "recipientError" | "nameError" | "accountError" | "amountError">> = {};
  if (!values.recipientId) errors.recipientId = "recipientError";
  if (values.recipientId === "new") {
    if (values.recipientName.trim().length < 2 || values.recipientName.trim().length > 80) errors.recipientName = "nameError";
    if (!/^DEMO-[A-Za-z0-9-]{1,35}$/.test(values.recipientAccount.trim())) errors.recipientAccount = "accountError";
  }
  const amount = parseAmount(values.amount);
  if (!Number.isFinite(amount) || amount < 1 || amount > 10000000) errors.amount = "amountError";
  return errors;
}
export function transferPayload(values: TransferFormValues, customer: Customer, lang: "ru" | "kk") {
  const date = new Date();
  if (values.time === "night") date.setUTCHours(18, 0, 0, 0); // 23:00 in Almaty.
  return {
    customerId: customer.id, recipientId: values.recipientId,
    amount: parseAmount(values.amount), deviceId: values.device === "new" ? `demo-new-${customer.id}` : customer.knownDeviceIds[0],
    timestamp: values.demoTimestamp ?? date.toISOString(), lang,
    ...(values.recipientId === "new" ? { newRecipient: { name: values.recipientName.trim(), account: values.recipientAccount.trim() } } : {}),
  };
}
