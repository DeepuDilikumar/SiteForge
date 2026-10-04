import type { Metadata, Viewport } from "next";
import { Google_Sans_Flex } from "next/font/google";
import { Suspense } from "react";
import { QueryToasts } from "@/components/QueryToasts";
import { ICON_FONT_HREF } from "@/components/ui/Icon";
import { ToastProvider } from "@/components/ui/Toast";
import { getTheme } from "@/lib/theme-server";
import "./globals.css";

const brand = Google_Sans_Flex({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-brand",
  display: "swap",
  adjustFontFallback: false,
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
});

export const metadata: Metadata = {
  title: { default: "SiteForge", template: "%s · SiteForge" },
  description: "Find businesses without websites. Build them one in a minute. Send the link.",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { themeColor: "#ffffff" };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const theme = await getTheme();
  return (
    <html lang="en" className={brand.variable} data-theme={theme}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={ICON_FONT_HREF} />
      </head>
      <body className="min-h-dvh bg-bg text-text antialiased">
        <ToastProvider>
          {children}
          <Suspense fallback={null}>
            <QueryToasts />
          </Suspense>
        </ToastProvider>
      </body>
    </html>
  );
}
