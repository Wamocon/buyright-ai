"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ShieldAlert, ShieldCheck, Info } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FakeDetectorForm } from "@/features/fake-detector/FakeDetectorForm";
import { FakeDetectorResults } from "@/features/fake-detector/FakeDetectorResults";
import type { FakeDetectorResult } from "@/types";

export default function FakeDetectorPage() {
  const t = useTranslations("fakeDetector");
  const [result, setResult] = useState<FakeDetectorResult | null>(null);

  return (
    <>
      <Header />
      <main className="flex-1 min-h-screen">
        {/* Hero */}
        <section className="relative overflow-hidden pt-20 pb-12 md:pt-28 md:pb-16">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-50/60 via-transparent to-transparent dark:from-amber-950/15" />
            <div className="absolute left-1/2 top-0 -translate-x-1/2 -z-10">
              <div className="h-[500px] w-[500px] rounded-full bg-gradient-to-br from-amber-400/15 to-orange-400/15 blur-3xl" />
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/60 px-4 py-1.5 text-sm text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-400 mb-6"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              {t("badge")}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
            >
              <span className="block">{t("title1")}</span>
              <span className="block mt-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                {t("title2")}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground"
            >
              {t("subtitle")}
            </motion.p>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-5 flex flex-wrap justify-center gap-3"
            >
              {[t("feat1"), t("feat2"), t("feat3")].map((feat) => (
                <span
                  key={feat}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1.5 border border-border/50"
                >
                  <ShieldCheck className="h-3 w-3 text-amber-500" />
                  {feat}
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Form / Results */}
        <section className="pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {result ? (
              <FakeDetectorResults result={result} onReset={() => setResult(null)} />
            ) : (
              <FakeDetectorForm onResult={setResult} />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
