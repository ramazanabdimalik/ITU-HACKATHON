export function Icon({ name = "shield", className = "h-5 w-5" }: { name?: "shield" | "arrow" | "check" | "alert" | "clock" | "card" | "close"; className?: string }) {
  const paths = {
    shield: "M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3Zm-4 9 3 3 5-6",
    arrow: "M5 12h14m-5-5 5 5-5 5",
    check: "m5 12 4 4L19 6",
    alert: "m12 3 10 18H2L12 3Zm0 5v6m0 3v1",
    clock: "M12 8v4l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
    card: "M3 8h18M5 16h4M3 5h18v14H3V5Z",
    close: "m6 6 12 12M6 18 18 6",
  };
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
