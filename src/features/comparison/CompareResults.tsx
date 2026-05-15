"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeftRight,
  Star,
  BadgeCheck,
  Minus,
  RotateCcw,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getScoreColor, getRecommendationColor } from "@/utils/helpers";
import type { AnalysisResult, ComparisonResult, ComparisonVerdict } from "@/types";
import { toast } from "sonner";

function getTranslatedRecommendation(t: ReturnType<typeof useTranslations>, rec: string): string {
  switch (rec) {
    case "BUY": return t("recBuy");
    case "DON'T BUY": return t("recDontBuy");
    case "ONLY IF": return t("recOnlyIf");
    default: return rec;
  }
}

interface CompareResultsProps {
  result: ComparisonResult;
  onReset: () => void;
}

export function CompareResults({ result, onReset }: CompareResultsProps) {
  const t = useTranslations("compare");
  const { product_a, product_b, verdict } = result;

  function handleShare() {
    const text = `BuyRight AI Comparison: ${product_a.product_name} (${product_a.score}/100) vs ${product_b.product_name} (${product_b.score}/100) — Winner: ${verdict.winner_name}`;
    if (navigator.share) {
      navigator.share({ title: "BuyRight AI Comparison", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      toast.success(t("copied"));
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-6xl space-y-6"
    >
      {/* Winner Banner */}
      <WinnerBanner verdict={verdict} productA={product_a} productB={product_b} />

      {/* Score + Header Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_1fr]">
        <ScoreCard product={product_a} side="A" isWinner={verdict.winner === "A"} />
        <div className="flex items-center justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
            VS
          </div>
        </div>
        <ScoreCard product={product_b} side="B" isWinner={verdict.winner === "B"} />
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Star className="h-4 w-4 text-amber-500" />
            {t("categoryBreakdown")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {verdict.category_comparisons.map((cat) => (
            <CategoryBar key={cat.category} comparison={cat} productA={product_a} productB={product_b} />
          ))}
        </CardContent>
      </Card>

      {/* Pros & Cons Side by Side */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ProsConsCard product={product_a} side="A" isWinner={verdict.winner === "A"} />
        <ProsConsCard product={product_b} side="B" isWinner={verdict.winner === "B"} />
      </div>

      {/* Technical Specs */}
      {(product_a.technical_specs?.length > 0 || product_b.technical_specs?.length > 0) && (
        <TechSpecsTable productA={product_a} productB={product_b} />
      )}

      {/* Common Complaints */}
      {(product_a.common_complaints?.length > 0 || product_b.common_complaints?.length > 0) && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ComplaintsCard product={product_a} side="A" />
          <ComplaintsCard product={product_b} side="B" />
        </div>
      )}

      {/* Best For / Not For */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <BestForCard product={product_a} side="A" />
        <BestForCard product={product_b} side="B" />
      </div>

      {/* AI Verdict */}
      <VerdictCard verdict={verdict} />

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-3 pb-4">
        <Button variant="outline" onClick={onReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          {t("newComparison")}
        </Button>
        <Button variant="outline" onClick={handleShare} className="gap-2">
          <Share2 className="h-4 w-4" />
          {t("shareResults")}
        </Button>
      </div>
    </motion.div>
  );
}

/* ──────────────────── Winner Banner ──────────────────── */
function WinnerBanner({
  verdict,
  productA,
  productB,
}: {
  verdict: ComparisonVerdict;
  productA: AnalysisResult;
  productB: AnalysisResult;
}) {
  const t = useTranslations("compare");
  const isTie = verdict.winner === "Tie";
  return (
    <Card className="overflow-hidden border-2 border-amber-200/60 dark:border-amber-900/30">
      <CardContent className="bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-yellow-500/5 p-6">
        <div className="flex flex-col items-center gap-3 text-center md:flex-row md:text-left">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
            {isTie ? (
              <ArrowLeftRight className="h-7 w-7 text-white" />
            ) : (
              <Trophy className="h-7 w-7 text-white" />
            )}
          </div>
          <div className="flex-1">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              {isTie ? t("tie") : t("winner")}
            </div>
            <h2 className="text-xl font-bold">
              {isTie
                ? `${productA.product_name} = ${productB.product_name}`
                : verdict.winner_name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{verdict.verdict_summary}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ──────────────────── Score Card ──────────────────── */
function ScoreCard({
  product,
  side,
  isWinner,
}: {
  product: AnalysisResult;
  side: "A" | "B";
  isWinner: boolean;
}) {
  const t = useTranslations("compare");
  const borderClass =
    isWinner
      ? "border-2 border-amber-300 dark:border-amber-700/50"
      : "border-2 border-transparent";
  const sideColor = side === "A" ? "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10" : "text-violet-600 dark:text-violet-400 bg-violet-500/10";

  return (
    <Card className={borderClass}>
      <CardContent className="p-4">
        {isWinner && (
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <Trophy className="h-3.5 w-3.5" />
            {t("winner")}
          </div>
        )}
        <div className={`mb-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${sideColor}`}>
          {side === "A" ? t("productA") : t("productB")}
        </div>
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold leading-snug">{product.product_name}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {product.brand} · {product.market_position}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{product.price_range_typical}</p>
          </div>
          <div className="flex flex-col items-center shrink-0">
            <span className={`text-3xl font-extrabold ${getScoreColor(product.score)}`}>
              {product.score}
            </span>
            <span className="text-[10px] text-muted-foreground">/100</span>
          </div>
        </div>
        <div className="mt-3">
          <Badge className={`text-xs font-bold ${getRecommendationColor(product.recommendation)}`}>
            {getTranslatedRecommendation(t, product.recommendation)}
          </Badge>
        </div>
        <p className="mt-2 text-xs text-muted-foreground line-clamp-3">{product.summary}</p>
      </CardContent>
    </Card>
  );
}

/* ──────────────────── Category Bar ──────────────────── */
function CategoryBar({
  comparison,
  productA,
  productB,
}: {
  comparison: ComparisonResult["verdict"]["category_comparisons"][number];
  productA: AnalysisResult;
  productB: AnalysisResult;
}) {
  const t = useTranslations("compare");
  const maxScore = 10;
  const aWidth = (comparison.a_score / maxScore) * 100;
  const bWidth = (comparison.b_score / maxScore) * 100;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium">{comparison.category}</span>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {comparison.winner === "A" && (
            <Badge variant="outline" className="h-5 border-indigo-300 text-indigo-600 dark:text-indigo-400">
              {productA.product_name.split(" ")[0]} {t("winsLabel")}
            </Badge>
          )}
          {comparison.winner === "B" && (
            <Badge variant="outline" className="h-5 border-violet-300 text-violet-600 dark:text-violet-400">
              {productB.product_name.split(" ")[0]} {t("winsLabel")}
            </Badge>
          )}
          {comparison.winner === "Tie" && (
            <Badge variant="outline" className="h-5">{t("tie")}</Badge>
          )}
        </div>
      </div>
      <div className="space-y-1">
        {/* Product A bar */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${aWidth}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-indigo-500"
            />
          </div>
          <span className="w-8 text-right text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            {comparison.a_score}/10
          </span>
        </div>
        {/* Product B bar */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${bWidth}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              className="h-full rounded-full bg-violet-500"
            />
          </div>
          <span className="w-8 text-right text-xs font-semibold text-violet-600 dark:text-violet-400">
            {comparison.b_score}/10
          </span>
        </div>
      </div>
      {comparison.detail && (
        <p className="mt-1 text-xs text-muted-foreground">{comparison.detail}</p>
      )}
    </div>
  );
}

/* ──────────────────── Pros & Cons ──────────────────── */
function ProsConsCard({
  product,
  side,
  isWinner,
}: {
  product: AnalysisResult;
  side: "A" | "B";
  isWinner: boolean;
}) {
  const t = useTranslations("results");
  const accent = side === "A" ? "indigo" : "violet";
  return (
    <Card className={isWinner ? `border-2 border-${accent}-200 dark:border-${accent}-900/40` : ""}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <div className={`h-2 w-2 rounded-full bg-${accent}-500`} />
          {product.product_name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            {t("pros")}
          </p>
          <ul className="space-y-1">
            {product.pros.map((pro, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>
        <Separator />
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
            {t("cons")}
          </p>
          <ul className="space-y-1">
            {product.cons.map((con, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
        {product.warnings.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                {t("warnings")}
              </p>
              <ul className="space-y-1">
                {product.warnings.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* ──────────────────── Technical Specs Table ──────────────────── */
function TechSpecsTable({
  productA,
  productB,
}: {
  productA: AnalysisResult;
  productB: AnalysisResult;
}) {
  const t = useTranslations("compare");
  // Collect all unique spec names
  const allSpecs = Array.from(
    new Set([
      ...productA.technical_specs.map((s) => s.name),
      ...productB.technical_specs.map((s) => s.name),
    ]),
  );

  if (allSpecs.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("techSpecs")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="pb-2 text-left font-medium text-muted-foreground">{t("spec")}</th>
                <th className="pb-2 text-left font-medium text-indigo-600 dark:text-indigo-400">
                  {productA.product_name}
                </th>
                <th className="pb-2 text-left font-medium text-violet-600 dark:text-violet-400">
                  {productB.product_name}
                </th>
              </tr>
            </thead>
            <tbody>
              {allSpecs.map((specName) => {
                const aVal = productA.technical_specs.find((s) => s.name === specName)?.value;
                const bVal = productB.technical_specs.find((s) => s.name === specName)?.value;
                return (
                  <tr key={specName} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium text-muted-foreground">{specName}</td>
                    <td className="py-2 pr-4">
                      {aVal ?? <Minus className="h-3.5 w-3.5 text-muted-foreground/40" />}
                    </td>
                    <td className="py-2">
                      {bVal ?? <Minus className="h-3.5 w-3.5 text-muted-foreground/40" />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

/* ──────────────────── Common Complaints ──────────────────── */
function ComplaintsCard({ product, side }: { product: AnalysisResult; side: "A" | "B" }) {
  const t = useTranslations("compare");
  if (!product.common_complaints?.length) return null;
  const accent = side === "A" ? "text-indigo-600 dark:text-indigo-400" : "text-violet-600 dark:text-violet-400";
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className={`flex items-center gap-2 text-sm ${accent}`}>
          <AlertTriangle className="h-4 w-4" />
          {t("commonComplaints")} — {product.product_name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1">
          {product.common_complaints.map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
              {c}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

/* ──────────────────── Best For ──────────────────── */
function BestForCard({ product, side }: { product: AnalysisResult; side: "A" | "B" }) {
  const t = useTranslations("compare");
  const accent = side === "A" ? "text-indigo-600 dark:text-indigo-400" : "text-violet-600 dark:text-violet-400";
  const dotColor = side === "A" ? "bg-indigo-500" : "bg-violet-500";
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className={`flex items-center gap-2 text-sm ${accent}`}>
          <BadgeCheck className="h-4 w-4" />
          {product.product_name} — {t("bestFor")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {product.best_for?.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-semibold text-emerald-600">{t("idealFor")}</p>
            <ul className="space-y-1">
              {product.best_for.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dotColor}`} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
        {product.not_suitable_for?.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-semibold text-red-600">{t("notIdealFor")}</p>
            <ul className="space-y-1">
              {product.not_suitable_for.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ──────────────────── AI Verdict Card ──────────────────── */
function VerdictCard({ verdict }: { verdict: ComparisonVerdict }) {
  const t = useTranslations("compare");
  return (
    <Card className="border-2 border-indigo-200/60 dark:border-indigo-900/30">
      <CardContent className="bg-gradient-to-r from-indigo-500/5 to-violet-500/5 p-6">
        <div className="mb-3 flex items-center gap-2">
          <BadgeCheck className="h-5 w-5 text-indigo-500" />
          <h3 className="font-bold text-lg">{t("aiRecommendation")}</h3>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              {t("buyRecommendation")}
            </p>
            <p className="text-sm font-medium">{verdict.buy_recommendation}</p>
          </div>
          <Separator />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              {t("priceValue")}
            </p>
            <p className="text-sm text-muted-foreground">{verdict.price_verdict}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
