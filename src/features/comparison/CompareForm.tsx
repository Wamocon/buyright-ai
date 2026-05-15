"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Search, ArrowLeftRight, Link2, Type, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { compareAction } from "@/actions/compare";
import type { ComparisonResult } from "@/types";
import { toast } from "sonner";

interface CompareFormProps {
  onResult: (result: ComparisonResult) => void;
}

interface ProductInput {
  tab: "url" | "text";
  url: string;
  text: string;
}

export function CompareForm({ onResult }: CompareFormProps) {
  const t = useTranslations("compare");
  const locale = useLocale();
  const [productA, setProductA] = useState<ProductInput>({ tab: "url", url: "", text: "" });
  const [productB, setProductB] = useState<ProductInput>({ tab: "url", url: "", text: "" });
  const [isPending, startTransition] = useTransition();
  const [stepIndex, setStepIndex] = useState(0);

  const ANALYSIS_STEPS = [t("step1"), t("step2"), t("step3"), t("step4")];

  const getActiveValue = (p: ProductInput) => (p.tab === "url" ? p.url.trim() : p.text.trim());
  const canSubmit =
    !isPending && getActiveValue(productA).length >= 3 && getActiveValue(productB).length >= 3;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    const fd = new FormData();
    fd.append("locale", locale);
    fd.append("type_a", productA.tab);
    fd.append("value_a", getActiveValue(productA));
    fd.append("type_b", productB.tab);
    fd.append("value_b", getActiveValue(productB));

    // Cycle through steps during analysis
    let step = 0;
    setStepIndex(0);
    const interval = setInterval(() => {
      step = Math.min(step + 1, ANALYSIS_STEPS.length - 1);
      setStepIndex(step);
    }, 4000);

    startTransition(async () => {
      const result = await compareAction(fd);
      clearInterval(interval);
      if (result.success && result.data) {
        onResult(result.data);
      } else if (result.rateLimitExceeded) {
        toast.error(result.error ?? t("limitReached"));
      } else {
        toast.error(result.error ?? t("failed"));
      }
    });
  }

  return (
    <div className="mx-auto max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 text-center"
      >
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400">
          <ArrowLeftRight className="h-4 w-4" />
          {t("badge")}
        </div>
        <h1 className="text-3xl font-bold md:text-4xl">{t("title")}</h1>
        <p className="mt-3 text-muted-foreground">
          {t("subtitle")}
        </p>
      </motion.div>

      {isPending ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center gap-6 py-24"
        >
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-4 border-indigo-500/20" />
            <div className="absolute inset-0 h-20 w-20 animate-spin rounded-full border-4 border-transparent border-t-indigo-500" />
            <Sparkles className="absolute inset-0 m-auto h-7 w-7 text-indigo-500" />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">{ANALYSIS_STEPS[stepIndex]}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("takesTime")}
            </p>
          </div>
          <div className="flex gap-1.5">
            {ANALYSIS_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-8 rounded-full transition-colors duration-500 ${
                  i <= stepIndex ? "bg-indigo-500" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_1fr]">
            {/* Product A */}
            <ProductInputCard
              label={t("productA")}
              value={productA}
              onChange={setProductA}
              colorClass="border-indigo-200 dark:border-indigo-900/40"
              badgeClass="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
            />

            {/* VS divider */}
            <div className="flex items-center justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white shadow-lg shadow-indigo-500/30">
                VS
              </div>
            </div>

            {/* Product B */}
            <ProductInputCard
              label={t("productB")}
              value={productB}
              onChange={setProductB}
              colorClass="border-violet-200 dark:border-violet-900/40"
              badgeClass="bg-violet-500/10 text-violet-600 dark:text-violet-400"
            />
          </div>

          <div className="mt-6 text-center">
            <Button
              type="submit"
              disabled={!canSubmit}
              size="lg"
              className="gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 px-10 text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-violet-700"
            >
              <Search className="h-4 w-4" />
              {t("compareButton")}
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              {t("countNote")}
            </p>
          </div>
        </form>
      )}
    </div>
  );
}

interface ProductInputCardProps {
  label: string;
  value: ProductInput;
  onChange: (v: ProductInput) => void;
  colorClass: string;
  badgeClass: string;
}

function ProductInputCard({ label, value, onChange, colorClass, badgeClass }: ProductInputCardProps) {
  const t = useTranslations("compare");
  return (
    <Card className={`border-2 ${colorClass}`}>
      <CardContent className="p-4">
        <div className={`mb-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}>
          {label}
        </div>
        <Tabs
          value={value.tab}
          onValueChange={(v) => onChange({ ...value, tab: v as "url" | "text" })}
        >
          <TabsList className="mb-3 w-full">
            <TabsTrigger value="url" className="flex-1 gap-1.5">
              <Link2 className="h-3.5 w-3.5" />
              {t("urlTab")}
            </TabsTrigger>
            <TabsTrigger value="text" className="flex-1 gap-1.5">
              <Type className="h-3.5 w-3.5" />
              {t("textTab")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="url" className="mt-0">
            <div className="space-y-1.5">
              <Label htmlFor={`url-${label}`} className="text-xs text-muted-foreground">
                {t("urlLabel")}
              </Label>
              <Input
                id={`url-${label}`}
                type="url"
                placeholder={t("urlPlaceholder")}
                value={value.url}
                onChange={(e) => onChange({ ...value, url: e.target.value })}
                className="h-10"
              />
            </div>
          </TabsContent>
          <TabsContent value="text" className="mt-0">
            <div className="space-y-1.5">
              <Label htmlFor={`text-${label}`} className="text-xs text-muted-foreground">
                {t("textLabel")}
              </Label>
              <Textarea
                id={`text-${label}`}
                placeholder={t("textPlaceholder")}
                value={value.text}
                onChange={(e) => onChange({ ...value, text: e.target.value })}
                className="min-h-[80px] resize-none"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
