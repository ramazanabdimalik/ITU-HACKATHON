import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { mockData } from "./mock-data";
import { displayCity } from "./i18n";
import { pageCopy, pageMetadata } from "./page-metadata";

it("uses unique abbreviated Kazakhstan-style identities without generic labels", () => {
  const names = [...mockData.customers, ...mockData.recipients].map((person) => person.name);
  expect(new Set(names).size).toBe(28);
  for (const name of names) {
    expect(name).toMatch(/^\p{L}+ \p{L}\.$/u);
    expect(name).not.toMatch(/test|тест|вымышлен/i);
  }
});
it("localizes city labels without modifying stored profile data", () => {
  expect(displayCity("Караганда", "kk")).toBe("Қарағанды");
  expect(displayCity("Караганда", "ru")).toBe("Караганда");
  expect(displayCity("Алматы", "kk")).toBe("Алматы");
});
it("provides distinct localized titles and descriptions for all three page kinds", () => {
  for (const lang of ["ru", "kk"] as const) {
    const pages = (["transfer", "bank", "notFound"] as const).map((kind) => pageCopy(lang, kind));
    expect(new Set(pages.map((page) => page.title)).size).toBe(3);
    for (const page of pages) { expect(page.title).toContain("SafeTransfer"); expect(page.description.length).toBeGreaterThan(20); }
  }
  expect(pageCopy("ru", "transfer").title).not.toBe(pageCopy("kk", "transfer").title);
});
it("includes meaningful server-rendered Open Graph defaults and page-specific 404 metadata", () => {
  const metadata = pageMetadata("notFound");
  expect(metadata.title).toBe(pageCopy("ru", "notFound").title);
  expect(metadata.openGraph).toMatchObject({ type: "website", siteName: "SafeTransfer", locale: "ru_KZ", alternateLocale: "kk_KZ" });
});

it("keeps critical foreground/background token pairs at WCAG AA contrast", () => {
  const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
  function color(name: string) {
    const match = css.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6});`, "i"));
    if (!match) throw Error(`Missing color token: ${name}`);
    return [1, 3, 5].map((i) => parseInt(match[1].slice(i, i + 2), 16) / 255);
  }
  function luminance(rgb: number[]) {
    return rgb.map((n) => n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4).reduce((sum, n, i) => sum + n * [.2126, .7152, .0722][i], 0);
  }
  function contrast(fg: number[], bg: number[]) {
    const a = luminance(fg), b = luminance(bg);
    return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
  }
  const white = [1, 1, 1];
  for (const name of ["primary", "ink", "muted", "accent"]) expect(contrast(color(name), white)).toBeGreaterThanOrEqual(4.5);
  for (const [fg, bg] of [["muted", "canvas"], ["accent", "canvas"], ["accent", "high-soft"], ["low", "low-soft"], ["medium", "medium-soft"], ["high", "high-soft"]]) expect(contrast(color(fg), color(bg))).toBeGreaterThanOrEqual(4.5);
  const activeChip = color("canvas").map((n, i) => n * .95 + color("accent")[i] * .05);
  expect(contrast(color("accent"), activeChip)).toBeGreaterThanOrEqual(4.5);
});
