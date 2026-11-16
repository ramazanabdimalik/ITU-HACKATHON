"use client";
import { useApp } from "./app-shell";
import { Icon } from "./icon";
export function TrustStrip() {
  const { copy } = useApp();
  return <ul className="trust-strip mb-3 grid grid-cols-3 gap-2 px-1 py-1 text-xs leading-4 text-muted sm:flex sm:gap-6" aria-label={copy.securityNote}>
    <li className="flex min-w-0 items-center gap-1.5"><Icon name="clock" className="h-3.5 w-3.5 shrink-0 text-accent" /><span>{copy.trustRealtime}</span></li>
    <li className="flex min-w-0 items-center gap-1.5"><Icon name="check" className="h-3.5 w-3.5 shrink-0 text-accent" /><span>{copy.trustExplain}</span></li>
    <li className="flex min-w-0 items-center gap-1.5" title={copy.trustLocalHint}><Icon className="h-3.5 w-3.5 shrink-0 text-accent" /><span>{copy.trustBrowser}</span><span className="sr-only">{copy.trustLocalHint}</span></li>
  </ul>;
}
