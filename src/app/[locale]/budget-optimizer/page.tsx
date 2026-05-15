"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Wallet, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BudgetOptimizerForm } from "@/features/budget-optimizer/BudgetOptimizerForm";
import { BudgetOptimizerResults } from "@/features/budget-optimizer/BudgetOptimizerResults";
import type { BudgetOptimizerResult } from "@/types";

export default function BudgetOptimizerPage() {
  const t = useTranslations("budgetOptimizer");
  const [result, setResult] = useState<BudgetOptimizerResult | null>(null);
  const [currency, setCurrencyState] = useState("€");

  function handleResult(r: BudgetOptimizerResult) {
    setResult(r);
  }

  return (
    <>
      <Header />
      <main className="flex-1 min-h-screen">
        {/* Hero */}
        <section className="relative overflow-hidden pt-20 pb-12 md:pt-28 md:pb-16">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-violet-50/60 via-transparent to-transparent dark:from-violet-950/15" />
            <div className="absolute left-1/2 top-0 -translate-x-1/2 -z-10">
              <div className="h-[500px] w-[500px] rounded-full bg-gradient-to-br from-violet-400/15 to-purple-400/15 blur-3xl" />
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50/60 px-4 py-1.5 text-sm text-violet-700 dark:border-violet-800/50 dark:bg-violet-950/30 dark:text-violet-400 mb-6"
            >
              <Wallet className="h-3.5 w-3.5" />
              {t("badge")}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
            >
              <span className="block">{t("title1")}</span>
              <span className="block mt-2 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-600 bg-clip-text text-transparent">
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

            {/* Feature pills */}
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
                  <CheckCircle2 className="h-3 w-3 text-violet-500" />
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
              <BudgetOptimizerResults
                result={result}
                currency={currency}
                onReset={() => setResult(null)}
              />
            ) : (
              <BudgetOptimizerForm
                onResult={(r) => {
                  handleResult(r);
                }}
                onCurrencyChange={setCurrencyState}
              />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
