import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BuyRight AI - Fehlkaufe vermeiden. Besser kaufen.",
    template: "%s | BuyRight AI",
  },
  description:
    "KI-gestutzte Produktanalyse vor dem Kauf. Score, Empfehlung, Alternativen - in Sekunden.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    siteName: "BuyRight AI",
    title: "BuyRight AI - Fehlkaufe vermeiden. Besser kaufen.",
    description:
      "KI-gestutzte Produktanalyse vor dem Kauf. Score, Empfehlung, Alternativen.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BuyRight AI",
    description: "KI-gestutzte Produktanalyse vor dem Kauf.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      suppressHydrationWarning
      className={`${inter.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider>
          {children}
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
