import type { Metadata } from "next";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "sonner";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: {
    default: "BuyRight AI - Stop guessing. Start buying smart.",
    template: "%s | BuyRight AI",
  },
  description:
    "AI-powered product analysis. Get instant scores, pros & cons, and clear buy recommendations before you purchase.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    siteName: "BuyRight AI",
    title: "BuyRight AI - Stop guessing. Start buying smart.",
    description: "AI-powered product analysis before you buy.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BuyRight AI",
    description: "AI-powered product analysis. Buy right, every time.",
  },
  robots: { index: true, follow: true },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "de")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider>
        {children}
        <Toaster position="top-center" richColors />
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
