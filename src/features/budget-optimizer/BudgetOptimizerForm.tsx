"use client";

import { useState, useTransition, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Loader2, Wallet, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { budgetOptimizerAction } from "@/actions/budget-optimizer";
import type { BudgetOptimizerResult } from "@/types";
import { toast } from "sonner";

const budgetSteps = [
  { en: "Estimating product prices...", de: "Produktpreise werden geschätzt..." },
  { en: "Calculating value scores...", de: "Nutzenbewertungen werden berechnet..." },
  { en: "Optimizing purchase order...", de: "Kaufreihenfolge wird optimiert..." },
  { en: "Finding better alternatives...", de: "Bessere Alternativen werden gesucht..." },
];

const CURRENCIES = [
  { value: "€", label: "EUR (€)" },
  { value: "$", label: "USD ($)" },
  { value: "£", label: "GBP (£)" },
  { value: "CHF", label: "CHF" },
];

interface BudgetOptimizerFormProps {
  onResult: (result: BudgetOptimizerResult) => void;
  onCurrencyChange?: (currency: string) => void;
}

export function BudgetOptimizerForm({ onResult, onCurrencyChange }: BudgetOptimizerFormProps) {
  const t = useTranslations("budgetOptimizer");
  const locale = useLocale();
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState("€");
  const [items, setItems] = useState<string[]>(["", ""]);
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleCurrencyChange(val: string) {
    if (!val) return;
    setCurrency(val);
    onCurrencyChange?.(val);
  }

  function addItem() {
    if (items.length >= 15) return;
    setItems((prev) => [...prev, ""]);
    setTimeout(() => inputRefs.current[items.length]?.focus(), 50);
  }

  function removeItem(i: number) {
    if (items.length <= 2) return;
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateItem(i: number, val: string) {
    setItems((prev) => prev.map((item, idx) => (idx === i ? val : item)));
  }

  function handleKeyDown(e: React.KeyboardEvent, i: number) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (i === items.length - 1) addItem();
      else inputRefs.current[i + 1]?.focus();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validItems = items.filter((s) => s.trim());
    if (!budget || validItems.length < 2) return;

    setStep(0);
    const interval = setInterval(() => setStep((p) => Math.min(p + 1, budgetSteps.length - 1)), 1600);

    const fd = new FormData();
    fd.set("budget", budget);
    fd.set("currency", currency);
    fd.set("items", validItems.join("\n"));
    fd.set("locale", locale);

    startTransition(async () => {
      const res = await budgetOptimizerAction(fd);
      clearInterval(interval);
      if (res.success && res.data) {
        onResult(res.data);
      } else if (res.rateLimitExceeded) {
        toast.error(t("limitReached"));
      } else {
        toast.error(res.error ?? t("failed"));
      }
    });
  }

  const validCount = items.filter((s) => s.trim()).length;
  const currentStep = budgetSteps[step];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Budget input */}
        <div className="flex gap-3">
          <div className="w-32 shrink-0">
            <Label className="text-xs text-muted-foreground mb-1.5 block">{t("currency")}</Label>
              <Select value={currency} onValueChange={handleCurrencyChange}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground mb-1.5 block">{t("budgetLabel")}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                {currency}
              </span>
              <Input
                type="number"
                min="1"
                step="0.01"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="500"
                className="h-12 pl-9 text-base"
                disabled={isPending}
              />
            </div>
          </div>
        </div>

        {/* Shopping list */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">
            {t("itemsLabel")} ({validCount}/15)
          </Label>
          <div className="space-y-2">
            {items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-2 items-center"
              >
                <span className="w-6 text-center text-sm font-medium text-muted-foreground shrink-0">
                  {i + 1}
                </span>
                <Input
                  ref={(el) => { inputRefs.current[i] = el; }}
                  value={item}
                  onChange={(e) => updateItem(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  placeholder={t("itemPlaceholder", { num: i + 1 })}
                  className="h-10"
                  disabled={isPending}
                />
                {items.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(i)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
          {items.length < 15 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              className="mt-2 gap-1.5 text-muted-foreground"
              disabled={isPending}
            >
              <Plus className="h-4 w-4" />
              {t("addItem")}
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isPending ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-2"
            >
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-violet-100 dark:bg-violet-950/30 flex items-center justify-center">
                  <Wallet className="h-8 w-8 text-violet-500" />
                </div>
                <Loader2 className="absolute -right-1 -top-1 h-5 w-5 animate-spin text-violet-500" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {locale === "de" ? currentStep?.de : currentStep?.en}
              </p>
              <div className="flex gap-1">
                {budgetSteps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-8 rounded-full transition-all duration-500 ${
                      i <= step ? "bg-violet-500" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25 gap-2"
                disabled={isPending || !budget || validCount < 2}
              >
                <Wallet className="h-4 w-4" />
                {t("optimizeButton")}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
}
