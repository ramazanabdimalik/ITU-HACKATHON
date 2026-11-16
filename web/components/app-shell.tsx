"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";
import { pageCopy } from "@/lib/page-metadata";
import { uiDictionaries, redesignDictionaries } from "@/lib/i18n";
import { useDashboard } from "@/lib/use-dashboard";
import type { Language } from "@/lib/i18n";
import type { Customer, Recipient } from "@/lib/types";
import { Icon } from "./icon";
import { CloudLogo, CloudShield } from "./cloud-art";
let sessionLanguage: Language | undefined;
function readLanguage(): Language { try { return sessionLanguage ?? (localStorage.getItem("safetransfer.lang") === "kk" ? "kk" : "ru"); } catch { return sessionLanguage ?? "ru"; } }
function subscribe(callback: () => void) { window.addEventListener("storage", callback); window.addEventListener("safetransfer-language", callback); return () => { window.removeEventListener("storage", callback); window.removeEventListener("safetransfer-language", callback); }; }
function writeLanguage(value: Language) { sessionLanguage = value; try { localStorage.setItem("safetransfer.lang", value); sessionLanguage = undefined; } catch { /* Session fallback. */ } window.dispatchEvent(new Event("safetransfer-language")); }
const AppContext = createContext<{ lang: Language; copy: typeof uiDictionaries.ru; customer: Customer; customers: Customer[]; recipients: Recipient[]; setCustomerId: (id: string) => void; data: ReturnType<typeof useDashboard> } | null>(null);
export function useApp() { const value = useContext(AppContext); if (!value) throw Error("AppShell required"); return value; }
export function AppShell({ customers, recipients, children }: { customers: Customer[]; recipients: Recipient[]; children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, readLanguage, () => "ru" as Language);
  const [customerId, setCustomerId] = useState(customers[0].id);
  const customer = customers.find((c) => c.id === customerId) ?? customers[0];
  const copy = uiDictionaries[lang], design = redesignDictionaries[lang];
  const pathname = usePathname();
  const data = useDashboard(customers, recipients);
  const pending = data.transactions.filter((tx) => tx.status === "pending_review").length;
  const nav = [{ href: "/", label: design.home, icon: "home" }, { href: "/transfer", label: design.transfer, icon: "arrow" }, { href: "/dashboard", label: design.bank, icon: "chart" }] as const;
  useEffect(() => {
    document.documentElement.lang = lang;
    const { title, description } = pageCopy(lang, pathname === "/dashboard" ? "bank" : pathname === "/transfer" ? "transfer" : pathname === "/" ? "home" : "notFound");
    function applyMetadata() {
      if (document.title !== title) document.title = title;
      function updateMeta(selector: string, value: string) {
        document.querySelectorAll<HTMLMetaElement>(selector).forEach((meta) => { if (meta.content !== value) meta.content = value; });
      }
      updateMeta('meta[name="description"]', description);
      updateMeta('meta[property="og:title"]', title);
      updateMeta('meta[property="og:description"]', description);
      updateMeta('meta[property="og:locale"]', lang === "kk" ? "kk_KZ" : "ru_KZ");
      updateMeta('meta[property="og:locale:alternate"]', lang === "kk" ? "ru_KZ" : "kk_KZ");
    }
    applyMetadata();
    // Next may stream default head tags after hydration. Guarded updates keep the
    // selected browser language consistent without a timer race or observer loop.
    const observer = new MutationObserver(applyMetadata);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["content"] });
    return () => observer.disconnect();
  }, [lang, pathname]);
  return <AppContext.Provider value={{ lang, copy, customer, customers, recipients, setCustomerId, data }}>
    <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-xl focus:bg-white focus:p-3">{copy.skip}</a>
    <aside className="app-sidebar fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-line bg-white px-4 py-6 lg:flex">
      <Link href="/" className="mb-9 flex min-h-11 items-center gap-2 px-2 text-xl font-bold tracking-tight"><CloudLogo />{copy.brand}</Link>
      <nav aria-label={copy.brand} className="space-y-2">{nav.map((item) => <Link key={item.href} href={item.href} aria-label={item.label} className="nav-item" aria-current={pathname === item.href ? "page" : undefined}><Icon name={item.icon} /><span>{item.label}</span>{item.href === "/dashboard" && pending > 0 && <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] text-white">{pending}</span>}</Link>)}</nav>
      <div className="sidebar-promo relative mt-auto overflow-hidden rounded-[22px] bg-[#EEE9FB] p-4 pt-24"><CloudShield className="absolute -top-3 right-0 h-32 w-44 text-primary" /><div className="relative"><h2 className="text-sm font-semibold">{design.promoTitle}</h2><p className="mt-2 text-xs leading-5 text-muted">{design.promoText}</p><Link href="/transfer" className="primary-button mt-4 w-full px-2">{design.promoButton}<Icon name="arrow" className="h-4 w-4" /></Link></div></div>
    </aside>
    <div className="lg:ml-56">
      <header className="flex min-h-20 items-center justify-between gap-3 px-5 py-3 sm:px-7 lg:justify-end">
        <Link href="/" className="flex min-h-11 items-center gap-1.5 text-lg font-bold lg:hidden"><CloudLogo />{copy.brand}</Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <div role="group" aria-label={copy.language} className="hidden rounded-[14px] border border-line bg-white/80 p-1 sm:flex">{(["ru", "kk"] as const).map((l) => <button type="button" key={l} onClick={() => writeLanguage(l)} aria-pressed={lang === l} className={`min-h-11 min-w-11 rounded-[10px] text-xs font-semibold ${lang === l ? "bg-primary text-white" : "text-muted hover:bg-canvas"}`}>{l.toUpperCase()}</button>)}</div>
          <Link href="/dashboard" aria-label={`${design.notifications}: ${pending}`} className="relative flex h-11 w-11 items-center justify-center rounded-[14px] bg-white text-primary shadow-card hover:bg-[#EEE9FB]"><Icon name="bell" />{pending > 0 && <span className="absolute -top-1 -right-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] text-white">{pending}</span>}</Link>
          <details className="relative" onKeyDown={(e) => { if (e.key === "Escape") { e.currentTarget.removeAttribute("open"); e.currentTarget.querySelector("summary")?.focus(); } }}><summary aria-label={design.profile} className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-[14px] p-1 hover:bg-white"><span className="avatar">{customer.name.split(" ").map((word) => word[0]).join("")}</span><span className="hidden text-xs font-semibold sm:block">{customer.name}</span><Icon name="down" className="hidden h-4 w-4 text-muted sm:block" /></summary><div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-[20px] border border-line bg-white p-4 shadow-card"><label className="label" htmlFor="customer">{design.profile}</label><select id="customer" className="field" value={customer.id} onChange={(e) => { setCustomerId(e.target.value); e.currentTarget.closest("details")?.removeAttribute("open"); }}>{customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><div className="mt-4 flex gap-2 sm:hidden" role="group" aria-label={copy.language}>{(["ru", "kk"] as const).map((l) => <button key={l} type="button" onClick={() => writeLanguage(l)} aria-pressed={lang === l} className={`min-h-11 flex-1 rounded-xl text-xs font-semibold ${lang === l ? "bg-primary text-white" : "bg-canvas text-muted"}`}>{l.toUpperCase()}</button>)}</div></div></details>
        </div>
      </header>
      <main id="main" className="app-main px-5 pb-8 sm:px-7">{children}</main>
      <footer className="flex flex-wrap justify-between gap-2 px-5 py-5 text-[10px] text-muted sm:px-7"><span>{copy.footer}</span><span>{copy.demoFooter}</span></footer>
    </div>
    <nav className="app-bottom-nav fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-line bg-white/95 backdrop-blur-md lg:hidden" aria-label={copy.brand}>{nav.map((item) => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined}><Icon name={item.icon} /><span>{item.label}</span></Link>)}</nav>
  </AppContext.Provider>;
}
