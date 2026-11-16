import { pageMetadata } from "@/lib/page-metadata";
import localFont from "next/font/local";
import { AppShell } from "@/components/app-shell";
import { mockData } from "@/lib/mock-data";
import "./globals.css";

const inter = localFont({ src: "./fonts/InterVariable.woff2", weight: "100 900", variable: "--font-inter", display: "swap" });
export const metadata = pageMetadata("home");
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ru" className={inter.variable}><body className="antialiased"><AppShell customers={mockData.customers} recipients={mockData.recipients}>{children}</AppShell></body></html>;
}
