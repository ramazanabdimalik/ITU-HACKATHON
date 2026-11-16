import { pageMetadata } from "@/lib/page-metadata";
import { AppShell } from "@/components/app-shell";
import { mockData } from "@/lib/mock-data";
import "./globals.css";

export const metadata = pageMetadata("home");
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ru"><body className="antialiased"><AppShell customers={mockData.customers} recipients={mockData.recipients}>{children}</AppShell></body></html>;
}
