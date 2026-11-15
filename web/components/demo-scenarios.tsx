"use client";
import type { ScenarioId } from "@/lib/demo-scenarios";
import { useApp } from "./app-shell";
import { Icon } from "./icon";
export function DemoScenarios({ active, onSelect }: { active?: ScenarioId; onSelect: (id: ScenarioId) => void }) {
  const { copy } = useApp();
  const scenarios = [
    { id: "normal", title: copy.normalScenario, short: copy.shortNormal, icon: "arrow" },
    { id: "night", title: copy.nightScenario, short: copy.shortNight, icon: "clock" },
    { id: "flagged", title: copy.flaggedScenario, short: copy.shortFlagged, icon: "shield" },
    { id: "velocity", title: copy.velocityScenario, short: copy.shortVelocity, icon: "alert" },
  ] as const;
  return <section aria-label={copy.scenarios} aria-describedby="scenario-note" className="mb-3"><p id="scenario-note" className="sr-only">{copy.scenarioNote}</p><div className="grid grid-cols-4 gap-1.5 sm:gap-2">{scenarios.map((scenario) => <button key={scenario.id} type="button" aria-label={scenario.title} aria-pressed={active === scenario.id} onClick={() => onSelect(scenario.id)} className={`flex min-h-10 min-w-0 items-center justify-center gap-2 rounded-xl border px-1.5 py-2 text-center text-[9px] font-medium leading-4 sm:px-3 sm:text-xs ${active === scenario.id ? "border-accent bg-accent/5 text-accent" : "border-line bg-white text-ink hover:border-accent hover:bg-canvas"}`}><Icon name={scenario.icon} className="hidden h-4 w-4 shrink-0 sm:block" /><span>{scenario.short}</span></button>)}</div></section>;
}
