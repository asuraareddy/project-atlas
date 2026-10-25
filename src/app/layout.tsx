import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PwaRegister } from "@/components/pwa/PwaRegister";

export const viewport: Viewport = {
  themeColor: "#7e0ac2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Project Atlas — UK Multi-Gaming Platform",
  description: "Next-generation gaming platform featuring Matka, Carrom, Ludo, and Skill Games with direct crypto QR deposits and server-authoritative integrity.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full flex flex-col bg-[#1f1f1f] text-white selection:bg-[#7e0ac2] selection:text-white">
        <PwaRegister />
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
