import type { Metadata, Viewport } from "next";
import "./globals.css";
import { EVENT } from "@/lib/config";

export const metadata: Metadata = {
  title: EVENT.title,
  description: EVENT.subtitle,
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
