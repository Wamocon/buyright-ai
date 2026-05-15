import { SCORE_THRESHOLDS } from "@/config/constants";

export function getScoreColor(score: number): string {
  if (score <= SCORE_THRESHOLDS.low) return "text-red-500";
  if (score <= SCORE_THRESHOLDS.mid) return "text-amber-500";
  return "text-emerald-500";
}

export function getScoreBgColor(score: number): string {
  if (score <= SCORE_THRESHOLDS.low) return "bg-red-500";
  if (score <= SCORE_THRESHOLDS.mid) return "bg-amber-500";
  return "bg-emerald-500";
}

export function getScoreGradient(score: number): string {
  if (score <= SCORE_THRESHOLDS.low)
    return "from-red-500 to-red-600";
  if (score <= SCORE_THRESHOLDS.mid)
    return "from-amber-400 to-amber-500";
  return "from-emerald-400 to-emerald-500";
}

export function getScoreLabel(score: number): string {
  if (score <= 20) return "Very Poor";
  if (score <= SCORE_THRESHOLDS.low) return "Poor";
  if (score <= 55) return "Below Average";
  if (score <= SCORE_THRESHOLDS.mid) return "Average";
  if (score <= 85) return "Good";
  return "Excellent";
}

export function getRecommendationColor(rec: string): string {
  switch (rec) {
    case "BUY":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    case "DON'T BUY":
      return "bg-red-500/10 text-red-600 border-red-500/20";
    case "ONLY IF":
      return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}
