import type { Metadata, Viewport } from "next";
import { Cairo, IBM_Plex_Sans_Arabic } from "next/font/google";
import { Toaster } from "sonner";
import { AppProviders } from "@/lib/providers/app-providers";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["600", "700", "800"],
  display: "swap",
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  variable: "--font-plex-arabic",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "حصادي | النظام الزراعي الذكي",
  description: "نظام حصادي الزراعي المتكامل لإدارة المزارع والمحاسبة والمقاولين",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "حصادي",
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${cairo.variable} ${plexArabic.variable} antialiased`}>
        <AppProviders>
          {children}
          <Toaster
            position="top-center"
            richColors
            dir="rtl"
            toastOptions={{ style: { fontFamily: "var(--font-sans)" } }}
          />
        </AppProviders>
      </body>
    </html>
  );
}
