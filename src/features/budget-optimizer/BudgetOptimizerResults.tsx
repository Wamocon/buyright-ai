"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  CheckCircle2,
  XCircle,
  Minus,
  Wallet,
  TrendingUp,
  Lightbulb,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { BudgetOptimizerResult, BudgetItem } from "@/types";

interface BudgetOptimizerResultsProps {
  result: BudgetOptimizerResult;
  currency: string;
  onReset: () => void;
}

const priorityConfig = {
  MUST_BUY: {
    icon: CheckCircle2,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
    badge: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-green-200",
    label: "MUST BUY",
  },
  NICE_TO_HAVE: {
    icon: Minus,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200",
    label: "NICE TO HAVE",
  },
  SKIP: {
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/10 border-red-200/50 dark:border-red-800/50",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border-red-200",
    label: "SKIP",
  },
};

function ItemCard({ item, currency }: { item: BudgetItem; currency: string }) {
  const t = useTranslations("budgetOptimizer");
  const config = priorityConfig[item.priority];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-4 ${config.bg}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${config.color}`} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm truncate">{item.name}</h3>
              <span className={`text-xs font-semibold rounded-full px-2 py-0.5 border ${config.badge}`}>
                {config.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{item.reason}</p>
            {item.alternative_suggestion && (
              <div className="mt-2 flex items-start gap-1.5 text-xs text-blue-600 dark:text-blue-400">
                <ArrowRight className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>{item.alternative_suggestion}</span>
              </div>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-bold text-base">{currency}{item.estimated_price.toLocaleString()}</p>
          <div className="mt-1">
            <p className="text-[10px] text-muted-foreground">{t("valueScore")}</p>
            <Progress value={item.value_score} className="h-1.5 w-20 mt-1" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function BudgetOptimizerResults({ result, currency, onReset }: BudgetOptimizerResultsProps) {
  const t = useTranslations("budgetOptimizer");

  const mustBuy = result.items.filter((i) => i.priority === "MUST_BUY");
  const niceToHave = result.items.filter((i) => i.priority === "NICE_TO_HAVE");
  const skip = result.items.filter((i) => i.priority === "SKIP");

  const budgetUsed = (result.optimized_total / result.total_budget) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto space-y-5"
    >
      {/* Budget overview */}
      <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border-violet-200 dark:border-violet-800">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="flex-1 w-full">
              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <p className="text-xs text-muted-foreground">{t("optimizedTotal")}</p>
                  <p className="text-3xl font-bold text-violet-700 dark:text-violet-300">
                    {currency}{result.optimized_total.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{t("totalBudget")}</p>
                  <p className="text-xl font-semibold">{currency}{result.total_budget.toLocaleString()}</p>
                </div>
              </div>
              <Progress
                value={Math.min(budgetUsed, 100)}
                className={`h-2.5 ${budgetUsed > 100 ? "[&>*]:bg-red-500" : "[&>*]:bg-violet-500"}`}
              />
              <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
                <span>{Math.min(100, Math.round(budgetUsed))}% {t("budgetUsed")}</span>
                {result.savings > 0 && (
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    {t("saves")} {currency}{result.savings.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{result.summary}</p>
        </CardContent>
      </Card>

      {/* Top advice */}
      {result.top_advice && (
        <Card className="border-dashed">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="rounded-lg bg-amber-100 dark:bg-amber-950/30 p-2 shrink-0">
              <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                {t("topAdvice")}
              </p>
              <p className="text-sm">{result.top_advice}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-600">{mustBuy.length}</p>
            <p className="text-xs text-muted-foreground">{t("mustBuyCount")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Minus className="h-5 w-5 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-amber-600">{niceToHave.length}</p>
            <p className="text-xs text-muted-foreground">{t("niceToHaveCount")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="h-5 w-5 text-red-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-red-600">{skip.length}</p>
            <p className="text-xs text-muted-foreground">{t("skipCount")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Prioritized items */}
      {mustBuy.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            {t("mustBuySection")} ({mustBuy.length})
          </h3>
          <div className="space-y-2">
            {mustBuy.map((item, i) => (
              <ItemCard key={i} item={item} currency={currency} />
            ))}
          </div>
        </div>
      )}

      {niceToHave.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 text-amber-700 dark:text-amber-400">
            <TrendingUp className="h-4 w-4" />
            {t("niceToHaveSection")} ({niceToHave.length})
          </h3>
          <div className="space-y-2">
            {niceToHave.map((item, i) => (
              <ItemCard key={i} item={item} currency={currency} />
            ))}
          </div>
        </div>
      )}

      {skip.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 text-red-700 dark:text-red-400">
            <XCircle className="h-4 w-4" />
            {t("skipSection")} ({skip.length})
          </h3>
          <div className="space-y-2">
            {skip.map((item, i) => (
              <ItemCard key={i} item={item} currency={currency} />
            ))}
          </div>
        </div>
      )}

      <Button variant="outline" onClick={onReset} className="w-full gap-2">
        <RotateCcw className="h-4 w-4" />
        {t("newOptimization")}
      </Button>
    </motion.div>
  );
}
