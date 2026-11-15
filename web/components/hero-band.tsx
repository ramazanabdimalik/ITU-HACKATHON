import { useId } from "react";
export function HeroBand({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle: string; children?: React.ReactNode }) {
  const pattern = useId();
  return <section className="hero-band relative mb-3 overflow-hidden rounded-2xl px-5 py-3 text-white">
    <svg className="pointer-events-none absolute -top-12 right-0 h-48 w-80 opacity-[.12]" viewBox="0 0 320 190" fill="none" aria-hidden="true"><defs><pattern id={pattern} width="64" height="64" patternUnits="userSpaceOnUse"><path d="m32 8-17 7v15c0 12 17 21 17 21s17-9 17-21V15L32 8Z" stroke="white" strokeWidth="1" /></pattern></defs><rect width="320" height="190" fill={`url(#${pattern})`} /></svg>
    <div className="relative flex flex-wrap items-center justify-between gap-3"><div><p className="mb-1 text-[9px] leading-3 font-semibold tracking-[.16em] text-white/90">{eyebrow}</p><div className="flex flex-wrap items-baseline gap-x-5 gap-y-1"><h1 className="text-2xl leading-7 font-semibold tracking-tight">{title}</h1><p className="max-w-xl text-xs leading-5 text-white/95">{subtitle}</p></div></div>{children}</div>
  </section>;
}
