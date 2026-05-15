export const APP_CONFIG = {
  name: "BuyRight AI",
  claim: "Fehlkaufe vermeiden. Besser kaufen.",
  claimEn: "Avoid bad purchases. Buy smarter.",
  description:
    "KI-gestutzte Produktanalyse vor dem Kauf. Score, Empfehlung, Alternativen.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;

export const BRAND = {
  colors: {
    primary: "#4F46E5",
    primaryLight: "#6366F1",
    violet: "#7C3AED",
    accent: "#F59E0B",
    success: "#10B981",
    warning: "#F97316",
    danger: "#EF4444",
    bgLight: "#F9FAFB",
    bgDark: "#111827",
  },
  fonts: {
    sans: "Inter",
    heading: "Plus Jakarta Sans",
  },
} as const;

export const LIMITS = {
  free: {
    dailyChecks: 3,
    maxAlternatives: 2,
    pdfExport: false,
    history: false,
  },
  pro: {
    dailyChecks: 1000,
    maxAlternatives: 5,
    pdfExport: true,
    history: true,
  },
} as const;

export const SCORE_THRESHOLDS = {
  low: 39,
  mid: 69,
  high: 100,
} as const;

export const UPLOAD_CONFIG = {
  maxSizeMB: 10,
  maxSizeBytes: 10 * 1024 * 1024,
  acceptedFormats: ["image/jpeg", "image/png", "image/webp"] as const,
  acceptedExtensions: [".jpg", ".jpeg", ".png", ".webp"] as const,
} as const;
