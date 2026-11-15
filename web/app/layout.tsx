import { pageMetadata } from "@/lib/page-metadata";
import localFont from "next/font/local";
import { AppShell } from "@/components/app-shell";
import { mockData } from "@/lib/mock-data";
import "./globals.css";

const inter = localFont({ src: "./fonts/InterVariable.woff2", variable: "--font-inter", display: "swap" });
export const metadata = pageMetadata("transfer");
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ru" className={inter.variable}><body className="antialiased"><AppShell customers={mockData.customers}>{children}</AppShell></body></html>;
}
