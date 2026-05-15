import { z } from "zod";

export const fakeDetectorReviewAnalysisSchema = z.object({
  authenticity_score: z.number().min(0).max(100).default(50),
  fake_percentage_estimate: z.number().min(0).max(100).default(0),
  suspicious_patterns: z.array(z.string()).default([]),
});

export const fakeDetectorPriceAnalysisSchema = z.object({
  verdict: z.enum(["NORMAL", "SUSPICIOUS", "TOO_GOOD_TO_BE_TRUE"]).catch("NORMAL"),
  detail: z.string().default(""),
});

export const fakeDetectorResultSchema = z.object({
  product_name: z.string().min(1),
  trust_score: z.number().min(0).max(100),
  risk_level: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).catch("MEDIUM"),
  verdict: z.enum(["SAFE", "SUSPICIOUS", "LIKELY_FAKE"]).catch("SUSPICIOUS"),
  summary: z.string().min(1),
  red_flags: z.array(z.string()).default([]),
  positive_signals: z.array(z.string()).default([]),
  review_analysis: fakeDetectorReviewAnalysisSchema.default({
    authenticity_score: 50,
    fake_percentage_estimate: 0,
    suspicious_patterns: [],
  }),
  price_analysis: fakeDetectorPriceAnalysisSchema.default({
    verdict: "NORMAL",
    detail: "",
  }),
  seller_indicators: z.array(z.string()).default([]),
  recommendation: z.string().default(""),
});

export type FakeDetectorResultSchema = z.infer<typeof fakeDetectorResultSchema>;
