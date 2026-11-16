import { pageMetadata } from "@/lib/page-metadata";
import { Inter } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { mockData } from "@/lib/mock-data";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic", "cyrillic-ext"], variable: "--font-inter", display: "swap" });
export const metadata = pageMetadata("transfer");
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ru" className={inter.variable}><body className="antialiased"><AppShell customers={mockData.customers} recipients={mockData.recipients}>{children}</AppShell></body></html>;
}
