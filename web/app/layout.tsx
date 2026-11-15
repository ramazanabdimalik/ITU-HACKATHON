import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SafeTransfer",
  description: "A safer way to send money. Coming soon.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
