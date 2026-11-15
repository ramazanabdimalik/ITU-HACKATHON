import { DEFAULT_LANGUAGE, dictionaries } from "./i18n.ts";
import type { Language } from "./i18n.ts";
import type { RiskResult, RiskSignal } from "./types.ts";

/** Plain-language templates only; stable signal order breaks equal-weight ties. */
export function explainRisk(result: RiskResult, lang: Language = DEFAULT_LANGUAGE) {
  const dictionary = dictionaries[lang];
  function render(template: string, params: RiskSignal["params"]) {
    return template.replace(/\{(\w+)\}/g, (_, key: string) => {
      const value = params[key];
      return typeof value === "number"
        ? new Intl.NumberFormat(lang === "kk" ? "kk-KZ" : "ru-KZ", { maximumFractionDigits: 2 }).format(value)
        : String(value ?? "");
    });
  }
  const strongest = result.signals.reduce<RiskSignal | undefined>(
    (best, signal) => !best || signal.weight > best.weight ? signal : best, undefined,
  );
  return {
    summary: `${dictionary.levels[result.level]} ${render(dictionary.score, { score: result.score })} ${dictionary.actions[result.action]}`,
    reasons: result.signals.map((signal) => render(dictionary.signals[signal.id], signal.params)),
    tip: dictionary.tips[strongest?.id ?? "default"],
  };
}
