"use client";
import Link from "next/link";
import { useApp } from "./app-shell";
import { HeroBand } from "./hero-band";
import { Icon } from "./icon";
export function NotFoundScreen() {
  const { copy } = useApp();
  return <div className="mx-auto max-w-3xl"><HeroBand eyebrow={copy.brand} title={copy.notFoundTitle} subtitle="404" /><section className="panel p-8 text-center sm:p-12"><span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/5 text-accent"><Icon className="h-8 w-8" /></span><p className="mx-auto max-w-lg text-sm leading-7 text-muted">{copy.notFoundText}</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Link className="primary-button" href="/transfer">{copy.transfer}<Icon name="arrow" /></Link><Link className="secondary-button" href="/dashboard">{copy.dashboard}</Link></div></section></div>;
}
