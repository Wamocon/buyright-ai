"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Shield,
  ShieldAlert,
  ShieldX,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Star,
  TrendingDown,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { FakeDetectorResult } from "@/types";

interface FakeDetectorResultsProps {
  result: FakeDetectorResult;
  onReset: () => void;
}

function TrustGauge({ score }: { score: number }) {
  const color =
    score >= 70 ? "text-green-500" :
    score >= 40 ? "text-amber-500" :
    "text-red-500";
  const bg =
    score >= 70 ? "from-green-400 to-emerald-500" :
    score >= 40 ? "from-amber-400 to-orange-500" :
    "from-red-400 to-rose-600";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-32 w-32">
        <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/20" />
          <circle
            cx="60" cy="60" r="50" fill="none"
            stroke="url(#trustGrad)" strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 314} 314`}
          />
          <defs>
            <linearGradient id="trustGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" className={`stop-color-current ${bg.split(" ")[0]}`} />
              <stop offset="100%" className={`stop-color-current ${bg.split(" ")[2]}`} />
            </linearGradient>
          </defs>
        </svg>
        <div className={`absolute inset-0 flex flex-col items-center justify-center ${color}`}>
          <span className="text-3xl font-bold">{score}</span>
          <span className="text-xs font-medium opacity-70">/100</span>
        </div>
      </div>
    </div>
  );
}

export function FakeDetectorResults({ result, onReset }: FakeDetectorResultsProps) {
  const t = useTranslations("fakeDetector");

  const verdictConfig = {
    SAFE: {
      icon: Shield,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
      badge: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
      label: t("verdictSafe"),
    },
    SUSPICIOUS: {
      icon: ShieldAlert,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
      badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
      label: t("verdictSuspicious"),
    },
    LIKELY_FAKE: {
      icon: ShieldX,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
      badge: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
      label: t("verdictFake"),
    },
  };

  const riskConfig = {
    LOW: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
    MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
    CRITICAL: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
  };

  const vc = verdictConfig[result.verdict] ?? verdictConfig.SUSPICIOUS;
  const VerdictIcon = vc.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto space-y-5"
    >
      {/* Header card */}
      <Card className={`border ${vc.bg}`}>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <TrustGauge score={result.trust_score} />
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${vc.badge}`}>
                  <VerdictIcon className="h-4 w-4" />
                  {vc.label}
                </span>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${riskConfig[result.risk_level]}`}>
                  {t("riskLabel")}: {result.risk_level}
                </span>
              </div>
              <h2 className="text-xl font-bold mb-2">{result.product_name}</h2>
              <p className="text-sm text-muted-foreground">{result.summary}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Red flags */}
        {result.red_flags.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-red-600 dark:text-red-400">
                <XCircle className="h-4 w-4" />
                {t("redFlags")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {result.red_flags.map((flag, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{flag}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Positive signals */}
        {result.positive_signals.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                {t("positiveSignals")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {result.positive_signals.map((sig, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span>{sig}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Review analysis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Star className="h-4 w-4 text-amber-500" />
            {t("reviewAnalysis")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">{t("reviewAuthenticity")}</p>
              <Progress value={result.review_analysis.authenticity_score} className="h-2" />
              <p className="text-xs font-medium mt-1">{result.review_analysis.authenticity_score}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">{t("estimatedFake")}</p>
              <Progress
                value={result.review_analysis.fake_percentage_estimate}
                className="h-2 [&>*]:bg-red-500"
              />
              <p className="text-xs font-medium mt-1 text-red-600">
                ~{result.review_analysis.fake_percentage_estimate}%
              </p>
            </div>
          </div>
          {result.review_analysis.suspicious_patterns.length > 0 && (
            <div className="space-y-1.5">
              {result.review_analysis.suspicious_patterns.map((pattern, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                  {pattern}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Price analysis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingDown className="h-4 w-4 text-blue-500" />
            {t("priceAnalysis")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className={
                result.price_analysis.verdict === "NORMAL"
                  ? "border-green-300 text-green-700 dark:text-green-400"
                  : result.price_analysis.verdict === "SUSPICIOUS"
                  ? "border-amber-300 text-amber-700 dark:text-amber-400"
                  : "border-red-300 text-red-700 dark:text-red-400"
              }
            >
              {result.price_analysis.verdict}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{result.price_analysis.detail}</p>
        </CardContent>
      </Card>

      {/* Recommendation */}
      <Card className="border-2 border-dashed border-border">
        <CardContent className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            {t("recommendationLabel")}
          </p>
          <p className="text-base font-medium">{result.recommendation}</p>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        onClick={onReset}
        className="w-full gap-2"
      >
        <RotateCcw className="h-4 w-4" />
        {t("newCheck")}
      </Button>
    </motion.div>
  );
}
