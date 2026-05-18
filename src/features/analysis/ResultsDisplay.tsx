"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Share2,
  BarChart3,
  Tag,
  ShieldCheck,
  Copy,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  getScoreColor,
  getScoreLabel,
  getRecommendationColor,
} from "@/utils/helpers";
import type { AnalysisResult } from "@/types";
import { toast } from "sonner";

interface ResultsDisplayProps {
  result: AnalysisResult;
  checkId?: string;
  onNewAnalysis: () => void;
}

export function ResultsDisplay({ result, checkId: _checkId, onNewAnalysis }: ResultsDisplayProps) {
  const t = useTranslations("results");

  function handleShare() {
    const text = `BuyRight AI: ${result.product_name} scored ${result.score}/100 - ${result.recommendation}`;
    if (navigator.share) {
      navigator.share({ title: "BuyRight AI Analysis", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      toast.success(t("copiedToClipboard"));
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href);
    toast.success(t("linkCopied"));
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-3xl space-y-6"
    >
      {/* Score Header Card */}
      <Card className="overflow-hidden border-2 border-indigo-100 dark:border-indigo-900/30 shadow-xl shadow-indigo-500/5">
        <CardContent className="p-0">
          <div className="flex flex-col items-center gap-6 bg-gradient-to-r from-indigo-500/5 via-violet-500/5 to-purple-500/5 p-6 md:flex-row md:p-8">
            {/* Product Info */}
            <div className="flex-1 text-center md:text-left">
              <Badge variant="outline" className="mb-2">
                {result.category}
              </Badge>
              <h1 className="text-2xl font-bold md:text-3xl">
                {result.product_name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {result.brand} - {result.market_position}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("typicalPriceLabel")}: {result.price_range_typical}
              </p>
            </div>

            {/* Score Circle */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <svg className="h-28 w-28 -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted/30"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="url(#scoreGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(result.score / 100) * 327} 327`}
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={result.score > 69 ? "#10B981" : result.score > 39 ? "#F59E0B" : "#EF4444"} />
                      <stop offset="100%" stopColor={result.score > 69 ? "#059669" : result.score > 39 ? "#D97706" : "#DC2626"} />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold ${getScoreColor(result.score)}`}>
                    {result.score}
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    / 100
                  </span>
                </div>
              </div>

              <Badge
                className={`text-sm font-bold px-4 py-1 ${getRecommendationColor(result.recommendation)}`}
              >
                {result.recommendation}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {getScoreLabel(result.score)}
              </span>
            </div>
          </div>

          {/* Summary */}
          <div className="border-t px-6 py-4 md:px-8">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {result.summary}
            </p>
          </div>

          {/* Recommendation detail */}
          <div className="border-t px-6 py-4 md:px-8 bg-muted/20">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 shrink-0 text-indigo-500 mt-0.5" />
              <p className="text-sm font-medium">
                {result.recommendation_detail}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pros & Cons */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
              {t("pros")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-500">
              <XCircle className="h-5 w-5" />
              {t("cons")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.cons.map((con, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <XCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-900/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              {t("warnings")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.warnings.map((warning, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Market Position & Price */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                <BarChart3 className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("marketPosition")}</p>
                <p className="font-semibold">{result.market_position}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <Tag className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("typicalPrice")}</p>
                <p className="font-semibold">{result.price_range_typical}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                <ShieldCheck className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("category")}</p>
                <p className="font-semibold">{result.category}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alternatives */}
      {result.alternatives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-indigo-500" />
              {t("betterAlternatives")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.alternatives.map((alt, i) => (
                <div key={i}>
                  {i > 0 && <Separator className="mb-4" />}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold">{alt.name}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {alt.why_better}
                      </p>
                      <Badge variant="outline" className="mt-2">
                        {alt.price_range}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      nativeButton={false}
                      render={
                        <a
                          href={`https://www.google.com/search?q=${encodeURIComponent(alt.name + " buy")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                    >
                      {t("search")}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          onClick={onNewAnalysis}
          className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-violet-700"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {t("newAnalysis")}
        </Button>
        <Button variant="outline" onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" />
          {t("share")}
        </Button>
        <Button variant="outline" onClick={handleCopyLink}>
          <Copy className="mr-2 h-4 w-4" />
          {t("copyLink")}
        </Button>
      </div>
    </motion.div>
  );
}
