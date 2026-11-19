import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { TenantProvider } from "@/components/tenant/TenantContext";
import { TenantBrandProvider } from "@/components/tenant/TenantBrandProvider";
import { OperatorPreviewBar } from "@/components/tenant/OperatorPreviewBar";

export const viewport: Viewport = {
  themeColor: "#7e0ac2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Project Atlas — Multi-Gaming B2B Enterprise Platform",
  description: "Next-generation multi-tenant gaming platform featuring Matka, Carrom, Ludo, and 8-Ball Pool Pro with configurable B2B white-label packages.",
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
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('atlas_theme');document.documentElement.classList.add(t==='dark'?'dark':'light')}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--color-neutral)] text-[var(--color-on-surface)] selection:bg-[var(--tenant-primary,#317CFF)] selection:text-white transition-colors duration-200">
        <ThemeProvider>
          <TenantProvider>
            <TenantBrandProvider>
              <PwaRegister />
              <Suspense fallback={null}>
                <OperatorPreviewBar />
              </Suspense>
              <Suspense fallback={<div className="h-16 bg-[var(--color-surface)]" />}>
                <Header />
              </Suspense>
              <main className="flex-1 flex flex-col">{children}</main>
              <Footer />
            </TenantBrandProvider>
          </TenantProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
