"use client";
import type { AnalystDecision } from "@/lib/dashboard-data";
import { bankDictionaries } from "@/lib/i18n";
import { useApp } from "../app-shell";
import { Icon } from "../icon";
export interface DecisionMessage { transactionId: string; action: AnalystDecision["action"]; saved: boolean; }
export function DecisionToast({ message, onDismiss, floating = false }: { message: DecisionMessage; onDismiss: () => void; floating?: boolean }) {
  const { lang } = useApp();
  const copy = bankDictionaries[lang];
  return <div className={`${floating ? "fixed right-4 bottom-[calc(var(--nav-height)+16px+env(safe-area-inset-bottom))] left-4 z-50 mx-auto max-w-lg lg:bottom-4" : "mt-5"} flex items-start justify-between gap-4 rounded-xl border border-accent/20 bg-white p-4 shadow-card`}><div role="status" aria-live="polite" className="text-sm leading-6"><p>{message.saved ? message.action === "block" ? copy.blockedToast : copy.allowedToast : message.action === "block" ? copy.blocked : copy.completed}</p>{!message.saved && <p className="mt-2 text-xs text-medium">{copy.storageWarning}</p>}</div><button type="button" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg" aria-label={copy.dismissToast} onClick={onDismiss}><Icon name="close" /></button></div>;
}
