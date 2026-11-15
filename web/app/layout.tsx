import type { Metadata } from "next";
import localFont from "next/font/local";
import { AppShell } from "@/components/app-shell";
import { mockData } from "@/lib/mock-data";
import "./globals.css";

const inter = localFont({ src: "./fonts/InterVariable.woff2", variable: "--font-inter", display: "swap" });
export const metadata: Metadata = { title: "SafeTransfer", description: "SafeTransfer · ITU Hackathon 2026" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ru" className={inter.variable}><body className="antialiased"><AppShell customers={mockData.customers}>{children}</AppShell></body></html>;
}
