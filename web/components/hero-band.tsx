import { CloudShield } from "./cloud-art";
export function HeroBand({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle: string; children?: React.ReactNode }) {
  return <section className="hero-band relative mb-3 overflow-hidden rounded-2xl px-5 py-3 text-white">
    <CloudShield className="pointer-events-none absolute -right-5 -top-14 h-48 w-64 opacity-25" />
    <div className="relative flex flex-wrap items-center justify-between gap-3"><div><p className="mb-1 text-xs leading-3 font-semibold tracking-[.16em] text-white/90">{eyebrow}</p><div className="flex flex-wrap items-baseline gap-x-5 gap-y-1"><h1 className="text-2xl leading-7 font-semibold tracking-tight">{title}</h1><p className="max-w-xl text-xs leading-5 text-white/95">{subtitle}</p></div></div>{children}</div>
  </section>;
}
