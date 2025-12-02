import type { Metadata } from "next";
import { Geist, Geist_Mono, Literata, Merriweather } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Police serif optimisée pour la lecture - Literata (conçue pour les e-readers)
const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
});

// Alternative serif - Merriweather (très lisible)
const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Lisa - AI Reading Assistant",
  description: "Learn to read with joy - AI-powered reading assistant for children",
  icons: {
    icon: "/lisa-icon-min-300.png",
    apple: "/lisa-icon-min-300.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${literata.variable} ${merriweather.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            {children}
            <Toaster position="top-center" />
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
