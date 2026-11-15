"use client";
import type { ScenarioId } from "@/lib/demo-scenarios";
import { useApp } from "./app-shell";
import { Icon } from "./icon";
export function DemoScenarios({ active, onSelect }: { active?: ScenarioId; onSelect: (id: ScenarioId) => void }) {
  const { copy } = useApp();
  const scenarios = [
    { id: "normal", title: copy.normalScenario, icon: "arrow" },
    { id: "night", title: copy.nightScenario, icon: "clock" },
    { id: "flagged", title: copy.flaggedScenario, icon: "shield" },
    { id: "velocity", title: copy.velocityScenario, icon: "alert" },
  ] as const;
  return <section aria-label={copy.scenarios} className="mb-7"><div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1"><h2 className="text-xs font-semibold">{copy.scenarios}</h2><p className="text-xs text-muted">{copy.scenariosHint}</p></div><div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">{scenarios.map((scenario, i) => <button key={scenario.id} type="button" aria-pressed={active === scenario.id} onClick={() => onSelect(scenario.id)} className={`group flex min-h-20 items-center gap-3 rounded-xl border p-3 text-left text-xs font-medium leading-5 transition-colors duration-200 sm:p-4 ${active === scenario.id ? "border-accent bg-accent/5 text-accent" : "border-line bg-white text-ink hover:border-accent"}`}><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-canvas text-accent"><Icon name={scenario.icon} className="h-4 w-4" /></span><span>{scenario.title}</span><span className="ml-auto hidden self-start text-[9px] text-muted sm:block">0{i + 1}</span></button>)}</div><p className="mt-2 text-[10px] leading-5 text-muted">{copy.scenarioNote}</p></section>;
}
