import { expect, it } from "vitest";
import { explainRisk } from "./explain";
import { dictionaries } from "./i18n";
import type { RiskResult } from "./types";

const result: RiskResult = {
  score: 85, level: "high", action: "hold", signals: [
    { id: "new_device", weight: 15, params: { deviceId: "new" } },
    { id: "flagged_recipient", weight: 40, params: { recipientId: "fake" } },
  ],
};
it("defaults to Russian and chooses the strongest signal tip, not the first", () => {
  const explanation = explainRisk(result);
  expect(explanation.summary).toContain("85");
  expect(explanation.reasons).toHaveLength(2);
  expect(explanation.tip).toBe(dictionaries.ru.tips.flagged_recipient);
  expect(result.signals[0].id).toBe("new_device");
});
it("renders Kazakh and provides a general tip when no signals exist", () => {
  expect(explainRisk(result, "kk").tip).toBe(dictionaries.kk.tips.flagged_recipient);
  expect(explainRisk(result, "kk").summary).not.toBe(explainRisk(result).summary);
  expect(explainRisk({ score: 0, level: "low", action: "allow", signals: [] })).toMatchObject({ reasons: [], tip: dictionaries.ru.tips.default });
});
