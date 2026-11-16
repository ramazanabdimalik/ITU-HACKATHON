import type { Metadata } from "next";
import { uiDictionaries, redesignDictionaries } from "./i18n";
import type { Language } from "./i18n";
export type PageKind = "home" | "transfer" | "bank" | "notFound";
export function pageCopy(lang: Language, kind: PageKind) {
  const copy = uiDictionaries[lang];
  return {
    title: kind === "home" ? redesignDictionaries[lang].metaHomeTitle : kind === "bank" ? copy.metaBankTitle : kind === "notFound" ? `${copy.notFoundTitle} · ${copy.brand}` : copy.metaTransferTitle,
    description: kind === "home" ? redesignDictionaries[lang].metaHomeDescription : kind === "bank" ? copy.metaBankDescription : kind === "notFound" ? copy.notFoundText : copy.metaDescription,
  };
}
export function pageMetadata(kind: PageKind): Metadata {
  const { title, description } = pageCopy("ru", kind);
  return { title, description, applicationName: "SafeTransfer", openGraph: { title, description, type: "website", siteName: "SafeTransfer", locale: "ru_KZ", alternateLocale: "kk_KZ" } };
}
