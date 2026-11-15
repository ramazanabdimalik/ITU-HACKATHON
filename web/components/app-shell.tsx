"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";
import { pageCopy } from "@/lib/page-metadata";
import { uiDictionaries } from "@/lib/i18n";
import type { Language } from "@/lib/i18n";
import type { Customer } from "@/lib/types";
import { Icon } from "./icon";

function readLanguage(): Language {
  try { return sessionLanguage ?? (localStorage.getItem("safetransfer.lang") === "kk" ? "kk" : "ru"); } catch { return sessionLanguage ?? "ru"; }
}
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback); window.addEventListener("safetransfer-language", callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener("safetransfer-language", callback); };
}
let sessionLanguage: Language | undefined;
function writeLanguage(value: Language) {
  sessionLanguage = value;
  try { localStorage.setItem("safetransfer.lang", value); sessionLanguage = undefined; } catch { /* Session fallback remains usable. */ }
  window.dispatchEvent(new Event("safetransfer-language"));
}
const AppContext = createContext<{
  lang: Language; copy: typeof uiDictionaries.ru; customer: Customer; customers: Customer[]; setCustomerId: (id: string) => void;
} | null>(null);
export function useApp() { const context = useContext(AppContext); if (!context) throw Error("AppShell is required"); return context; }

export function AppShell({ customers, children }: { customers: Customer[]; children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, readLanguage, () => "ru" as Language);
  const [customerId, setCustomerId] = useState(customers[0].id);
  const customer = customers.find((c) => c.id === customerId) ?? customers[0];
  const copy = uiDictionaries[lang];
  const pathname = usePathname();
  useEffect(() => {
    document.documentElement.lang = lang;
    const { title, description } = pageCopy(lang, pathname === "/dashboard" ? "bank" : pathname === "/" ? "transfer" : "notFound");
    document.title = title;
    function updateMeta(selector: string, value: string) { document.querySelector<HTMLMetaElement>(selector)?.setAttribute("content", value); }
    updateMeta('meta[name="description"]', description);
    updateMeta('meta[property="og:title"]', title);
    updateMeta('meta[property="og:description"]', description);
    updateMeta('meta[property="og:locale"]', lang === "kk" ? "kk_KZ" : "ru_KZ");
    updateMeta('meta[property="og:locale:alternate"]', lang === "kk" ? "ru_KZ" : "kk_KZ");
  }, [lang, pathname]);
  return <AppContext.Provider value={{ lang, copy, customer, customers, setCustomerId }}>
    <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:p-3">{copy.skip}</a>
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
        <Link href="/" className="flex items-center gap-3 text-xl font-semibold tracking-tight"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white"><Icon /></span>{copy.brand}<span className="hidden rounded-md bg-canvas px-2 py-1 text-[10px] font-medium tracking-wider text-muted md:block">{copy.demo}</span></Link>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg bg-canvas p-1" role="group" aria-label={copy.language}>{(["ru", "kk"] as const).map((l) => <button key={l} type="button" aria-pressed={lang === l} onClick={() => writeLanguage(l)} className={`min-h-9 min-w-11 rounded-md text-xs font-semibold ${lang === l ? "bg-white text-primary shadow-sm" : "text-muted hover:text-primary"}`}>{l.toUpperCase()}</button>)}</div>
          {pathname === "/" && <>
          <label className="hidden text-xs text-muted sm:block" htmlFor="customer">{copy.customer}</label>
          <select id="customer" aria-label={copy.customer} value={customer.id} onChange={(e) => setCustomerId(e.target.value)} className="max-w-40 rounded-lg border border-line bg-white px-2 py-2.5 text-xs sm:max-w-52">{customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          </>}
        </div>
      </div>
      <nav aria-label={copy.brand} className="mx-auto flex max-w-7xl gap-7 px-5 sm:px-8">{[["/", copy.transfer], ["/dashboard", copy.dashboard]].map(([href, title]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={`border-b-2 py-2 text-sm font-medium ${pathname === href ? "border-accent text-accent" : "border-transparent text-muted hover:text-primary"}`}>{title}</Link>)}</nav>
    </header>
    <main id="main" className="mx-auto min-h-[75vh] max-w-7xl px-5 py-4 sm:px-8 lg:py-3">{children}</main>
    <footer className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 px-5 pb-7 text-xs leading-5 text-muted sm:px-8"><span>{copy.footer}</span><span>{copy.demoFooter}</span></footer>
  </AppContext.Provider>;
}

export function DashboardPlaceholder() {
  const { copy } = useApp();
  return <section className="panel mx-auto max-w-2xl p-8 text-center"><div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-canvas text-accent"><Icon /></div><h1 className="text-2xl font-semibold">{copy.dashboardTitle}</h1><p className="my-5 leading-7 text-muted">{copy.dashboardText}</p><Link href="/" className="primary-button">{copy.back}<Icon name="arrow" /></Link></section>;
}
