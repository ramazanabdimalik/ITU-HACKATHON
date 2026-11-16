const paths = {
  shield: "M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3Zm-4 9 3 3 5-6",
  arrow: "M5 12h14m-5-5 5 5-5 5", check: "m5 12 4 4L19 6", alert: "m12 3 10 18H2L12 3Zm0 5v6m0 3v1",
  clock: "M12 8v4l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0", card: "M3 8h18M5 16h4M3 5h18v14H3V5Z", close: "m6 6 12 12M6 18 18 6",
  home: "m3 10 9-7 9 7v11h-6v-7H9v7H3V10Z", chart: "M4 3v17h17M8 15l4-5 4 2 4-7", bell: "M9 20h6M5 16h14l-2-3V8a5 5 0 0 0-10 0v5l-2 3Z",
  user: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-3a8 8 0 0 1 16 0v3", chevron: "m9 5 7 7-7 7", down: "m6 9 6 6 6-6", info: "M12 11v6m0-10v1M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0", bulb: "M9 21h6m-6-4h6v-2c0-2 4-3 4-7a7 7 0 0 0-14 0c0 4 4 5 4 7v2Z", sparkle: "m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z",
};
export function Icon({ name = "shield", className = "h-5 w-5" }: { name?: keyof typeof paths; className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
